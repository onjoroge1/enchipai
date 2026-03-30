import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { EmailCampaignStatus } from '@/lib/prisma-types';
import { sendEmail } from '@/lib/email';

const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  html: z.string().min(1).optional(),
  recipientType: z.enum(['ALL_GUESTS', 'BOOKED_GUESTS', 'SPECIFIC_USERS']).optional(),
  recipientFilter: z.any().optional(),
  status: z.nativeEnum(EmailCampaignStatus).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
      include: {
        logs: {
          take: 100,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!campaign) {
      return apiError('Email campaign not found', 404);
    }

    return apiResponse(campaign);
  } catch (error) {
    console.error('Get email campaign error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = updateCampaignSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;
    const updateData: any = { ...data };
    if (data.scheduledAt) {
      updateData.scheduledAt = new Date(data.scheduledAt);
    }

    const campaign = await prisma.emailCampaign.update({
      where: { id: params.id },
      data: updateData,
    });

    return apiResponse(campaign, 200, 'Email campaign updated successfully');
  } catch (error) {
    console.error('Update email campaign error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    await prisma.emailCampaign.delete({
      where: { id: params.id },
    });

    return apiResponse(null, 200, 'Email campaign deleted successfully');
  } catch (error) {
    console.error('Delete email campaign error:', error);
    return apiError('Internal server error', 500);
  }
}

/**
 * Send campaign emails
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return apiError('Email campaign not found', 404);
    }

    if (campaign.status === EmailCampaignStatus.SENT) {
      return apiError('Campaign has already been sent', 400);
    }

    // Get recipients based on recipientType
    let recipients: Array<{ email: string; name?: string }> = [];

    if (campaign.recipientType === 'ALL_GUESTS') {
      const users = await prisma.user.findMany({
        where: {
          role: 'GUEST',
          emailVerified: true,
        },
        select: {
          email: true,
          name: true,
        },
      });
      recipients = users.map((u) => ({ email: u.email, name: u.name || undefined }));
    } else if (campaign.recipientType === 'BOOKED_GUESTS') {
      const bookings = await prisma.booking.findMany({
        where: {
          status: {
            notIn: ['CANCELLED'],
          },
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
        distinct: ['userId'],
      });
      recipients = bookings
        .map((b) => ({
          email: b.user.email,
          name: b.user.name || undefined,
        }))
        .filter((r) => r.email);
    } else if (campaign.recipientType === 'SPECIFIC_USERS') {
      const filter = campaign.recipientFilter as { userIds?: string[]; emails?: string[] };
      if (filter?.userIds) {
        const users = await prisma.user.findMany({
          where: {
            id: { in: filter.userIds },
          },
          select: {
            email: true,
            name: true,
          },
        });
        recipients = users.map((u) => ({ email: u.email, name: u.name || undefined }));
      } else if (filter?.emails) {
        recipients = filter.emails.map((email: string) => ({ email }));
      }
    }

    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: EmailCampaignStatus.SENDING,
        totalRecipients: recipients.length,
      },
    });

    // Send emails (in batches to avoid overwhelming the email service)
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        const success = await sendEmail({
          to: recipient.email,
          subject: campaign.subject,
          html: campaign.html,
        });

        if (success) {
          sentCount++;
          await prisma.emailLog.create({
            data: {
              to: recipient.email,
              subject: campaign.subject,
              campaignId: params.id,
              status: 'SENT',
            },
          });
        } else {
          failedCount++;
          await prisma.emailLog.create({
            data: {
              to: recipient.email,
              subject: campaign.subject,
              campaignId: params.id,
              status: 'FAILED',
              error: 'Email service error',
            },
          });
        }
      } catch (error) {
        failedCount++;
        await prisma.emailLog.create({
          data: {
            to: recipient.email,
            subject: campaign.subject,
            campaignId: params.id,
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    // Update campaign with final status
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: EmailCampaignStatus.SENT,
        sentAt: new Date(),
        sentCount,
      },
    });

    return apiResponse({
      sent: sentCount,
      failed: failedCount,
      total: recipients.length,
    }, 200, `Campaign sent: ${sentCount} successful, ${failedCount} failed`);
  } catch (error) {
    console.error('Send campaign error:', error);
    return apiError('Internal server error', 500);
  }
}

