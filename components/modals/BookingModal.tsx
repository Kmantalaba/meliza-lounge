'use client';

import { useState, useMemo, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { X, Clock, ChevronRight, Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getMinBookingDate, toDateString, isMonday, cn } from '@/lib/utils';

const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^(\+?63|0)9\d{9}$/, 'Enter a valid PH number (09XXXXXXXXX)'),
  service: z.string().min(1, 'Please select a service'),
  notes: z.string().optional(),
});
type BookingFields = z.infer<typeof bookingSchema>;

const SERVICES_LIST = [
  'Classic Manicure', 'French Manicure', 'Gel Manicure',
  'Minimalist Nail Art', 'Floral Nail Art', 'Ombre / Gradient',
  'Acrylic Extensions', 'Gel Extensions', 'Builder Gel Overlay',
];

const TIME_LABELS: Record<string, string> = {
  '09:00': '9:00 AM', '10:00': '10:00 AM', '11:00': '11:00 AM',
  '12:00': '12:00 PM', '13:00': '1:00 PM', '14:00': '2:00 PM',
  '15:00': '3:00 PM', '16:00': '4:00 PM', '17:00': '5:00 PM',
};

type Step = 1 | 2 | 3;

export default function BookingModal() {
  const { showBookingModal, setShowBookingModal, user, getAvailableSlots, bookAppointment } = useApp();
  const [step, setStep] = useState<Step>(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const minDate = useMemo(() => getMinBookingDate(3), []);
  const dateString = selectedDate ? toDateString(selectedDate) : '';
  const availableSlots = useMemo(() => (dateString ? getAvailableSlots(dateString) : []), [dateString, getAvailableSlots]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BookingFields>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  // Reset when modal opens
  useEffect(() => {
    if (showBookingModal) {
      setStep(1);
      setSelectedDate(undefined);
      setSelectedTime('');
      setDone(false);
      reset({ name: user?.name || '', email: user?.email || '' });
    }
  }, [showBookingModal, user, reset]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowBookingModal(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setShowBookingModal]);

  if (!showBookingModal) return null;

  const isDateDisabled = (date: Date) => date < minDate || isMonday(toDateString(date));

  const onSubmit = async (data: BookingFields) => {
    if (!dateString || !selectedTime) { toast.error('Please complete date and time selection.'); return; }
    setIsSubmitting(true);
    try {
      await bookAppointment({ ...data, date: dateString, time: selectedTime });
      setDone(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Booking failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const STEPS = [
    { num: 1, label: 'Date' },
    { num: 2, label: 'Time' },
    { num: 3, label: 'Details' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={() => setShowBookingModal(false)}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#FFF0F7] to-[#FDE8F3] px-6 pt-6 pb-5 flex-shrink-0">
          <button
            onClick={() => setShowBookingModal(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center transition-colors"
          >
            <X size={15} className="text-[#525252]" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-[#E91E8C]" />
            <span className="text-[#E91E8C] text-sm font-semibold">Book Appointment</span>
          </div>
          <h2
            className="text-xl font-bold text-[#1a1a2e]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            The Meliza Lounge
          </h2>

          {/* Step indicator */}
          {!done && (
            <div className="flex items-center gap-2 mt-4">
              {STEPS.map(({ num, label }, i) => (
                <div key={num} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step >= num ? 'bg-[#E91E8C] text-white' : 'bg-white/60 text-[#9CA3AF]'
                      }`}
                    >
                      {step > num ? <CheckCircle2 size={12} /> : num}
                    </div>
                    <span className={`text-xs font-medium ${step >= num ? 'text-[#E91E8C]' : 'text-[#9CA3AF]'}`}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px ${step > num ? 'bg-[#E91E8C]' : 'bg-white/40'}`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {done ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a2e] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                All Set!
              </h3>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
                Your appointment on{' '}
                <strong>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>{' '}
                at <strong>{TIME_LABELS[selectedTime]}</strong> has been confirmed.
              </p>
              <button
                onClick={() => setShowBookingModal(false)}
                className="bg-[#E91E8C] hover:bg-[#C2177A] text-white font-semibold px-8 py-2.5 rounded-full text-sm transition-colors shadow-md shadow-pink-200"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Step 1 — Date */}
              {step === 1 && (
                <div>
                  <p className="text-sm text-[#6B7280] mb-4">
                    Choose a date (3+ days in advance, closed Mondays)
                  </p>
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); setSelectedTime(''); }}
                    disabled={isDateDisabled}
                    showOutsideDays={false}
                    classNames={{
                      root: 'w-full',
                      month_grid: 'w-full border-collapse',
                      day: 'w-9 h-9',
                      day_button: cn(
                        'w-9 h-9 rounded-full text-sm font-medium transition-all duration-150',
                        'hover:bg-[#FFF0F7] hover:text-[#E91E8C]'
                      ),
                      selected: '[&>button]:bg-[#E91E8C] [&>button]:text-white [&>button]:font-bold',
                      today: '[&>button]:ring-2 [&>button]:ring-[#E91E8C]/40 [&>button]:text-[#E91E8C]',
                      disabled: '[&>button]:text-gray-200 [&>button]:cursor-not-allowed',
                      nav: 'flex justify-between items-center mb-3',
                      button_previous: 'w-8 h-8 rounded-full hover:bg-[#FFF0F7] flex items-center justify-center text-[#525252] transition-colors',
                      button_next: 'w-8 h-8 rounded-full hover:bg-[#FFF0F7] flex items-center justify-center text-[#525252] transition-colors',
                      month_caption: 'text-sm font-semibold text-[#1a1a2e]',
                      weekday: 'text-xs text-[#9CA3AF] font-medium py-2',
                    }}
                  />
                  <button
                    disabled={!selectedDate}
                    onClick={() => setStep(2)}
                    className="mt-4 w-full bg-[#E91E8C] hover:bg-[#C2177A] disabled:bg-pink-200 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Step 2 — Time */}
              {step === 2 && (
                <div>
                  <p className="text-sm text-[#6B7280] mb-4">
                    Available slots for{' '}
                    <strong className="text-[#1a1a2e]">
                      {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </strong>
                  </p>

                  {availableSlots.length === 0 ? (
                    <div className="flex flex-col items-center py-10 text-center">
                      <AlertCircle size={32} className="text-pink-300 mb-3" />
                      <p className="text-sm text-[#9CA3AF]">No slots available. Please choose another date.</p>
                      <button onClick={() => setStep(1)} className="mt-4 text-[#E91E8C] text-sm font-semibold hover:underline">
                        ← Go back
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {['morning', 'afternoon'].map((period) => {
                        const slots = availableSlots.filter((s) =>
                          period === 'morning' ? parseInt(s) < 13 : parseInt(s) >= 13
                        );
                        if (!slots.length) return null;
                        return (
                          <div key={period}>
                            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2 capitalize">
                              {period}
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {slots.map((slot) => (
                                <button
                                  key={slot}
                                  onClick={() => setSelectedTime(slot)}
                                  className={`py-3 text-sm font-medium rounded-xl border-2 transition-all duration-150 flex flex-col items-center gap-0.5 ${
                                    selectedTime === slot
                                      ? 'bg-[#E91E8C] border-[#E91E8C] text-white shadow-md shadow-pink-200'
                                      : 'border-pink-100 text-[#525252] hover:border-[#E91E8C] hover:text-[#E91E8C] hover:bg-[#FFF0F7]'
                                  }`}
                                >
                                  <Clock size={13} />
                                  <span>{TIME_LABELS[slot]}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-2.5 rounded-xl border border-pink-100 text-sm text-[#525252] hover:bg-[#FFF0F7] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      disabled={!selectedTime}
                      onClick={() => setStep(3)}
                      className="flex-1 bg-[#E91E8C] hover:bg-[#C2177A] disabled:bg-pink-200 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      Continue <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 — Details */}
              {step === 3 && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  {/* Summary */}
                  <div className="bg-[#FFF0F7] rounded-xl px-4 py-3 border border-pink-100 mb-2">
                    <p className="text-xs text-[#E91E8C] font-semibold">
                      {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      {' '}at{' '}
                      {TIME_LABELS[selectedTime]}
                    </p>
                  </div>

                  <div>
                    <input
                      {...register('name')}
                      placeholder="Full name *"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 transition-all ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-pink-100 bg-[#FFF9FC]'
                      }`}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="Email address *"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 transition-all ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-pink-100 bg-[#FFF9FC]'
                      }`}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="Phone (09XXXXXXXXX) *"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 transition-all ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-pink-100 bg-[#FFF9FC]'
                      }`}
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <select
                      {...register('service')}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#525252] outline-none focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 transition-all bg-[#FFF9FC] ${
                        errors.service ? 'border-red-300' : 'border-pink-100'
                      }`}
                    >
                      <option value="">Select service *</option>
                      {SERVICES_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.service && <p className="text-red-400 text-xs mt-1">{errors.service.message}</p>}
                  </div>

                  <textarea
                    {...register('notes')}
                    placeholder="Special requests (optional)"
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-100 bg-[#FFF9FC] text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 transition-all resize-none"
                  />

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-2.5 rounded-xl border border-pink-100 text-sm text-[#525252] hover:bg-[#FFF0F7] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-[#E91E8C] hover:bg-[#C2177A] disabled:bg-pink-200 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Booking…</> : 'Confirm Booking'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
