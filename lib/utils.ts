import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

