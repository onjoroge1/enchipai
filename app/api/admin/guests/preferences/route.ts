import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const updatePreferencesSchema = z.object({
  preferences: z.any().optional(), // JSON object
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: any = {
      role: 'GUEST',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const guests = await prisma.user.findMany({
      where,
      include: {
        preferences: true,
        bookings: {
          include: {
            guestInfo: {
              select: {
                dietaryRequirements: true,
                medicalInfo: true,
                nationality: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get most recent booking for guest info
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to include dietary/allergies from guestInfo
    const guestsWithPreferences = guests.map((guest) => {
      const latestBooking = guest.bookings[0];
      const guestInfo = latestBooking?.guestInfo;
      
      // Parse dietary requirements and medical info
      const dietaryRequirements = guestInfo?.dietaryRequirements || '';
      const medicalInfo = guestInfo?.medicalInfo || '';
      
      // Extract dietary preferences (simple parsing)
      const dietary: string[] = [];
      if (dietaryRequirements) {
        const commonDietary = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher', 'No Pork', 'No Beef', 'Pescatarian', 'Keto', 'Low Sodium'];
        commonDietary.forEach((d) => {
          if (dietaryRequirements.toLowerCase().includes(d.toLowerCase())) {
            dietary.push(d);
          }
        });
      }

      // Extract allergies from medical info
      const allergies: string[] = [];
      if (medicalInfo) {
        const commonAllergies = ['Nuts', 'Peanuts', 'Shellfish', 'Fish', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Sesame', 'Sulfites', 'Penicillin'];
        commonAllergies.forEach((a) => {
          if (medicalInfo.toLowerCase().includes(a.toLowerCase())) {
            allergies.push(a);
          }
        });
      }

      // Get preferences from GuestPreference model
      const prefData = guest.preferences?.preferences as any || {};
      
      return {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        dietary,
        allergies,
        specialOccasion: prefData.specialOccasion || null,
        preferences: prefData.preferences || guestInfo?.medicalInfo || null,
        roomPreference: prefData.roomPreference || null,
        preferencesRecord: guest.preferences,
      };
    });

    return apiResponse({ guests: guestsWithPreferences });
  } catch (error) {
    console.error('Get guest preferences error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = z.object({
      userId: z.string(),
      preferences: z.any().optional(),
      notes: z.string().optional(),
    }).safeParse(body);

    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const { userId, preferences, notes } = validationResult.data;

    // Upsert guest preferences
    const preference = await prisma.guestPreference.upsert({
      where: { userId },
      update: {
        preferences: preferences || undefined,
        notes: notes || undefined,
      },
      create: {
        userId,
        preferences: preferences || null,
        notes: notes || null,
      },
    });

    return apiResponse(preference, 201, 'Guest preferences saved successfully');
  } catch (error) {
    console.error('Save guest preferences error:', error);
    return apiError('Internal server error', 500);
  }
}

