import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiResponse, apiError } from "@/lib/api-utils";
import { getTransactionStatus } from "@/lib/pesapal";

/**
 * Check payment status for a booking
 * Used by the frontend to poll for payment completion
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");
    const orderTrackingId = searchParams.get("orderTrackingId");

    if (!bookingId && !orderTrackingId) {
      return apiError("bookingId or orderTrackingId is required", 400);
    }

    // If we have an orderTrackingId, query PesaPal directly
    if (orderTrackingId) {
      try {
        const txStatus = await getTransactionStatus(orderTrackingId);
        return apiResponse({
          pesapalStatus: txStatus.payment_status_description,
          statusCode: txStatus.status_code,
          paymentMethod: txStatus.payment_method,
          confirmationCode: txStatus.confirmation_code,
          amount: txStatus.amount,
          currency: txStatus.currency,
        });
      } catch {
        // Fall through to check local DB
      }
    }

    // Check local database
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
          id: true,
          paymentStatus: true,
          status: true,
          totalAmount: true,
          userId: true,
          invoice: {
            select: {
              id: true,
              status: true,
              total: true,
              payments: {
                select: {
                  id: true,
                  amount: true,
                  method: true,
                  status: true,
                  transactionId: true,
                  processedAt: true,
                },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      });

      if (!booking) {
        return apiError("Booking not found", 404);
      }

      if (booking.userId !== authResult.user.id) {
        return apiError("Unauthorized", 403);
      }

      return apiResponse({
        bookingId: booking.id,
        bookingStatus: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: Number(booking.totalAmount),
        invoice: booking.invoice
          ? {
              id: booking.invoice.id,
              status: booking.invoice.status,
              total: Number(booking.invoice.total),
              payments: booking.invoice.payments.map((p) => ({
                ...p,
                amount: Number(p.amount),
              })),
            }
          : null,
      });
    }

    return apiError("Invalid request", 400);
  } catch (error) {
    console.error("Payment status check error:", error);
    return apiError("Failed to check payment status", 500);
  }
}
