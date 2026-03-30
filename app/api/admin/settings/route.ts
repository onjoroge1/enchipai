import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  category: z.string().optional(),
  settings: z.record(z.string(), z.any()).optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = {};
    if (category) {
      where.category = category;
    }

    const settings = await prisma.setting.findMany({
      where,
      orderBy: {
        category: 'asc',
      },
    });

    // Group settings by category
    const grouped: Record<string, Record<string, any>> = {};
    settings.forEach((setting) => {
      const cat = setting.category || 'general';
      if (!grouped[cat]) {
        grouped[cat] = {};
      }
      try {
        // Try to parse JSON, fallback to string
        grouped[cat][setting.key] = JSON.parse(setting.value);
      } catch {
        grouped[cat][setting.key] = setting.value;
      }
    });

    // If no settings exist, return defaults
    if (settings.length === 0) {
      return apiResponse({
        general: {
          campName: 'Enchipai Mara Camp',
          tagline: 'A Place of Happiness',
          description: 'Hidden under the indigenous canopy of the Esoit Oloololo escarpment, Enchipai Luxury Camp offers one of the most exclusive safari experiences in the Maasai Mara.',
          contactEmail: 'reservations@enchipai.com',
          phone: '+254 700 123 456',
          currency: 'usd',
          timezone: 'eat',
          language: 'en',
        },
        booking: {
          instantBooking: true,
          requireDeposit: true,
          depositPercentage: 50,
          autoConfirmOTA: false,
          checkInTime: '14:00',
          checkOutTime: '10:00',
        },
        hero: {
          title: 'Welcome to Enchipai Mara Camp',
          subtitle: 'Experience the magic of the Masai Mara',
          ctaText: 'Book Your Stay',
          ctaLink: '/tents',
          backgroundImage: '/images/hero-bg.jpg',
        },
      });
    }

    return apiResponse(grouped);
  } catch (error) {
    console.error('Get settings error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = updateSettingsSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const { category, settings } = body;

    if (!settings || typeof settings !== 'object') {
      return apiError('Settings object is required', 400);
    }

    // Update or create each setting
    const updates = Object.entries(settings).map(async ([key, value]) => {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      return prisma.setting.upsert({
        where: { key },
        update: {
          value: stringValue,
          category: category || 'general',
        },
        create: {
          key,
          value: stringValue,
          category: category || 'general',
        },
      });
    });

    await Promise.all(updates);

    return apiResponse(
      { success: true },
      200,
      'Settings updated successfully'
    );
  } catch (error) {
    console.error('Update settings error:', error);
    return apiError('Internal server error', 500);
  }
}

