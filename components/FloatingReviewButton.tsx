'use client';

import { Star, PenLine } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function FloatingReviewButton() {
  const { user, userReview, setShowReviewModal } = useApp();

  if (!user) return null;

  return (
    <button
      onClick={() => setShowReviewModal(true)}
      title={userReview ? 'Edit your review' : 'Leave a review'}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#E91E8C] hover:bg-[#C2177A] text-white text-sm font-semibold pl-4 pr-5 py-3 rounded-full shadow-lg shadow-pink-300/50 transition-all duration-200 hover:scale-105 active:scale-95"
    >
      {userReview ? <PenLine size={16} /> : <Star size={16} fill="white" />}
      {userReview ? 'Edit Review' : 'Rate Us'}
    </button>
  );
}
