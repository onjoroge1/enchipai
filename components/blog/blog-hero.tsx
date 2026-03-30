import Image from "next/image";

export function BlogHero() {
  return (
    <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      <Image
        src="/images/blog-hero.jpg"
        alt="Masai Mara savannah"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
          Stories from the Mara
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white mb-6 text-balance">
          Safari Journal
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
          Discover the magic of the Masai Mara through our stories, wildlife encounters, 
          and insider guides to experiencing Africa at its finest.
        </p>
      </div>
    </section>
  );
}
