import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";

const footerLinks = {
  explore: [
    { label: "Our Tents", href: "/tents" },
    { label: "Experiences", href: "/#experiences" },
    { label: "Gallery", href: "/#gallery" },
    { label: "Journal", href: "/blog" },
  ],
  info: [
    { label: "About Us", href: "/about" },
    { label: "Rates & Availability", href: "/tents" },
    { label: "FAQs", href: "/faq" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center mb-6">
              <Image
                src="/images/enchipai-logo.webp"
                alt="Enchipai Mara Camp"
                width={120}
                height={60}
                className="h-14 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-background/70 leading-relaxed mb-6">
              A place of happiness in the heart of the Masai Mara,
              offering exclusive luxury safari experiences.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://instagram.com/enchipaicamp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-background" />
              </a>
              <a
                href="https://facebook.com/enchipaicamp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-background" />
              </a>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="font-semibold text-background mb-4">Explore</h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="font-semibold text-background mb-4">Information</h3>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-background mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-background/70 text-sm">
                  Esoit Oloololo Escarpment, Masai Mara Conservancy, Kenya
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <a
                  href="tel:+254700000000"
                  className="text-background/70 hover:text-accent transition-colors text-sm"
                >
                  +254 700 000 000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <a
                  href="mailto:info@enchipaicamp.com"
                  className="text-background/70 hover:text-accent transition-colors text-sm"
                >
                  info@enchipaicamp.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-background/50 text-sm">
              © {new Date().getFullYear()} Enchipai Mara Camp. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-background/50 hover:text-accent text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-background/50 hover:text-accent text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
