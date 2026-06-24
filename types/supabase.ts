export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type AppointmentRow = {
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
};

export type AppointmentInsert = {
  user_id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  service?: string | null;
  status?: string;
  notes?: string | null;
};
