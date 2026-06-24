'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X, LogOut, User, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const { user, isAdmin, logout, setShowAuthModal, setAuthMode, openBookingModal } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
    setMobileOpen(false);
  };

  const handleRegister = () => {
    setAuthMode('register');
    setShowAuthModal(true);
    setMobileOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(233,30,140,0.08)]'
          : 'bg-white/80 backdrop-blur-sm'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/meliza_logo.png"
                alt="The Meliza Lounge"
                fill
                className="object-contain"
                sizes="40px"
                priority
              />
            </div>
            <div className="leading-tight">
              <p
                className="text-[#E91E8C] font-bold text-base tracking-wide"
                style={{ fontFamily: 'var(--font-dancing)' }}
              >
                The Meliza
              </p>
              <p className="text-[#1a1a2e] text-[10px] font-semibold tracking-[0.15em] uppercase -mt-0.5">
                Lounge
              </p>
            </div>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#525252] hover:text-[#E91E8C] text-sm font-medium transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#E91E8C] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            {isAdmin && (
              <a
                href="#admin"
                className="text-[#E91E8C] hover:text-[#C2177A] text-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck size={14} />
                Admin
              </a>
            )}
          </div>

          {/* Desktop auth + CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFF0F7] rounded-full">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6BB3] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user.name[0]?.toUpperCase()}</span>
                  </div>
                  <span className="text-[#E91E8C] text-sm font-medium">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm text-[#525252] hover:text-red-500 transition-colors"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="text-sm font-medium text-[#525252] hover:text-[#E91E8C] transition-colors flex items-center gap-1.5"
                >
                  <User size={14} />
                  Login
                </button>
                <button
                  onClick={handleRegister}
                  className="text-sm font-medium text-white bg-[#E91E8C] hover:bg-[#C2177A] px-4 py-2 rounded-full shadow-md shadow-pink-200 hover:shadow-pink-300 transition-all duration-200"
                >
                  Sign Up
                </button>
              </>
            )}
            <button
              onClick={openBookingModal}
              className="text-sm font-semibold text-[#E91E8C] border-2 border-[#E91E8C] hover:bg-[#E91E8C] hover:text-white px-5 py-2 rounded-full transition-all duration-200"
            >
              Book Now
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-[#525252] hover:text-[#E91E8C] hover:bg-[#FFF0F7] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-pink-100 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 text-[#525252] hover:text-[#E91E8C] hover:bg-[#FFF0F7] rounded-lg text-sm font-medium transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {isAdmin && (
              <a
                href="#admin"
                className="block px-4 py-2.5 text-[#E91E8C] hover:bg-[#FFF0F7] rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <ShieldCheck size={14} />
                Admin Dashboard
              </a>
            )}
            <div className="pt-3 px-4 space-y-2 border-t border-pink-100">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6BB3] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user.name[0]?.toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium text-[#E91E8C]">{user.name}</span>
                  </div>
                  <button onClick={logout} className="text-sm text-red-400 hover:text-red-600">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleLogin}
                    className="flex-1 py-2.5 text-sm font-medium border border-[#E91E8C] text-[#E91E8C] rounded-full hover:bg-[#FFF0F7] transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRegister}
                    className="flex-1 py-2.5 text-sm font-medium bg-[#E91E8C] text-white rounded-full hover:bg-[#C2177A] transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
              <button
                onClick={() => { openBookingModal(); setMobileOpen(false); }}
                className="w-full py-2.5 text-sm font-semibold bg-[#E91E8C] text-white rounded-full hover:bg-[#C2177A] transition-colors shadow-md shadow-pink-200"
              >
                Book Appointment
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
