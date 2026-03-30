import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { AccommodationSection } from "@/components/accommodation-section";
import { ExperiencesSection } from "@/components/experiences-section";
import { GallerySection } from "@/components/gallery-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <AboutSection />
      <AccommodationSection />
      <ExperiencesSection />
      <GallerySection />
      <Footer />
    </main>
  );
}
