import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isMonday(dateString: string): boolean {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day).getDay() === 1;
}

export function getMinBookingDate(advanceDays = 3): Date {
  const date = new Date();
  date.setDate(date.getDate() + advanceDays);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatPhone(phone: string): string {
  return phone.replace(/(\+?63|0)(9\d{2})(\d{3})(\d{4})/, (_, prefix, a, b, c) => {
    const normalized = prefix.startsWith('+') ? '+63' : '0';
    return `${normalized}${a}-${b}-${c}`;
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
}
