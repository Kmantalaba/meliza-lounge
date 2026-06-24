import Image from 'next/image';
import { Heart, Instagram, Facebook, MessageCircle } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

const SOCIAL = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: MessageCircle, href: '#', label: 'Viber' },
];

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/meliza_logo.png"
                  alt="The Meliza Lounge"
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <div>
                <p
                  className="text-[#E91E8C] font-bold text-base"
                  style={{ fontFamily: 'var(--font-dancing)' }}
                >
                  The Meliza Lounge
                </p>
                <p className="text-white/40 text-[9px] tracking-[0.15em] uppercase">Premium Nail Studio</p>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Where nail artistry meets luxury. Expert care for nails that make you feel
              your most confident.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-5">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/50 hover:text-[#E91E8C] text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-5">
              Connect With Us
            </h4>
            <p className="text-white/50 text-sm mb-5 leading-relaxed">
              Follow our work and get inspired on social media.
            </p>
            <div className="flex gap-3">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E91E8C] flex items-center justify-center transition-colors duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Bottom bar */}
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>© {new Date().getFullYear()} The Meliza Lounge. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={10} fill="currentColor" className="text-[#E91E8C]" /> in the Philippines
          </p>
        </div>
      </div>
    </footer>
  );
}
