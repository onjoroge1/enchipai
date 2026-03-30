import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    // Get all bookings with guest info
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          notIn: ['CANCELLED'],
        },
      },
      include: {
        guestInfo: true,
      },
    });

    // Calculate country origins from nationality
    const countryMap = new Map<string, number>();
    bookings.forEach((booking) => {
      const nationality = booking.guestInfo?.nationality;
      if (nationality) {
        countryMap.set(nationality, (countryMap.get(nationality) || 0) + 1);
      }
    });

    // Sort and get top 5 countries
    const countryData = Array.from(countryMap.entries())
      .map(([country, guests]) => ({ country, guests }))
      .sort((a, b) => b.guests - a.guests)
      .slice(0, 5);

    const totalGuests = bookings.length;
    const othersCount = totalGuests - countryData.reduce((sum, item) => sum + item.guests, 0);
    
    if (othersCount > 0) {
      countryData.push({ country: 'Others', guests: othersCount });
    }

    // Calculate percentages
    const countryDataWithPercentage = countryData.map((item) => ({
      ...item,
      percentage: totalGuests > 0 ? Math.round((item.guests / totalGuests) * 100) : 0,
    }));

    // Calculate travel purpose distribution
    const purposeMap = new Map<string, number>();
    bookings.forEach((booking) => {
      const purpose = booking.guestInfo?.travelPurpose;
      if (purpose) {
        purposeMap.set(purpose, (purposeMap.get(purpose) || 0) + 1);
      }
    });

    const purposeData = Array.from(purposeMap.entries())
      .map(([name, count]) => {
        const percentage = totalGuests > 0 ? Math.round((count / totalGuests) * 100) : 0;
        return { name, value: percentage, count };
      })
      .sort((a, b) => b.value - a.value);

    // Default colors for travel purposes
    const purposeColors: Record<string, string> = {
      Honeymoon: '#8B5E3C',
      Family: '#D4A574',
      Adventure: '#C7956D',
      Photography: '#E8D5C4',
      Business: '#A67C52',
      Other: '#C4A484',
    };

    const purposeDataWithColors = purposeData.map((item) => ({
      ...item,
      color: purposeColors[item.name] || '#C4A484',
    }));

    // Calculate age distribution
    const ageRanges = [
      { range: '18-25', min: 18, max: 25 },
      { range: '26-35', min: 26, max: 35 },
      { range: '36-45', min: 36, max: 45 },
      { range: '46-55', min: 46, max: 55 },
      { range: '56-65', min: 56, max: 65 },
      { range: '65+', min: 65, max: 150 },
    ];

    const ageData = ageRanges.map((range) => {
      const count = bookings.filter((booking) => {
        const age = booking.guestInfo?.age;
        if (!age) return false;
        if (range.range === '65+') {
          return age >= range.min;
        }
        return age >= range.min && age <= range.max;
      }).length;

      return {
        range: range.range,
        guests: count,
      };
    });

    return apiResponse({
      countries: countryDataWithPercentage,
      travelPurpose: purposeDataWithColors,
      ageDistribution: ageData,
      totalGuests,
    });
  } catch (error) {
    console.error('Get demographics error:', error);
    return apiError('Internal server error', 500);
  }
}

