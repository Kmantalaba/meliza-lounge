'use client';

import { useState, useEffect } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ReviewModal() {
  const { showReviewModal, setShowReviewModal, submitReview, user, userReview } = useApp();
  const [rating, setRating] = useState(userReview?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(userReview?.comment ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync fields if userReview changes (e.g. after load)
  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment ?? '');
    }
  }, [userReview]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowReviewModal(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setShowReviewModal]);

  if (!showReviewModal) return null;

  const active = hovered || rating;
  const isEditing = !!userReview;

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  const handleSubmit = async () => {
    if (!rating) { setError('Please select a star rating.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await submitReview(rating, comment.trim());
      setShowReviewModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={() => setShowReviewModal(false)}
    >
      <div
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#FFF0F7] to-[#FDE8F3] px-8 pt-8 pb-6">
          <button
            onClick={() => setShowReviewModal(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center transition-colors"
          >
            <X size={15} className="text-[#525252]" />
          </button>
          <h2 className="text-2xl font-bold text-[#1a1a2e]" style={{ fontFamily: 'var(--font-playfair)' }}>
            {isEditing ? 'Edit Your Review' : 'Leave a Review'}
          </h2>
          <p className="text-[#9CA3AF] text-sm mt-1">
            {user?.firstName ? `Hi ${user.firstName}! ` : ''}How was your experience at The Meliza Lounge?
          </p>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Star rating */}
          <div className="text-center">
            <label className="block text-xs font-semibold text-[#525252] mb-3">Your Rating</label>
            <div className="flex gap-1.5 justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-115 active:scale-95"
                >
                  <Star
                    size={38}
                    className="transition-colors duration-150"
                    fill={active >= star ? '#E91E8C' : 'transparent'}
                    color={active >= star ? '#E91E8C' : '#FBCFE8'}
                  />
                </button>
              ))}
            </div>
            {active > 0 && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-bold text-[#E91E8C]">{LABELS[active]}</span>
                <span className="text-xs text-[#9CA3AF]">·</span>
                <span className="text-xs text-[#9CA3AF]">{active} point{active > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-[#525252] mb-1.5">
              Your Comment <span className="text-[#9CA3AF] font-normal">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience…"
              rows={3}
              maxLength={400}
              className="w-full border border-pink-100 rounded-xl px-4 py-2.5 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#E91E8C] focus:ring-1 focus:ring-[#E91E8C]/20 placeholder:text-[#C4B5BA] resize-none"
            />
            <p className="text-right text-[10px] text-[#C4B5BA] mt-0.5">{comment.length}/400</p>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!rating || submitting}
            className="w-full bg-[#E91E8C] hover:bg-[#C2177A] disabled:bg-pink-200 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 shadow-md shadow-pink-200 flex items-center justify-center gap-2"
          >
            {submitting
              ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
              : isEditing ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
