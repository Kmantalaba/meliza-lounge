'use client';

import { useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Clock, ChevronRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getMinBookingDate, toDateString, isMonday, cn } from '@/lib/utils';

const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^(\+?63|0)9\d{9}$/, 'Enter a valid PH number (e.g. 09XXXXXXXXX)'),
  service: z.string().min(1, 'Please select a service'),
  notes: z.string().optional(),
});

type BookingFormFields = z.infer<typeof bookingSchema>;

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

export default function Booking() {
  const { user, openBookingModal, getAvailableSlots, bookAppointment, setShowAuthModal, setAuthMode } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const minDate = useMemo(() => getMinBookingDate(3), []);

  const dateString = selectedDate ? toDateString(selectedDate) : '';
  const availableSlots = useMemo(() => (dateString ? getAvailableSlots(dateString) : []), [dateString, getAvailableSlots]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BookingFormFields>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: BookingFormFields) => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      toast.info('Please log in to book an appointment.');
      return;
    }
    if (!dateString) { toast.error('Please select a date.'); return; }
    if (!selectedTime) { toast.error('Please select a time slot.'); return; }

    setIsSubmitting(true);
    try {
      await bookAppointment({ ...data, date: dateString, time: selectedTime });
      setSuccess(true);
      reset();
      setSelectedDate(undefined);
      setSelectedTime('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    if (date < minDate) return true;
    const ds = toDateString(date);
    return isMonday(ds);
  };

  if (success) {
    return (
      <section id="booking" className="section-padding bg-pink-gradient">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-pink-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              Appointment Confirmed!
            </h2>
            <p className="text-[#6B7280] text-sm mb-6 leading-relaxed">
              Your appointment has been booked. We will contact you to confirm the details.
              See you soon!
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="bg-[#E91E8C] hover:bg-[#C2177A] text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors shadow-md shadow-pink-200"
            >
              Book Another
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="section-padding bg-pink-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#E91E8C] text-sm font-semibold tracking-widest uppercase mb-3">
            Schedule
          </span>
          <h2
            className="text-4xl lg:text-5xl font-bold text-[#1a1a2e]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Book Your Appointment
          </h2>
          <p className="text-[#6B7280] mt-4 max-w-lg mx-auto text-base leading-relaxed">
            Select your preferred date, time, and service. Bookings require at least
            3 days advance notice. We are closed on Mondays.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Step 1 — Calendar */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100">
            <h3 className="text-base font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#E91E8C] text-white text-xs flex items-center justify-center font-bold">1</span>
              Select a Date
            </h3>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(d) => { setSelectedDate(d); setSelectedTime(''); }}
              disabled={isDateDisabled}
              showOutsideDays={false}
              className="w-full"
              classNames={{
                root: 'w-full',
                month_grid: 'w-full border-collapse',
                day: 'w-9 h-9',
                day_button: cn(
                  'w-9 h-9 rounded-full text-sm font-medium transition-all duration-150',
                  'hover:bg-[#FFF0F7] hover:text-[#E91E8C]'
                ),
                selected: '[&>button]:bg-[#E91E8C] [&>button]:text-white [&>button]:font-bold [&>button]:shadow-md',
                today: '[&>button]:ring-2 [&>button]:ring-[#E91E8C]/40 [&>button]:text-[#E91E8C] [&>button]:font-semibold',
                disabled: '[&>button]:text-gray-200 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent',
                nav: 'flex justify-between items-center mb-3',
                button_previous: 'w-8 h-8 rounded-full hover:bg-[#FFF0F7] flex items-center justify-center text-[#525252] transition-colors',
                button_next: 'w-8 h-8 rounded-full hover:bg-[#FFF0F7] flex items-center justify-center text-[#525252] transition-colors',
                month_caption: 'text-sm font-semibold text-[#1a1a2e]',
                weekday: 'text-xs text-[#9CA3AF] font-medium py-2',
              }}
            />
            {selectedDate && isMonday(toDateString(selectedDate)) && (
              <div className="mt-3 flex items-center gap-2 text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">
                <AlertCircle size={12} />
                Closed on Mondays. Please choose another day.
              </div>
            )}
          </div>

          {/* Step 2 — Time Slots */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100">
            <h3 className="text-base font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#E91E8C] text-white text-xs flex items-center justify-center font-bold">2</span>
              Choose a Time
            </h3>

            {!selectedDate && (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Clock size={32} className="text-pink-200 mb-3" />
                <p className="text-sm text-[#9CA3AF]">Select a date first to see available slots</p>
              </div>
            )}

            {selectedDate && availableSlots.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <AlertCircle size={32} className="text-pink-300 mb-3" />
                <p className="text-sm text-[#9CA3AF]">No available slots on this date</p>
                <p className="text-xs text-[#C4B5B5] mt-1">Please choose a different day</p>
              </div>
            )}

            {selectedDate && availableSlots.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-[#9CA3AF] mb-3">
                  {availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''} available
                </p>
                {/* Morning */}
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Morning</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {availableSlots.filter(s => parseInt(s) < 13).map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2.5 text-sm font-medium rounded-xl border-2 transition-all duration-150 ${
                        selectedTime === slot
                          ? 'bg-[#E91E8C] border-[#E91E8C] text-white shadow-md shadow-pink-200'
                          : 'border-pink-100 text-[#525252] hover:border-[#E91E8C] hover:text-[#E91E8C] hover:bg-[#FFF0F7]'
                      }`}
                    >
                      {TIME_LABELS[slot]}
                    </button>
                  ))}
                </div>
                {/* Afternoon */}
                {availableSlots.some(s => parseInt(s) >= 13) && (
                  <>
                    <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Afternoon</p>
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.filter(s => parseInt(s) >= 13).map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2.5 text-sm font-medium rounded-xl border-2 transition-all duration-150 ${
                            selectedTime === slot
                              ? 'bg-[#E91E8C] border-[#E91E8C] text-white shadow-md shadow-pink-200'
                              : 'border-pink-100 text-[#525252] hover:border-[#E91E8C] hover:text-[#E91E8C] hover:bg-[#FFF0F7]'
                          }`}
                        >
                          {TIME_LABELS[slot]}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Step 3 — Contact Form */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100">
            <h3 className="text-base font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#E91E8C] text-white text-xs flex items-center justify-center font-bold">3</span>
              Your Details
            </h3>

            {!user && (
              <div className="mb-4 flex items-start gap-2.5 bg-[#FFF0F7] rounded-xl p-3 border border-pink-100">
                <AlertCircle size={14} className="text-[#E91E8C] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#E91E8C]">
                  <button
                    onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                    className="font-bold underline"
                  >
                    Log in
                  </button>{' '}
                  or{' '}
                  <button
                    onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                    className="font-bold underline"
                  >
                    sign up
                  </button>{' '}
                  to book an appointment.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Name */}
              <div>
                <input
                  {...register('name')}
                  placeholder="Full name *"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none transition-all focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-pink-100 bg-[#FFF9FC]'
                  }`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Email address *"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none transition-all focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-pink-100 bg-[#FFF9FC]'
                  }`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="Phone number (09XX-XXX-XXXX) *"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none transition-all focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 ${
                    errors.phone ? 'border-red-300 bg-red-50' : 'border-pink-100 bg-[#FFF9FC]'
                  }`}
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              {/* Service select */}
              <div>
                <select
                  {...register('service')}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#525252] outline-none transition-all focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 bg-[#FFF9FC] ${
                    errors.service ? 'border-red-300 bg-red-50' : 'border-pink-100'
                  }`}
                >
                  <option value="">Select a service *</option>
                  {SERVICES_LIST.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.service && <p className="text-red-400 text-xs mt-1">{errors.service.message}</p>}
              </div>

              {/* Notes */}
              <textarea
                {...register('notes')}
                placeholder="Special requests or notes (optional)"
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-pink-100 bg-[#FFF9FC] text-sm placeholder:text-[#C4B5BA] text-[#1a1a2e] outline-none transition-all focus:border-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/10 resize-none"
              />

              {/* Summary */}
              {selectedDate && selectedTime && (
                <div className="bg-[#FFF0F7] rounded-xl p-3 text-xs text-[#E91E8C] border border-pink-100">
                  <p className="font-semibold">Booking summary</p>
                  <p className="mt-1 text-[#C2177A]">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {TIME_LABELS[selectedTime]}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !selectedDate || !selectedTime}
                className="w-full bg-[#E91E8C] hover:bg-[#C2177A] disabled:bg-pink-200 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 shadow-md shadow-pink-200 hover:shadow-pink-300 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Confirming…
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
