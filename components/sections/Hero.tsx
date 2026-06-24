'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, Users, Award, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

/* ── Count-up hook ─────────────────────────────────────────────────── */
function useCountUp(end: number, duration: number, active: boolean, decimals = 0) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * end).toFixed(decimals)));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, end, duration, decimals]);

  return count;
}

/* ── Stat with count-up ─────────────────────────────────────────────── */
interface StatDef {
  icon: React.ElementType;
  end: number;
  decimals: number;
  suffix: string;
  label: string;
  color: string;
}

const STAT_DEFS: StatDef[] = [
  { icon: Star,  end: 5.0, decimals: 1, suffix: '',     label: 'Rating',       color: '#F59E0B' },
  { icon: Users, end: 500, decimals: 0, suffix: '+',    label: 'Happy Clients', color: '#E91E8C' },
  { icon: Award, end: 5,   decimals: 0, suffix: ' Yrs', label: 'Experience',   color: '#8B5CF6' },
];

function StatItem({ stat, active }: { stat: StatDef; active: boolean }) {
  const count = useCountUp(stat.end, 1600, active, stat.decimals);
  const Icon = stat.icon;
  const display = stat.decimals > 0
    ? `${count.toFixed(stat.decimals)}${stat.suffix}`
    : `${Math.floor(count)}${stat.suffix}`;

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${stat.color}18` }}
      >
        <Icon size={16} style={{ color: stat.color }} />
      </div>
      <div>
        <p className="text-base font-bold text-[#1a1a2e] leading-none">{display}</p>
        <p className="text-xs text-[#9CA3AF] mt-0.5">{stat.label}</p>
      </div>
    </div>
  );
}

/* ── Nail card data ─────────────────────────────────────────────────── */
const NAIL_CARDS = [
  { label: 'French Tip', image: '/french-2.jpg', rotate: '-6deg', top: '0px',   left: '0px',  zIndex: 1 },
  { label: 'French Tip', image: '/french-1.jpg', rotate: '5deg',  top: '55px',  left: '90px', zIndex: 2 },
  { label: 'French Tip', image: '/french-3.png', rotate: '-2deg', top: '125px', left: '18px', zIndex: 3 },
];

/* ── Hero ───────────────────────────────────────────────────────────── */
export default function Hero() {
  const { openBookingModal } = useApp();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Trigger stat count-up when the stats row is visible
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStatsVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-pink-gradient pt-20"
    >
      {/* Decorative circle — top right */}
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #E91E8C 0%, transparent 70%)',
          animation: 'heroCirclePulse 6s ease-in-out infinite',
        }}
      />
      {/* Decorative circle — bottom left */}
      <div
        aria-hidden
        className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #FF69B4 0%, transparent 70%)',
          animation: 'heroCirclePulse 8s ease-in-out infinite 1s',
          opacity: 0.10,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left — text ─────────────────────────────────────────── */}
          <div className="order-2 lg:order-1">

            {/* Pill badge — slides in from left */}
            <div
              className="inline-flex items-center gap-2 bg-white/80 border border-pink-200 rounded-full px-4 py-1.5 mb-6 shadow-sm anim-fade-left delay-0"
            >
              <Sparkles size={14} className="text-[#E91E8C]" />
              <span className="text-[#E91E8C] text-xs font-semibold tracking-wide uppercase">
                Premium Nail Studio
              </span>
            </div>

            {/* H1 — words stagger in */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#1a1a2e] leading-[1.05] mb-4"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              <span className="block anim-fade-up delay-100">Beautiful{' '}
                <span
                  className="italic"
                  style={{
                    background: 'linear-gradient(135deg, #E91E8C 0%, #FF6BB3 60%, #C2177A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Nails,
                </span>
              </span>
              <span className="block anim-fade-up delay-250">
                <span className="text-[#1a1a2e]">Confident</span>{' '}
                <span
                  className="italic"
                  style={{
                    background: 'linear-gradient(135deg, #E91E8C 0%, #FF6BB3 60%, #C2177A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  You.
                </span>
              </span>
            </h1>

            <p className="text-[#6B7280] text-lg leading-relaxed mb-8 max-w-md anim-fade-up delay-400">
              Indulge in luxury nail artistry that elevates your confidence. From elegant
              gel manicures to intricate nail art, every visit is a pampering experience.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10 anim-fade-up delay-500">
              <button
                onClick={openBookingModal}
                className="group inline-flex items-center justify-center gap-2 bg-[#E91E8C] hover:bg-[#C2177A] text-white font-semibold px-7 py-3.5 rounded-full shadow-xl shadow-pink-200 hover:shadow-pink-300 transition-all duration-300 text-sm anim-pulse-ring"
              >
                Book Appointment
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#gallery"
                className="inline-flex items-center justify-center gap-2 text-[#E91E8C] border-2 border-[#E91E8C] hover:bg-[#FFF0F7] font-semibold px-7 py-3.5 rounded-full transition-all duration-300 text-sm"
              >
                View Gallery
              </a>
            </div>

            {/* Stats with count-up */}
            <div ref={statsRef} className="flex items-center gap-6 flex-wrap anim-fade-up delay-600">
              {STAT_DEFS.map((stat) => (
                <StatItem key={stat.label} stat={stat} active={statsVisible} />
              ))}
            </div>
          </div>

          {/* ── Right — nail art cards ───────────────────────────────── */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <div className="relative w-72 h-80 sm:w-96 sm:h-96 mx-auto">
              {/* Background glow circle */}
              <div
                className="absolute inset-4 rounded-full opacity-30"
                style={{ background: 'radial-gradient(circle, #FFB6C1 0%, #E91E8C 100%)' }}
              />

              {/* French tip photo cards — staggered scale in */}
              {NAIL_CARDS.map((card, i) => {
                const isHovered = hoveredCard === i;
                const isOtherHovered = hoveredCard !== null && hoveredCard !== i;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`absolute w-44 h-52 sm:w-52 sm:h-64 rounded-2xl overflow-hidden cursor-pointer anim-scale-in`}
                    style={{
                      top: card.top,
                      left: card.left,
                      zIndex: isHovered ? 20 : card.zIndex,
                      animationDelay: `${200 + i * 150}ms`,
                      transform: isHovered
                        ? 'rotate(0deg) scale(1.13) translateY(-10px)'
                        : isOtherHovered
                        ? `rotate(${card.rotate}) scale(0.95)`
                        : `rotate(${card.rotate}) scale(1)`,
                      boxShadow: isHovered
                        ? '0 32px 80px rgba(233,30,140,0.45), 0 0 0 3px rgba(233,30,140,0.25)'
                        : '0 20px 60px rgba(233,30,140,0.28)',
                      transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease',
                      opacity: isOtherHovered ? 0.75 : 1,
                    }}
                  >
                    <Image
                      src={card.image}
                      alt={card.label}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 176px, 208px"
                      priority={i === 2}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(233,30,140,0.12) 0%, transparent 60%)',
                        opacity: isHovered ? 1 : 0,
                      }}
                    />
                    <div
                      className="absolute bottom-3 left-3 right-3 z-10 transition-all duration-300"
                      style={{
                        transform: isHovered ? 'translateY(0)' : 'translateY(4px)',
                        opacity: isHovered ? 1 : 0.85,
                      }}
                    >
                      <span className="text-white text-xs font-semibold bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        {card.label}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Floating "Top Rated" badge */}
              <div
                className="absolute -bottom-4 -right-4 sm:-right-8 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2 anim-float-badge"
                style={{ zIndex: 10 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6BB3] flex items-center justify-center">
                  <Star size={14} fill="white" className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1a1a2e]">Top Rated</p>
                  <p className="text-[10px] text-[#9CA3AF]">Nail Studio</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
