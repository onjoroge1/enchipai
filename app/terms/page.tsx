import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <section className="bg-primary/5 py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-foreground">
              Terms of Service
            </h1>
            <p className="mt-4 text-muted-foreground">
              Last updated: March 2026
            </p>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg max-w-none">
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">1. Booking & Reservations</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All bookings are subject to availability. A confirmed reservation requires a valid payment
                  method. Rates are quoted in USD and may be subject to applicable taxes and conservancy fees.
                  Booking confirmation will be sent via email upon successful payment processing.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">2. Cancellation Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Cancellations made 30 or more days before the check-in date are eligible for a full refund.
                  Cancellations made 14-29 days before arrival will incur a 50% charge. Cancellations within
                  14 days of arrival or no-shows are non-refundable. We recommend travel insurance for all guests.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">3. Check-in & Check-out</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Check-in time is from 2:00 PM and check-out time is by 10:00 AM. Early check-in and late
                  check-out are subject to availability and may incur additional charges. Guests are required
                  to present valid identification upon arrival.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">4. Guest Conduct</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Guests are expected to follow all camp rules and safety guidelines, particularly during game
                  drives and bush activities. The camp reserves the right to ask guests to leave without refund
                  if their behavior poses a risk to themselves, other guests, or wildlife.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">5. Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Enchipai Mara Camp takes all reasonable precautions for guest safety. However, activities
                  involving wildlife inherently carry risks. Guests participate in all safari activities at
                  their own risk. The camp is not liable for loss or damage to personal belongings.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">6. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content on this website, including text, images, logos, and designs, is the property of
                  Enchipai Mara Camp and is protected by copyright law. Unauthorized reproduction or distribution
                  is prohibited.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">7. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these terms, contact us at{" "}
                  <a href="mailto:info@enchipaicamp.com" className="text-primary hover:underline">
                    info@enchipaicamp.com
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
