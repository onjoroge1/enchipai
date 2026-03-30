import Image from "next/image";

export function TentsHero() {
  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-end">
      <Image
        src="/images/luxury-tent.jpg"
        alt="Luxury tented accommodation at Enchipai Mara Camp"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
        <span className="text-accent text-sm font-semibold uppercase tracking-wider">
          Our Tents
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white font-medium mt-3 leading-tight text-balance max-w-2xl">
          Seven Havens of Comfort in the Wild
        </h1>
        <p className="mt-4 text-white/80 text-lg max-w-xl leading-relaxed">
          Each tent is a sanctuary where contemporary elegance meets authentic African
          character, perched on the Esoit Oloololo escarpment with uninterrupted Mara views.
        </p>
      </div>
    </section>
  );
}
