import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TentsHero } from "@/components/tents/tents-hero";
import { TentsShowcase } from "@/components/tents/tents-showcase";
import { TentsComparison } from "@/components/tents/tents-comparison";
import { TentsBookingCta } from "@/components/tents/tents-booking-cta";

export default function TentsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <TentsHero />
      <TentsShowcase />
      <TentsComparison />
      <TentsBookingCta />
      <Footer />
    </main>
  );
}
