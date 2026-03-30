import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BookingForm } from "@/components/tents/booking-form";

export default function BookTentPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <BookingForm />
      <Footer />
    </main>
  );
}
