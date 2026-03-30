import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Trees, Eye, Heart, Shield } from "lucide-react";

const values = [
  {
    icon: Trees,
    title: "Conservation First",
    description: "We are committed to preserving the Masai Mara ecosystem and supporting sustainable tourism practices.",
  },
  {
    icon: Eye,
    title: "Authentic Experiences",
    description: "Every safari and cultural encounter is designed to offer genuine, meaningful connections with nature and community.",
  },
  {
    icon: Heart,
    title: "Community Impact",
    description: "We work closely with the Maasai community, supporting education, healthcare, and cultural preservation.",
  },
  {
    icon: Shield,
    title: "Responsible Luxury",
    description: "We blend luxury with responsibility, minimizing our environmental footprint while maximizing guest comfort.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
          <Image
            src="/images/hero-safari.jpg"
            alt="Enchipai Mara Camp"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-center text-white max-w-3xl mx-auto px-4">
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">
              Our Story
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium mt-4">
              About Enchipai
            </h1>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground text-lg leading-relaxed">
                <em>&quot;Enchipai&quot;</em> in Maa language translates to <em>&quot;a place of happiness&quot;</em> &mdash;
                and that is exactly what we set out to create when we established our camp along the
                Esoit Oloololo escarpment.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mt-6">
                Hidden under the indigenous canopy of the Esoit Oloololo escarpment, Enchipai Luxury Camp
                offers one of the most exclusive safari experiences in the Maasai Mara. Our camp&apos;s location
                was carefully identified and strategically engineered with a perfect view of the Mara.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mt-6">
                The tents are well designed with both contemporary and local rustic touches to give our
                guests the very best of both worlds. Each of our five luxury tents has been thoughtfully
                positioned to offer uninterrupted views of the savannah, where wildlife roams freely
                just beyond your private deck.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 lg:py-24 bg-secondary/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">
                Our Values
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mt-4">
                What We Stand For
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <div key={value.title} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
              Ready to Experience Enchipai?
            </h2>
            <p className="text-muted-foreground mb-8">
              Book your stay and discover why Enchipai means &quot;a place of happiness.&quot;
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/tents/book">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8">
                  Book Your Stay
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="rounded-full px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
