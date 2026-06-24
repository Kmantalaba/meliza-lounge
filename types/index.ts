export interface Appointment {
  id: number;
  user_id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  service: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string; // computed: firstName + ' ' + lastName
  role: 'admin' | 'user';
}

export interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: string;
  category: 'manicure' | 'pedicure' | 'nail-art' | 'extension';
  gradient: string;
  popular?: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

export type AuthMode = 'login' | 'register';

export interface Review {
  id: number;
  user_id: string;
  user_name: string;
  rating: number; // 1–5; points = rating value
  comment: string | null;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  category: 'Nail Art' | 'Manicure' | 'Extensions';
  src: string; // object URL from file upload
  size: 'normal' | 'tall';
}
