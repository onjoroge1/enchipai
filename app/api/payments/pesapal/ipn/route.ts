import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTransactionStatus, mapPesaPalPaymentMethod, mapPesaPalStatus } from "@/lib/pesapal";
import { sendPaymentConfirmationTemplate } from "@/lib/email-templates";
import { createNotification } from "@/lib/notifications";

/**
 * PesaPal IPN (Instant Payment Notification) Handler
 *
 * PesaPal calls this endpoint when a payment status changes.
 * It sends: OrderTrackingId, OrderMerchantReference, OrderNotificationType
 *
 * We must:
 * 1. Query PesaPal for the full transaction status
 * 2. Update our Payment, Invoice, and Booking records
 * 3. Return 200 OK with the orderNotificationType and orderTrackingId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderTrackingId = searchParams.get("OrderTrackingId");
    const orderMerchantReference = searchParams.get("OrderMerchantReference");
    const orderNotificationType = searchParams.get("OrderNotificationType");

    console.log("PesaPal IPN received:", {
      orderTrackingId,
      orderMerchantReference,
      orderNotificationType,
    });

    if (!orderTrackingId || !orderMerchantReference) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Query PesaPal for the full transaction status
    const txStatus = await getTransactionStatus(orderTrackingId);

    console.log("PesaPal transaction status:", txStatus);

    // Find the payment record by transactionId (order_tracking_id)
    const payment = await prisma.payment.findUnique({
      where: { transactionId: orderTrackingId },
      include: {
        invoice: {
          include: {
            booking: true,
          },
        },
      },
    });

    if (!payment) {
      console.error(`Payment not found for tracking ID: ${orderTrackingId}`);
      // Still return 200 to PesaPal to acknowledge receipt
      return NextResponse.json({
        orderNotificationType,
        orderTrackingId,
        status: "200",
      });
    }

    // Map PesaPal status to our status
    const newPaymentStatus = mapPesaPalStatus(txStatus.status_code);
    const paymentMethod = mapPesaPalPaymentMethod(txStatus.payment_method);

    // Update the payment record
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newPaymentStatus as any,
        method: paymentMethod as any,
        processedAt: newPaymentStatus === "COMPLETED" ? new Date() : undefined,
      },
    });

    // If payment is completed, update invoice and booking
    if (newPaymentStatus === "COMPLETED") {
      // Get total payments for this invoice
      const allPayments = await prisma.payment.findMany({
        where: {
          invoiceId: payment.invoiceId,
          status: "COMPLETED",
        },
      });

      const totalPaid = allPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      const invoiceTotal = Number(payment.invoice.total);

      // Update invoice status
      const invoiceStatus = totalPaid >= invoiceTotal ? "PAID" : "PENDING";
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          status: invoiceStatus,
          paidDate: invoiceStatus === "PAID" ? new Date() : undefined,
        },
      });

      // Update booking payment status
      const bookingPaymentStatus =
        totalPaid >= invoiceTotal
          ? "PAID"
          : totalPaid > 0
            ? "PARTIAL"
            : "PENDING";

      await prisma.booking.update({
        where: { id: payment.invoice.bookingId },
        data: {
          paymentStatus: bookingPaymentStatus as any,
          status:
            bookingPaymentStatus === "PAID" ? "CONFIRMED" : undefined,
        },
      });

      console.log(
        `Payment completed for booking ${payment.invoice.bookingId}: $${totalPaid} / $${invoiceTotal}`
      );

      // Send payment confirmation email and notification
      try {
        const booking = await prisma.booking.findUnique({
          where: { id: payment.invoice.bookingId },
          include: {
            tent: true,
            guestInfo: true,
            user: true,
          },
        });

        if (booking) {
          const guestEmail = booking.guestInfo?.email || booking.user?.email;
          const guestName = booking.guestInfo
            ? `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`
            : booking.user?.name || "Guest";

          if (guestEmail) {
            await sendPaymentConfirmationTemplate(guestEmail, {
              guestName,
              bookingNumber: booking.id.slice(0, 8).toUpperCase(),
              amount: Number(payment.amount),
              paymentMethod: paymentMethod || "Online Payment",
              transactionId: orderTrackingId,
            });
          }

          // Create in-app notification
          if (booking.userId) {
            await createNotification({
              userId: booking.userId,
              type: "PAYMENT",
              title: "Payment Received",
              message: `Your payment of $${Number(payment.amount).toLocaleString()} for ${booking.tent.name} has been confirmed.`,
              link: `/bookings/${booking.id}/confirmation`,
            });
          }
        }
      } catch (emailError) {
        console.error("Failed to send payment confirmation:", emailError);
        // Don't fail the IPN if email fails
      }
    } else if (newPaymentStatus === "FAILED") {
      // Update booking payment status to FAILED
      await prisma.booking.update({
        where: { id: payment.invoice.bookingId },
        data: { paymentStatus: "FAILED" as any },
      });
    } else if (newPaymentStatus === "REFUNDED") {
      await prisma.booking.update({
        where: { id: payment.invoice.bookingId },
        data: { paymentStatus: "REFUNDED" as any },
      });

      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: "CANCELLED" },
      });
    }

    // PesaPal expects this exact response format
    return NextResponse.json({
      orderNotificationType,
      orderTrackingId,
      status: "200",
    });
  } catch (error) {
    console.error("PesaPal IPN error:", error);
    // Still return 200 to prevent PesaPal from retrying endlessly
    return NextResponse.json({ status: "200" });
  }
}
