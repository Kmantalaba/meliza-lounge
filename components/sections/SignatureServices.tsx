'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useScrollReveal } from '@/lib/useScrollReveal';

const SIGNATURE = [
  {
    title: 'French Manicure',
    tagline: 'Timeless elegance',
    image: '/french-tip.png',
    accentColor: '#E91E8C',
    price: '₱799',
  },
  {
    title: 'Gel Manicure',
    tagline: 'Long-lasting shine',
    image: '/gel-manicure.png',
    accentColor: '#DB2777',
    price: '₱950',
  },
  {
    title: 'Nail Art Design',
    tagline: 'Custom masterpiece',
    image: '/nail-art-design.png',
    accentColor: '#BE185D',
    price: '₱1,200+',
  },
  {
    title: 'Acrylic Extensions',
    tagline: 'Length & strength',
    image: '/acrylic-extension.png',
    accentColor: '#9D174D',
    price: '₱1,500',
  },
];

export default function SignatureServices() {
  const { openBookingModal } = useApp();
  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: gridRef,   visible: gridVisible   } = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div
          ref={headerRef}
          className={`reveal ${headerVisible ? 'in-view' : ''} text-center mb-14`}
        >
          <span className="inline-block text-[#E91E8C] text-sm font-semibold tracking-widest uppercase mb-3">
            What We Offer
          </span>
          <h2
            className="text-4xl lg:text-5xl font-bold text-[#1a1a2e]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Our Signature Services
          </h2>
          <p className="text-[#6B7280] mt-4 max-w-lg mx-auto text-base leading-relaxed">
            Each service is crafted with precision and care, using only premium products
            for results that speak for themselves.
          </p>
        </div>

        {/* Cards grid */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SIGNATURE.map((item, i) => (
            <div
              key={item.title}
              className={`reveal-scale ${gridVisible ? 'in-view' : ''} group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-pink-50`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Image area */}
              <div className="h-52 relative overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Subtle gradient overlay at bottom for text legibility */}
                <div
                  className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 100%)' }}
                />
                {/* Price badge */}
                <div
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold shadow-sm"
                  style={{ color: item.accentColor }}
                >
                  {item.price}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3
                  className="text-lg font-bold text-[#1a1a2e] mb-1"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {item.title}
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">{item.tagline}</p>
                <button
                  onClick={openBookingModal}
                  className="group/btn flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200"
                  style={{ color: item.accentColor }}
                >
                  Book Now
                  <ArrowRight
                    size={14}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
