'use client';

import { useState } from 'react';
import { ArrowRight, Clock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';

type ServiceItem = {
  title: string;
  duration: string;
  price: number;
  description: string;
  popular?: boolean;
  isAddon?: boolean;
};

type ServiceGroup = {
  group: string;
  items: ServiceItem[];
};

type Category = {
  id: string;
  label: string;
  icon: string;
  groups: ServiceGroup[];
};

const CATEGORIES: Category[] = [
  {
    id: 'manicure',
    label: 'Manicures',
    icon: '💅',
    groups: [
      {
        group: 'Classic',
        items: [
          { title: 'Classic Manicure', duration: '30 mins', price: 350, description: 'Shape, cuticle care, hand massage & polish.' },
          { title: 'French Manicure', duration: '30 mins', price: 420, description: 'Timeless white-tip French finish.', popular: true },
          { title: 'Sparkly Polish Change', duration: '15 mins', price: 150, description: 'Quick glitter or shimmer polish refresh.' },
          { title: 'Hot Stone Manicure', duration: '45 mins', price: 650, description: 'Deep relaxation with heated stone therapy & massage.' },
          { title: 'Shellac / Gel Manicure', duration: '45 mins', price: 580, description: 'Chip-free gel polish that lasts 2–3 weeks.', popular: true },
        ],
      },
      {
        group: 'BIAB (Builder In A Bottle)',
        items: [
          { title: 'BIAB Manicure', duration: '90 mins', price: 950, description: 'Strengthening builder gel manicure for natural nail growth.', popular: true },
          { title: 'BIAB French Manicure', duration: '90 mins', price: 1100, description: 'BIAB with a perfect French finish.' },
          { title: 'BIAB Manicure Infill', duration: '90 mins', price: 880, description: 'Fill and refresh your existing BIAB set.' },
          { title: 'BIAB Weekly Refresh', duration: '45 mins', price: 550, description: 'Light polish refresh on existing BIAB nails.' },
          { title: 'Russian Gel / BIAB', duration: '90 mins', price: 1150, description: 'Russian e-file technique with BIAB for ultra-precise cuticle work.' },
          { title: 'BIAB Removal', duration: '30 mins', price: 320, description: 'Safe, damage-free removal of BIAB gel.' },
        ],
      },
      {
        group: 'Russian Manicure',
        items: [
          { title: 'Russian Manicure — No Polish', duration: '45 mins', price: 480, description: 'E-file dry technique for flawless cuticle definition.' },
          { title: 'Russian Manicure — With Polish', duration: '60 mins', price: 580, description: 'Russian technique finished with gel polish.' },
          { title: 'Russian Overlay', duration: '90 mins', price: 950, description: 'Thin protective overlay using Russian e-file method.' },
        ],
      },
      {
        group: 'Add-Ons',
        items: [
          { title: 'Back, Neck & Shoulder Massage', duration: '30 mins', price: 480, description: 'Relaxing add-on massage during your nail service.', isAddon: true },
        ],
      },
    ],
  },
  {
    id: 'pedicure',
    label: 'Pedicures',
    icon: '🦶',
    groups: [
      {
        group: 'Classic',
        items: [
          { title: 'Classic Pedicure', duration: '30 mins', price: 380, description: 'Shape, cuticle care, foot soak & polish.' },
          { title: 'French Pedicure', duration: '30 mins', price: 450, description: 'Classic white-tip French finish for toes.' },
          { title: 'Shape & Polish Change', duration: '15 mins', price: 200, description: 'Quick shape and fresh polish on toes.' },
          { title: 'Cut & File', duration: '15 mins', price: 150, description: 'Trim and shape toenails only.' },
          { title: 'Hot Stone Pedicure', duration: '60 mins', price: 700, description: 'Heated stone foot massage with full pedicure.', popular: true },
          { title: 'Shellac / Gel Pedicure', duration: '45 mins', price: 620, description: 'Long-lasting gel polish for toes.' },
        ],
      },
      {
        group: 'Spa Pedicures',
        items: [
          { title: 'Spa Pedicure with Callus', duration: '60 mins', price: 1100, description: 'Deep spa treatment with callus removal, scrub & mask.', popular: true },
          { title: 'Spa Pedicure without Callus', duration: '60 mins', price: 950, description: 'Luxurious spa pedicure without callus treatment.' },
          { title: 'BIAB Pedicure', duration: '60 mins', price: 1100, description: 'Builder gel for strong, beautiful toenails.' },
          { title: 'BIAB Pedicure Infill', duration: '90 mins', price: 880, description: 'Fill and refresh your BIAB pedicure.' },
        ],
      },
      {
        group: 'Russian Pedicure',
        items: [
          { title: 'Russian Pedicure — No Polish', duration: '45 mins', price: 520, description: 'Precision dry e-file pedicure technique.' },
          { title: 'Russian Pedicure — With Polish', duration: '60 mins', price: 630, description: 'Russian e-file pedicure with gel polish finish.' },
        ],
      },
      {
        group: 'Add-Ons',
        items: [
          { title: 'Foot Massage', duration: '30 mins', price: 480, description: 'Relaxing add-on foot and calf massage.', isAddon: true },
          { title: 'Paraffin Dip', duration: '30 mins', price: 420, description: 'Warm paraffin wax treatment for ultra-soft feet.', isAddon: true },
          { title: 'Exfoliating Scrub', duration: '15 mins', price: 220, description: 'Sugar or salt scrub for smooth, glowing skin.', isAddon: true },
        ],
      },
    ],
  },
  {
    id: 'extensions',
    label: 'Nail Extensions',
    icon: '💎',
    groups: [
      {
        group: 'Hands — Gel',
        items: [
          { title: 'Natural Acrylic/Gel Full Set', duration: '90 mins', price: 1400, description: 'Full set of gel extensions in natural finish.', popular: true },
          { title: 'Natural Acrylic/Gel Overlay', duration: '90 mins', price: 1150, description: 'Thin gel overlay over natural nails for strength.' },
          { title: 'Natural Acrylic/Gel Refill', duration: '75 mins', price: 900, description: 'Fill in the regrowth on your gel set.' },
          { title: 'French Acrylic/Gel Full Set', duration: '120 mins', price: 1650, description: 'French-tip full gel extension set.', popular: true },
          { title: 'French Acrylic/Gel Overlay', duration: '75 mins', price: 1300, description: 'French overlay on natural nail length.' },
          { title: 'French Acrylic/Gel Refill', duration: '90 mins', price: 1250, description: 'French tip refill on existing gel set.' },
          { title: 'Chrome / Marble / Ombre Full Set', duration: '60 mins', price: 950, description: 'Trendy chrome, marble, or ombre nail design set.' },
          { title: 'Enhancement Removal', duration: '40 mins', price: 420, description: 'Safe removal of gel or acrylic enhancements.' },
        ],
      },
      {
        group: 'Feet — Gel',
        items: [
          { title: 'Natural Acrylic/Gel Full Set — Feet', duration: '90 mins', price: 1700, description: 'Full gel extension set on toenails.' },
          { title: 'Natural Acrylic/Gel Overlay — Feet', duration: '90 mins', price: 1380, description: 'Strengthening gel overlay on toenails.' },
          { title: 'Natural Acrylic/Gel Refill — Feet', duration: '75 mins', price: 1200, description: 'Refill for existing toenail gel set.' },
          { title: 'French Acrylic/Gel Full Set — Feet', duration: '120 mins', price: 1900, description: 'Full French gel extension set on toes.' },
          { title: 'French Acrylic/Gel Overlay — Feet', duration: '75 mins', price: 1600, description: 'French gel overlay on natural toenails.' },
        ],
      },
    ],
  },
  {
    id: 'nailart',
    label: 'Nail Art',
    icon: '🎨',
    groups: [
      {
        group: 'Per Nail Add-Ons',
        items: [
          { title: 'Chrome / Marble / Ombre per Nail', duration: '15 mins', price: 110, description: 'Chrome powder, marble effect, or ombre per nail.', popular: true },
          { title: 'Simple Nail Art per Nail', duration: '15 mins', price: 65, description: 'Minimalist lines, dots, or shapes per nail.' },
          { title: 'Rhinestone per Piece', duration: '15 mins', price: 15, description: 'Crystal or gem embellishment per stone.' },
        ],
      },
    ],
  },
  {
    id: 'treatments',
    label: 'Treatments',
    icon: '✨',
    groups: [
      {
        group: 'Collagen & Caviar',
        items: [
          { title: 'Collagen & Caviar — Hands', duration: '60 mins', price: 950, description: 'Anti-aging collagen and caviar treatment for hands.', popular: true },
          { title: 'Collagen & Caviar — Feet', duration: '60 mins', price: 1100, description: 'Intensive collagen and caviar treatment for feet.' },
        ],
      },
      {
        group: 'Paraffin',
        items: [
          { title: 'Paraffin Hand Treatment', duration: '30 mins', price: 680, description: 'Warm paraffin wax for silky-smooth hands.' },
          { title: 'Paraffin Feet Treatment', duration: '30 mins', price: 720, description: 'Warm paraffin wax for deeply moisturised feet.' },
        ],
      },
    ],
  },
  {
    id: 'removal',
    label: 'Removal',
    icon: '🗑️',
    groups: [
      {
        group: 'Gel Polish Removal',
        items: [
          { title: 'Gel Polish Removal — Hands', duration: '20 mins', price: 150, description: 'Safe soak-off removal of existing gel polish (hands).' },
          { title: 'Gel Polish Removal — Feet', duration: '20 mins', price: 150, description: 'Safe soak-off removal of existing gel polish (feet).' },
        ],
      },
      {
        group: 'Enhancement Removal',
        items: [
          { title: 'Gel / Dip / Acrylic / Extensions — Hands', duration: '40 mins', price: 420, description: 'Full removal of hard gel, dip, acrylic, overlays or fake nails (hands).' },
          { title: 'Gel / Dip / Acrylic / Extensions — Feet', duration: '40 mins', price: 420, description: 'Full removal of hard gel, dip, acrylic, overlays or fake nails (feet).' },
        ],
      },
    ],
  },
];

export default function Services() {
  const { openBookingModal } = useApp();
  const [activeTab, setActiveTab] = useState('manicure');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeCategory = CATEGORIES.find((c) => c.id === activeTab)!;

  return (
    <section id="services" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#E91E8C] text-sm font-semibold tracking-widest uppercase mb-3">
            Full Menu
          </span>
          <h2
            className="text-4xl lg:text-5xl font-bold text-[#1a1a2e]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Our Services
          </h2>
          <p className="text-[#6B7280] mt-4 max-w-lg mx-auto text-base leading-relaxed">
            From classic polish to luxury extensions — every service crafted with precision
            and premium products.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 flex-wrap justify-center mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === cat.id
                  ? 'bg-[#E91E8C] text-white shadow-md shadow-pink-200'
                  : 'bg-[#FFF9FC] text-[#525252] hover:bg-[#FFF0F7] hover:text-[#E91E8C] border border-pink-100'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Service groups */}
        <div className="space-y-4">
          {activeCategory.groups.map((group) => {
            const key = `${activeTab}-${group.group}`;
            const isExpanded = expandedGroups[key] !== false; // default open
            const visibleItems = isExpanded ? group.items : group.items.slice(0, 3);

            return (
              <div
                key={group.group}
                className="bg-[#FFF9FC] rounded-2xl border border-pink-100 overflow-hidden"
              >
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(key)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#FFF0F7] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1a1a2e]">{group.group}</span>
                    <span className="text-xs text-[#9CA3AF] bg-white px-2 py-0.5 rounded-full border border-pink-100">
                      {group.items.length} service{group.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {isExpanded
                    ? <ChevronUp size={16} className="text-[#9CA3AF]" />
                    : <ChevronDown size={16} className="text-[#9CA3AF]" />}
                </button>

                {/* Items */}
                {isExpanded && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 pb-4">
                    {group.items.map((service) => (
                      <div
                        key={service.title}
                        className={`relative bg-white rounded-xl p-4 border hover:border-[#E91E8C]/30 hover:shadow-md transition-all duration-200 group ${
                          service.isAddon
                            ? 'border-dashed border-pink-200'
                            : 'border-pink-100'
                        }`}
                      >
                        {service.popular && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#FFF0F7] text-[#E91E8C] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <Sparkles size={8} />
                            Popular
                          </div>
                        )}
                        {service.isAddon && (
                          <div className="absolute top-3 right-3 text-[10px] font-bold text-[#9CA3AF] bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                            Add-On
                          </div>
                        )}

                        <h4
                          className="text-sm font-bold text-[#1a1a2e] mb-1 pr-14 leading-snug"
                          style={{ fontFamily: 'var(--font-playfair)' }}
                        >
                          {service.title}
                        </h4>
                        <p className="text-[#9CA3AF] text-xs leading-relaxed mb-3">
                          {service.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-[#E91E8C]">
                              ₱{service.price.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-1 text-[#C4B5BA]">
                              <Clock size={10} />
                              <span className="text-[10px]">{service.duration}</span>
                            </div>
                          </div>
                          <button
                            onClick={openBookingModal}
                            className="flex items-center gap-1 text-[10px] font-bold text-white bg-[#E91E8C] hover:bg-[#C2177A] px-3 py-1.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-pink-200 opacity-0 group-hover:opacity-100"
                          >
                            Book
                            <ArrowRight size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-10 text-center">
          <p className="text-[#9CA3AF] text-xs mb-4">
            Prices are in Philippine Peso (₱). Duration is approximate. Contact us for packages and group bookings.
          </p>
          <button
            onClick={openBookingModal}
            className="inline-flex items-center gap-2 bg-[#E91E8C] hover:bg-[#C2177A] text-white font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all duration-300 text-sm"
          >
            Book Your Service
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
