import { NextRequest } from 'next/server';
import { requireAuth, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const { amount, bookingId, currency = 'usd' } = body;

    if (!amount || !bookingId) {
      return apiError('Amount and bookingId are required', 400);
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return apiError('Stripe is not configured', 500);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        bookingId,
        userId: authResult.user.id,
      },
    });

    return apiResponse({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return apiError('Internal server error', 500);
  }
}

