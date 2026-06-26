'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { isMonday, toDateString, getMinBookingDate } from '@/lib/utils';
import type { Appointment, UserProfile, BookingFormData, AuthMode, GalleryImage, Review } from '@/types';

const DEPLOY_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'melizaalf1719@gmail.com';
const WORKING_HOURS = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

/* ── helper: fetch profile row and build UserProfile ─────────────────── */
async function fetchUserProfile(userId: string, email: string): Promise<UserProfile> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role')
    .eq('id', userId)
    .single();

  const firstName  = profile?.first_name  || email.split('@')[0];
  const lastName   = profile?.last_name   || '';
  const role: 'admin' | 'user' =
    profile?.role === 'admin' || email === DEPLOY_ADMIN_EMAIL ? 'admin' : 'user';

  return {
    id: userId,
    email,
    firstName,
    lastName,
    name: `${firstName}${lastName ? ' ' + lastName : ''}`,
    role,
  };
}

/* ── context type ────────────────────────────────────────────────────── */
interface AppContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  appointments: Appointment[];
  userAppointments: Appointment[];
  showAuthModal: boolean;
  showBookingModal: boolean;
  authMode: AuthMode;
  setShowAuthModal: (show: boolean) => void;
  setShowBookingModal: (show: boolean) => void;
  setAuthMode: (mode: AuthMode) => void;
  openBookingModal: () => void;
  getAvailableSlots: (dateString: string) => string[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  bookAppointment: (data: BookingFormData) => Promise<void>;
  cancelAppointment: (id: number) => Promise<void>;
  supabaseStatus: { connected: boolean; message: string };
  galleryImages: GalleryImage[];
  addGalleryImage: (file: File, title: string, category: GalleryImage['category']) => Promise<void>;
  removeGalleryImage: (id: string) => Promise<void>;
  reviews: Review[];
  userReview: Review | null;
  showReviewModal: boolean;
  setShowReviewModal: (show: boolean) => void;
  submitReview: (rating: number, comment: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [supabaseStatus, setSupabaseStatus] = useState({
    connected: false,
    message: 'Checking connection…',
  });
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const isAdmin = user?.role === 'admin';

  const loadAppointments = useCallback(async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });
    if (!error && data) setAppointments(data as Appointment[]);
  }, []);

  const loadReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setReviews(data as Review[]);
  }, []);

  const loadGalleryImages = useCallback(async () => {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('id, title, category, url, size')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setGalleryImages(
        data.map((row) => ({
          id:       String(row.id),
          title:    row.title,
          category: row.category as GalleryImage['category'],
          src:      row.url,
          size:     row.size as GalleryImage['size'],
        }))
      );
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setSupabaseStatus({ connected: false, message: 'Missing Supabase env vars.' });
        setIsLoading(false);
        return;
      }

      const { error: healthErr } = await supabase.from('appointments').select('id').limit(1);
      if (healthErr) {
        setSupabaseStatus({ connected: false, message: `Supabase: ${healthErr.message}` });
      } else {
        setSupabaseStatus({ connected: true, message: 'Connected' });
      }

      // Load public data (no auth required)
      await Promise.all([loadGalleryImages(), loadReviews()]);

      // Restore existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id, session.user.email!);
        setUser(profile);
        await loadAppointments();
      }
      setIsLoading(false);
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchUserProfile(session.user.id, session.user.email!);
        setUser(profile);
        await loadAppointments();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAppointments([]);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [loadAppointments, loadReviews]);

  const getAvailableSlots = useCallback(
    (dateString: string): string[] => {
      if (!dateString) return [];
      if (isMonday(dateString)) return [];

      const dayBookings = appointments.filter((a) => a.date === dateString);
      if (!dayBookings.length) return WORKING_HOURS;

      const hasMorning   = dayBookings.some((a) => parseInt(a.time.split(':')[0]) < 13);
      const hasAfternoon = dayBookings.some((a) => parseInt(a.time.split(':')[0]) >= 13);

      if (hasMorning && hasAfternoon) return [];
      if (hasMorning)   return WORKING_HOURS.filter((s) => parseInt(s.split(':')[0]) >= 13);
      if (hasAfternoon) return WORKING_HOURS.filter((s) => parseInt(s.split(':')[0]) < 13);
      return WORKING_HOURS;
    },
    [appointments]
  );

  const openBookingModal = useCallback(() => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setShowBookingModal(true);
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error) throw new Error('Invalid email or password. Please try again.');

    const profile = await fetchUserProfile(data.user.id, data.user.email!);
    setUser(profile);
    setShowAuthModal(false);
    toast.success(`Welcome back, ${profile.firstName}!`);
    await loadAppointments();
  }, [loadAppointments]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAppointments([]);
    toast.success('Logged out successfully.');
  }, []);

  const bookAppointment = useCallback(async (formData: BookingFormData) => {
    if (!user) throw new Error('Must be logged in to book.');

    const minDate = toDateString(getMinBookingDate(3));
    if (formData.date < minDate) throw new Error('Bookings must be at least 3 days in advance.');
    if (isMonday(formData.date)) throw new Error('We are closed on Mondays. Please select another date.');

    const available = getAvailableSlots(formData.date);
    if (!available.includes(formData.time)) throw new Error('This time slot is no longer available.');

    const { error } = await supabase.from('appointments').insert({
      user_id: user.id,
      date:    formData.date,
      time:    formData.time,
      name:    formData.name,
      email:   formData.email,
      phone:   formData.phone,
      service: formData.service || null,
      notes:   formData.notes   || null,
      status:  'confirmed',
    });

    if (error) throw new Error('Booking failed. Please try again.');
    await loadAppointments();
    setShowBookingModal(false);
    toast.success('Appointment confirmed! We will see you soon.', { duration: 5000 });
  }, [user, getAvailableSlots, loadAppointments]);

  const addGalleryImage = useCallback(async (
    file: File,
    title: string,
    category: GalleryImage['category'],
  ) => {
    const ext  = file.name.split('.').pop() ?? 'jpg';
    const path = `designs/${Date.now()}.${ext}`;

    // 1 — upload file to Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from('gallery')
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

    // 2 — get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(path);

    // 3 — insert metadata row
    const { data, error: insertErr } = await supabase
      .from('gallery_images')
      .insert({ title, category, storage_path: path, url: publicUrl, size: 'normal' })
      .select('id, title, category, url, size')
      .single();

    if (insertErr) {
      // roll back the uploaded file
      await supabase.storage.from('gallery').remove([path]);
      throw new Error(`Failed to save: ${insertErr.message}`);
    }

    setGalleryImages((prev) => [
      {
        id:       String(data.id),
        title:    data.title,
        category: data.category as GalleryImage['category'],
        src:      data.url,
        size:     data.size as GalleryImage['size'],
      },
      ...prev,
    ]);
  }, []);

  const removeGalleryImage = useCallback(async (id: string) => {
    // get storage path before deleting the row
    const { data: row } = await supabase
      .from('gallery_images')
      .select('storage_path')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);

    if (error) { toast.error('Failed to remove image.'); return; }

    // best-effort storage cleanup
    if (row?.storage_path) {
      await supabase.storage.from('gallery').remove([row.storage_path]);
    }

    setGalleryImages((prev) => prev.filter((img) => img.id !== id));
    toast.success('Image removed.');
  }, []);

  const submitReview = useCallback(async (rating: number, comment: string) => {
    if (!user) throw new Error('Must be logged in to submit a review.');
    const { error } = await supabase
      .from('reviews')
      .upsert(
        { user_id: user.id, user_name: user.name, rating, comment: comment || null },
        { onConflict: 'user_id' }
      );
    if (error) throw new Error('Failed to submit review. Please try again.');
    await loadReviews();
    toast.success('Thank you for your review!');
  }, [user, loadReviews]);

  const cancelAppointment = useCallback(async (id: number) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) { toast.error('Failed to cancel appointment.'); return; }
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    toast.success('Appointment cancelled.');
  }, []);

  const userAppointments = useMemo(
    () => (user ? appointments.filter((a) => a.user_id === user.id) : []),
    [user, appointments]
  );

  const userReview = useMemo(
    () => (user ? (reviews.find((r) => r.user_id === user.id) ?? null) : null),
    [user, reviews]
  );

  const value: AppContextType = {
    user, isAdmin, isLoading, appointments, userAppointments,
    showAuthModal, showBookingModal, authMode,
    setShowAuthModal, setShowBookingModal, setAuthMode,
    openBookingModal, getAvailableSlots,
    login, logout, bookAppointment, cancelAppointment,
    supabaseStatus,
    galleryImages, addGalleryImage, removeGalleryImage,
    reviews, userReview, showReviewModal, setShowReviewModal, submitReview,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
