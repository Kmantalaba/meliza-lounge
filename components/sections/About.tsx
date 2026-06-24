'use client';

import Image from 'next/image';
import { CheckCircle2, Heart, Gem, Clock } from 'lucide-react';
import { useScrollReveal } from '@/lib/useScrollReveal';

const PROMISES = [
  { icon: Gem,          text: 'Premium, safe products only' },
  { icon: Heart,        text: 'Personalized attention for every client' },
  { icon: CheckCircle2, text: 'Hygienic, sanitized tools every visit' },
  { icon: Clock,        text: 'Timely service — your time is precious' },
];

export default function About() {
  const { ref: imgRef,  visible: imgVisible  } = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const { ref: txtRef,  visible: txtVisible  } = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section id="about" className="section-padding bg-pink-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — image composition */}
          <div
            ref={imgRef}
            className={`reveal-left ${imgVisible ? 'in-view' : ''} relative flex justify-center lg:justify-start`}
          >
            <div className="relative w-full max-w-sm">
              <div className="w-full h-96 rounded-3xl shadow-2xl overflow-hidden relative">
                <Image
                  src="/profile.png"
                  alt="Meliza — Nail Artist"
                  fill
                  className="object-cover object-top"
                  priority
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(233,30,140,0.18) 0%, transparent 100%)' }}
                />
              </div>

              {/* Floating experience card */}
              <div
                className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl p-4 w-36 anim-float"
                style={{ animationDelay: '0.5s' }}
              >
                <p className="text-3xl font-bold text-[#E91E8C]" style={{ fontFamily: 'var(--font-playfair)' }}>
                  5+
                </p>
                <p className="text-xs text-[#6B7280] font-medium leading-tight mt-0.5">
                  Years of nail artistry
                </p>
              </div>

              {/* Floating clients card */}
              <div
                className="absolute -top-5 -left-5 bg-white rounded-2xl shadow-xl p-4 w-32 anim-float"
                style={{ animationDelay: '1.2s' }}
              >
                <p className="text-3xl font-bold text-[#E91E8C]" style={{ fontFamily: 'var(--font-playfair)' }}>
                  500+
                </p>
                <p className="text-xs text-[#6B7280] font-medium leading-tight mt-0.5">
                  Happy clients
                </p>
              </div>
            </div>
          </div>

          {/* Right — text */}
          <div
            ref={txtRef}
            className={`reveal-right ${txtVisible ? 'in-view' : ''}`}
          >
            <span className="inline-block text-[#E91E8C] text-sm font-semibold tracking-widest uppercase mb-3">
              About Meliza
            </span>
            <h2
              className="text-4xl lg:text-5xl font-bold text-[#1a1a2e] mb-2 leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Nail Artisan &amp;{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #E91E8C 0%, #FF6BB3 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Beauty Creator
              </span>
            </h2>

            <div className="w-12 h-1 rounded-full bg-[#E91E8C] mb-6" />

            <p className="text-[#6B7280] text-base leading-relaxed mb-4">
              Hi! I&apos;m <strong className="text-[#1a1a2e] font-semibold">Meliza</strong>, a certified nail
              technician with over 5 years of experience transforming nails into works of art.
              My passion started with a simple love for beauty and creativity, and has grown
              into a full-service nail studio.
            </p>
            <p className="text-[#6B7280] text-base leading-relaxed mb-8">
              At The Meliza Lounge, every client receives a personalized experience — from the moment
              you walk in until your nails are picture-perfect. I believe beautiful nails should
              be accessible, safe, and uniquely yours.
            </p>

            {/* Her Promise */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
              <h3
                className="text-lg font-bold text-[#1a1a2e] mb-4"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Her Promise to You
              </h3>
              <ul className="space-y-3">
                {PROMISES.map(({ icon: Icon, text }, idx) => (
                  <li
                    key={text}
                    className={`flex items-start gap-3 reveal ${txtVisible ? 'in-view' : ''}`}
                    style={{ transitionDelay: `${idx * 100 + 200}ms` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#FFF0F7] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={13} className="text-[#E91E8C]" />
                    </div>
                    <span className="text-[#525252] text-sm">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
