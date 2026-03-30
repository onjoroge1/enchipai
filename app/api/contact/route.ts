import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, phone } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    // Send email via Resend if configured
    try {
      const { sendEmail } = await import("@/lib/email");
      await sendEmail({
        to: process.env.EMAIL_FROM || "info@enchipaicamp.com",
        subject: `Contact Form: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
      });
    } catch {
      // Email sending failed, but we still accept the form submission
      console.log("Email sending unavailable, contact form data:", { name, email, subject });
    }

    return NextResponse.json({ success: true, message: "Message sent successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to process contact form" },
      { status: 500 }
    );
  }
}
