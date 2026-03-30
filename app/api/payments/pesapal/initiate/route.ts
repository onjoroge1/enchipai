import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiResponse, apiError, parseJsonBody } from "@/lib/api-utils";
import { submitOrder, getOrCreateIPNId } from "@/lib/pesapal";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const { bookingId } = body;

    if (!bookingId) {
      return apiError("bookingId is required", 400);
    }

    // Verify PesaPal is configured
    if (!process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET) {
      return apiError("PesaPal payment gateway is not configured", 500);
    }

    // Get booking with guest info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tent: { select: { name: true } },
        guestInfo: true,
        invoice: true,
      },
    });

    if (!booking) {
      return apiError("Booking not found", 404);
    }

    // Verify booking belongs to user
    if (booking.userId !== authResult.user.id) {
      return apiError("Unauthorized", 403);
    }

    // Check if already paid
    if (booking.paymentStatus === "PAID") {
      return apiError("This booking has already been paid", 400);
    }

    // Check booking status
    if (booking.status === "CANCELLED") {
      return apiError("Cannot pay for a cancelled booking", 400);
    }

    // Auto-generate invoice if it doesn't exist
    let invoice = booking.invoice;
    if (!invoice) {
      const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const amount = Number(booking.totalAmount);
      const taxRate = 0.16; // 16% VAT Kenya
      const tax = Math.round(amount * taxRate * 100) / 100;
      const total = Math.round((amount + tax) * 100) / 100;

      invoice = await prisma.invoice.create({
        data: {
          bookingId: booking.id,
          userId: booking.userId,
          invoiceNumber,
          amount: amount,
          tax,
          total,
          status: "PENDING",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Calculate amount to charge (use invoice total if available)
    const chargeAmount = Number(invoice.total);

    // Get the IPN notification ID
    const notificationId = await getOrCreateIPNId();

    // Build callback URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/payments/pesapal/callback?bookingId=${bookingId}`;

    // Build the order
    const nights = Math.ceil(
      (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );

    const orderResponse = await submitOrder({
      id: bookingId,
      currency: "KES",
      amount: chargeAmount,
      description: `Enchipai Mara Camp - ${booking.tent.name} (${nights} nights)`,
      callback_url: callbackUrl,
      notification_id: notificationId,
      billing_address: {
        email_address: booking.guestInfo?.email || authResult.user.email || "",
        phone_number: booking.guestInfo?.phone || undefined,
        first_name: booking.guestInfo?.firstName || undefined,
        last_name: booking.guestInfo?.lastName || undefined,
        country_code: "KE",
      },
    });

    // Store the order tracking ID for later status checks
    // Create a pending payment record
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: chargeAmount,
        method: "MOBILE_MONEY", // Will be updated by IPN
        transactionId: orderResponse.order_tracking_id,
        status: "PENDING",
      },
    });

    // Update booking payment status to PROCESSING
    await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: "PENDING" },
    });

    return apiResponse({
      redirectUrl: orderResponse.redirect_url,
      orderTrackingId: orderResponse.order_tracking_id,
      merchantReference: orderResponse.merchant_reference,
    });
  } catch (error) {
    console.error("PesaPal payment initiation error:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to initiate payment",
      500
    );
  }
}
