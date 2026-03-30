import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <section className="bg-primary/5 py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-foreground">
              Privacy Policy
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
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed">
                  When you make a reservation or create an account with Enchipai Mara Camp, we collect personal
                  information such as your name, email address, phone number, and payment details. We also collect
                  information about your booking preferences and stay history to improve your experience.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use your information to process reservations, communicate about your stay, send booking
                  confirmations, provide customer support, and improve our services. With your consent, we may
                  also send promotional offers and updates about Enchipai.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">3. Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell your personal information. We may share your data with trusted service providers
                  who assist in operating our website and services, such as payment processors and email services.
                  All third parties are required to maintain the confidentiality of your information.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">4. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate security measures to protect your personal information against
                  unauthorized access, alteration, disclosure, or destruction. All payment transactions are
                  encrypted using SSL technology.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">5. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our website uses cookies to enhance your browsing experience, analyze site traffic, and
                  personalize content. You can manage cookie preferences through your browser settings.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">6. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to access, correct, or delete your personal information. You may also
                  opt out of promotional communications at any time. To exercise these rights, please contact
                  us at info@enchipaicamp.com.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">7. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at{" "}
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
