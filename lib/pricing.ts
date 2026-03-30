import { prisma } from './prisma';

/**
 * Calculate the price for a tent on a given date
 * Takes into account base price, season multipliers, and special dates
 */
export async function calculatePrice(
  tentId: string,
  date: Date
): Promise<number> {
  try {
    const tent = await prisma.tent.findUnique({
      where: { id: tentId },
    });

    if (!tent) {
      throw new Error('Tent not found');
    }

    const basePrice = Number(tent.price);
    let multiplier = 1.0;

    // Check for special dates first (they override seasons)
    const specialDate = await prisma.specialDate.findFirst({
      where: {
        active: true,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });

    if (specialDate) {
      multiplier = Number(specialDate.multiplier);
    } else {
      // Check for season
      const season = await prisma.season.findFirst({
        where: {
          active: true,
          startDate: { lte: date },
          endDate: { gte: date },
        },
      });

      if (season) {
        multiplier = Number(season.multiplier);
      }
    }

    return basePrice * multiplier;
  } catch (error) {
    console.error('Calculate price error:', error);
    throw error;
  }
}

/**
 * Calculate total price for a booking period
 */
export async function calculateBookingPrice(
  tentId: string,
  checkIn: Date,
  checkOut: Date
): Promise<{ total: number; breakdown: Array<{ date: string; price: number }> }> {
  try {
    const breakdown: Array<{ date: string; price: number }> = [];
    let total = 0;

    // Calculate price for each night
    for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
      const price = await calculatePrice(tentId, d);
      breakdown.push({
        date: d.toISOString().split('T')[0],
        price,
      });
      total += price;
    }

    return { total, breakdown };
  } catch (error) {
    console.error('Calculate booking price error:', error);
    throw error;
  }
}

/**
 * Get active season for a given date
 */
export async function getActiveSeason(date: Date) {
  try {
    // Check special dates first
    const specialDate = await prisma.specialDate.findFirst({
      where: {
        active: true,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });

    if (specialDate) {
      return {
        type: 'special',
        name: specialDate.name,
        multiplier: Number(specialDate.multiplier),
      };
    }

    // Check seasons
    const season = await prisma.season.findFirst({
      where: {
        active: true,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });

    if (season) {
      return {
        type: 'season',
        name: season.name,
        multiplier: Number(season.multiplier),
        seasonType: season.type,
      };
    }

    return null;
  } catch (error) {
    console.error('Get active season error:', error);
    return null;
  }
}

