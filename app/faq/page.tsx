import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    category: "Booking & Reservations",
    questions: [
      {
        q: "How do I make a reservation?",
        a: "You can book directly through our website by visiting the Book Now page, or contact us via email at info@enchipaicamp.com or phone at +254 700 000 000.",
      },
      {
        q: "What is the cancellation policy?",
        a: "Cancellations made 30 days or more before arrival receive a full refund. Cancellations within 14-29 days receive a 50% refund. Cancellations within 14 days of arrival are non-refundable.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept major credit/debit cards (Visa, Mastercard), bank transfers, and mobile money (M-Pesa).",
      },
      {
        q: "Is there a minimum stay requirement?",
        a: "We recommend a minimum stay of 2 nights to fully enjoy the Mara experience, though single-night bookings are accepted based on availability.",
      },
    ],
  },
  {
    category: "Accommodation",
    questions: [
      {
        q: "How many tents do you have?",
        a: "Enchipai has five luxury tents, each uniquely designed and positioned for maximum privacy and panoramic views of the Mara.",
      },
      {
        q: "What amenities are included in each tent?",
        a: "Each tent includes a king-size bed, en-suite bathroom with hot shower, private deck, writing desk, charging stations, complimentary toiletries, and daily housekeeping.",
      },
      {
        q: "Is Wi-Fi available?",
        a: "We offer limited Wi-Fi in the main lounge area. We encourage guests to disconnect and enjoy the natural surroundings, but understand the need to stay connected for essential communication.",
      },
    ],
  },
  {
    category: "Safari & Experiences",
    questions: [
      {
        q: "What wildlife can I expect to see?",
        a: "The Masai Mara is home to the Big Five (lion, leopard, elephant, buffalo, rhino) along with cheetah, hippo, giraffe, zebra, wildebeest, and over 450 bird species.",
      },
      {
        q: "When is the best time to visit?",
        a: "The Mara is a year-round destination. The Great Migration typically occurs between July and October. The green season (November-May) offers lush landscapes and fewer crowds.",
      },
      {
        q: "What experiences are available?",
        a: "We offer morning and afternoon game drives, photography safaris, Maasai cultural visits, bush dinners, guided nature walks, and hot air balloon safaris (seasonal).",
      },
    ],
  },
  {
    category: "Getting Here",
    questions: [
      {
        q: "How do I get to Enchipai?",
        a: "We arrange transfers from Nairobi Wilson Airport via scheduled or charter flights to Mara airstrips (approximately 45 minutes). Road transfers from Nairobi are also available (5-6 hours).",
      },
      {
        q: "Do you provide airport transfers?",
        a: "Yes, we provide complimentary transfers from the nearest Mara airstrip to the camp. Airport transfers from Nairobi can be arranged at an additional cost.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-primary/5 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Help Center
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-foreground mt-4">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Find answers to common questions about staying at Enchipai Mara Camp.
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {faqs.map((category) => (
              <div key={category.category} className="mb-12 last:mb-0">
                <h2 className="font-serif text-2xl font-medium text-foreground mb-6 pb-3 border-b border-border">
                  {category.category}
                </h2>
                <div className="space-y-6">
                  {category.questions.map((item) => (
                    <div key={item.q}>
                      <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* CTA */}
            <div className="mt-16 text-center p-8 bg-secondary/50 rounded-2xl">
              <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                Still have questions?
              </h3>
              <p className="text-muted-foreground mb-6">
                Our team is happy to help with any other inquiries.
              </p>
              <Link href="/contact">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8">
                  Contact Us
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
