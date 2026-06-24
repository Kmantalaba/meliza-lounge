'use client';

import { Star, PenLine, CheckCircle, MessageCircle } from 'lucide-react';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { useApp } from '@/context/AppContext';

const STAR_COLORS = ['#E91E8C', '#DB2777', '#BE185D', '#9D174D', '#831843'];

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < rating ? '#E91E8C' : 'transparent'}
          color={i < rating ? '#E91E8C' : '#FBCFE8'}
        />
      ))}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function Testimonials() {
  const { user, reviews, userReview, setShowReviewModal } = useApp();
  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: gridRef } = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div
          ref={headerRef}
          className={`reveal ${headerVisible ? 'in-view' : ''} grid lg:grid-cols-2 gap-10 items-start mb-12`}
        >
          <div>
            <span className="inline-block text-[#E91E8C] text-sm font-semibold tracking-widest uppercase mb-3">
              Client Love
            </span>
            <h2
              className="text-4xl lg:text-5xl font-bold text-[#1a1a2e] leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              What Clients{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #E91E8C 0%, #FF6BB3 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Say
              </span>
            </h2>

            {/* Leave a Review CTA — only for logged-in users */}
            {user && (
              <div className="mt-5">
                {userReview ? (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#E91E8C] border-2 border-[#E91E8C]/30 hover:border-[#E91E8C] bg-[#FFF0F7] hover:bg-[#FFE0F0] px-5 py-2.5 rounded-full transition-all duration-200"
                  >
                    <PenLine size={15} />
                    Edit Your Review
                  </button>
                ) : (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#E91E8C] hover:bg-[#C2177A] px-5 py-2.5 rounded-full shadow-md shadow-pink-200 transition-all duration-200"
                  >
                    <PenLine size={15} />
                    Leave a Review
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Rating summary — only shown when reviews exist */}
          {reviews.length > 0 && (
            <div className="lg:text-right">
              <div className="inline-flex flex-col items-center lg:items-end gap-2 bg-[#FFF0F7] rounded-2xl px-6 py-5 border border-pink-100">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold text-[#1a1a2e]" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-[#6B7280] text-sm mb-1">/ 5.0</span>
                </div>
                <StarRating rating={Math.round(avgRating)} size={20} />
                <p className="text-[#6B7280] text-xs">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}
        </div>

        {/* Reviews grid — always rendered so IntersectionObserver stays active */}
        <div ref={gridRef}>
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F7] flex items-center justify-center mb-4">
                <MessageCircle size={28} className="text-pink-300" />
              </div>
              <p className="text-[#1a1a2e] font-semibold text-lg mb-1">No reviews yet</p>
              <p className="text-[#9CA3AF] text-sm">
                {user
                  ? 'Be the first to share your experience!'
                  : 'Log in to be the first to leave a review.'}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((review, i) => {
                const initials = review.user_name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);
                const color = STAR_COLORS[i % STAR_COLORS.length];

                return (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl p-6 border border-[#F3E8F0] hover:border-[#E91E8C]/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <StarRating rating={review.rating} />
                      <span className="text-[10px] font-semibold text-white bg-[#E91E8C] px-2.5 py-1 rounded-full">
                        {review.rating}/5
                      </span>
                    </div>

                    {review.comment ? (
                      <p className="text-[#525252] text-sm leading-relaxed mb-5 line-clamp-4">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    ) : (
                      <p className="text-[#C4B5BA] text-sm italic mb-5">No comment left.</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm"
                          style={{ background: `linear-gradient(135deg, ${color}, #FF6BB3)` }}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-1">
                            {review.user_name}
                            <CheckCircle size={11} className="text-[#E91E8C]" />
                          </p>
                          <p className="text-[10px] text-[#9CA3AF]">Verified Client</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#C4B5BA]">{timeAgo(review.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
