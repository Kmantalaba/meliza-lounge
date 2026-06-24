-- ============================================================
--  The Meliza Lounge — Supabase Schema  (fixed)
--  Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. profiles table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  first_name  TEXT        NOT NULL DEFAULT '',
  last_name   TEXT        NOT NULL DEFAULT '',
  role        TEXT        NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Helper function (avoids RLS infinite-recursion) ───────
-- Returns the current user's role without triggering RLS on profiles.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- ── 3. Row-Level Security — profiles ─────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles: self select"      ON public.profiles;
DROP POLICY IF EXISTS "profiles: self update"      ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin select all" ON public.profiles;

-- Users can read their own profile
CREATE POLICY "profiles: self select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles: self update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Admins can read all profiles (uses helper function — no recursion)
CREATE POLICY "profiles: admin select all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- ── 4. Auto-create profile on signup ─────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 5. appointments table ─────────────────────────────────────
-- NOTE: user_id is TEXT here to match the existing app data.
-- auth.uid() is cast to TEXT in all policies to avoid the
-- "operator does not exist: uuid = text" error.

CREATE TABLE IF NOT EXISTS public.appointments (
  id          BIGSERIAL   PRIMARY KEY,
  user_id     TEXT        NOT NULL,
  date        TEXT        NOT NULL,
  time        TEXT        NOT NULL,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  phone       TEXT        NOT NULL,
  service     TEXT,
  notes       TEXT,
  status      TEXT        NOT NULL DEFAULT 'confirmed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appointments: owner select" ON public.appointments;
DROP POLICY IF EXISTS "appointments: owner insert" ON public.appointments;
DROP POLICY IF EXISTS "appointments: owner delete" ON public.appointments;
DROP POLICY IF EXISTS "appointments: admin all"    ON public.appointments;

-- Cast auth.uid() to TEXT so it matches the TEXT user_id column
CREATE POLICY "appointments: owner select"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "appointments: owner insert"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "appointments: owner delete"
  ON public.appointments FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Admins can do everything (uses helper function — no recursion)
CREATE POLICY "appointments: admin all"
  ON public.appointments FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- ── 6. gallery_images table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id            BIGSERIAL   PRIMARY KEY,
  title         TEXT        NOT NULL,
  category      TEXT        NOT NULL CHECK (category IN ('Nail Art', 'Manicure', 'Extensions')),
  storage_path  TEXT        NOT NULL,
  url           TEXT        NOT NULL,
  size          TEXT        NOT NULL DEFAULT 'normal' CHECK (size IN ('normal', 'tall')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_images: public read"  ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_images: admin insert" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_images: admin delete" ON public.gallery_images;

-- Anyone (including visitors) can view gallery images
CREATE POLICY "gallery_images: public read"
  ON public.gallery_images FOR SELECT
  TO public
  USING (true);

-- Only admins can add images
CREATE POLICY "gallery_images: admin insert"
  ON public.gallery_images FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() = 'admin');

-- Only admins can delete images
CREATE POLICY "gallery_images: admin delete"
  ON public.gallery_images FOR DELETE
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- ── 7. Storage bucket for gallery images ─────────────────────
-- Run these in Supabase Dashboard → Storage → New bucket:
--   Bucket name : gallery
--   Public      : YES (toggle on)
--
-- Then in SQL Editor add storage policies:

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "gallery storage: public read"  ON storage.objects;
DROP POLICY IF EXISTS "gallery storage: admin upload" ON storage.objects;
DROP POLICY IF EXISTS "gallery storage: admin delete" ON storage.objects;

CREATE POLICY "gallery storage: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'gallery');

CREATE POLICY "gallery storage: admin upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'gallery'
    AND public.current_user_role() = 'admin'
  );

CREATE POLICY "gallery storage: admin delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'gallery'
    AND public.current_user_role() = 'admin'
  );

-- ── 9. reviews table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          BIGSERIAL   PRIMARY KEY,
  user_id     TEXT        NOT NULL UNIQUE,
  user_name   TEXT        NOT NULL,
  rating      INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews: public read"  ON public.reviews;
DROP POLICY IF EXISTS "reviews: owner insert" ON public.reviews;
DROP POLICY IF EXISTS "reviews: owner update" ON public.reviews;
DROP POLICY IF EXISTS "reviews: owner delete" ON public.reviews;
DROP POLICY IF EXISTS "reviews: admin all"    ON public.reviews;

-- Anyone (including visitors) can read reviews
CREATE POLICY "reviews: public read"
  ON public.reviews FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert their own review
CREATE POLICY "reviews: owner insert"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own review
CREATE POLICY "reviews: owner update"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Users can delete their own review
CREATE POLICY "reviews: owner delete"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Admins can manage all reviews
CREATE POLICY "reviews: admin all"
  ON public.reviews FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- ── 8. Admin account ─────────────────────────────────────────
-- STEP A: Supabase Dashboard → Authentication → Users → Add user
--   Email    : melizaalf1719@gmail.com
--   Password : (choose a strong password)
--   Click "Create user"
--
-- STEP B: After creating the auth user, run this block:

UPDATE public.profiles
SET
  first_name = 'Meliza',
  last_name  = 'Alferez',
  role       = 'admin'
WHERE email = 'melizaalf1719@gmail.com';

-- If the profile row was not auto-created (trigger may not have fired
-- for manually-created users), insert it manually.
-- Replace 'PASTE-UUID-HERE' with the UUID from Authentication → Users.
--
-- INSERT INTO public.profiles (id, email, first_name, last_name, role)
-- VALUES ('PASTE-UUID-HERE', 'melizaalf1719@gmail.com', 'Meliza', 'Alferez', 'admin')
-- ON CONFLICT (id) DO UPDATE
--   SET role = 'admin', first_name = 'Meliza', last_name = 'Alferez';
