import { MapPin, Phone, Clock, Instagram, Facebook, MessageCircle } from 'lucide-react';

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: 'Location',
    value: 'Block 5 Lot 3, Sampaguita St.',
    sub: 'Bacoor, Cavite, Philippines',
    color: '#E91E8C',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+63 917 123 4567',
    sub: 'Call or text anytime',
    color: '#DB2777',
  },
  {
    icon: Clock,
    label: 'Open Hours',
    value: 'Tue – Sun, 9:00 AM – 5:00 PM',
    sub: 'Closed Mondays',
    color: '#BE185D',
  },
];

const SOCIAL = [
  { icon: Instagram, label: '@meliza.lounge', color: '#E91E8C', href: '#' },
  { icon: Facebook, label: 'The Meliza Lounge', color: '#1877F2', href: '#' },
  { icon: MessageCircle, label: 'Message on Viber', color: '#665CAC', href: '#' },
];

export default function Contact() {
  return (
    <section id="contact" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#E91E8C] text-sm font-semibold tracking-widest uppercase mb-3">
            Reach Out
          </span>
          <h2
            className="text-4xl lg:text-5xl font-bold text-[#1a1a2e]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Get In Touch
          </h2>
          <p className="text-[#6B7280] mt-4 max-w-lg mx-auto text-base leading-relaxed">
            Have questions? Want to discuss a custom design? Reach out — we would love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left — contact cards + social */}
          <div className="space-y-5">
            {CONTACT_INFO.map(({ icon: Icon, label, value, sub, color }) => (
              <div
                key={label}
                className="flex items-start gap-4 bg-[#FFF9FC] rounded-2xl p-5 border border-pink-50 hover:border-pink-200 transition-colors group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-shadow group-hover:shadow-md"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-[#1a1a2e]">{value}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{sub}</p>
                </div>
              </div>
            ))}

            {/* Social links */}
            <div className="bg-[#FFF9FC] rounded-2xl p-5 border border-pink-50">
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-4">
                Follow &amp; Connect
              </p>
              <div className="space-y-3">
                {SOCIAL.map(({ icon: Icon, label, color, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon size={15} style={{ color }} />
                    </div>
                    <span className="text-sm font-medium text-[#525252]">{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right — map placeholder */}
          <div className="rounded-3xl overflow-hidden shadow-lg border border-pink-100 h-80 lg:h-full min-h-72 relative">
            {/* Map placeholder with gradient */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFF0F7 0%, #FDE8F3 50%, #FBCFE8 100%)' }}
            >
              {/* Grid lines (map feel) */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={`h${i}`}
                    className="absolute w-full border-t border-pink-300"
                    style={{ top: `${i * 10}%` }}
                  />
                ))}
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={`v${i}`}
                    className="absolute h-full border-l border-pink-300"
                    style={{ left: `${i * 10}%` }}
                  />
                ))}
              </div>

              {/* Pin */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 bg-[#E91E8C] rounded-full flex items-center justify-center shadow-2xl shadow-pink-300 mb-3 animate-bounce">
                  <MapPin size={28} className="text-white" />
                </div>
                <div className="bg-white rounded-2xl shadow-xl px-5 py-3 text-center border border-pink-100">
                  <p className="text-sm font-bold text-[#1a1a2e]">The Meliza Lounge</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Block 5 Lot 3, Sampaguita St.</p>
                  <p className="text-xs text-[#9CA3AF]">Bacoor, Cavite</p>
                </div>
              </div>
            </div>

            {/* Map badge */}
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-white rounded-xl px-4 py-2 text-xs font-semibold text-[#E91E8C] shadow-md border border-pink-100 hover:shadow-lg transition-shadow z-10"
            >
              Open in Maps →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
