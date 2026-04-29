-- Connect+ Database Schema
-- Run this in your Supabase SQL Editor

-- 1. ENUMS (Custom Types) with check to avoid "already exists" error
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'coach', 'coachee');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('inactive', 'pending_approval', 'active', 'suspended', 'rejected');
    ELSE
        -- If it exists, make sure 'inactive' is one of the values
        BEGIN
            ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'inactive';
        EXCEPTION
            WHEN others THEN NULL; -- Some versions of Postgres don't support IF NOT EXISTS on ADD VALUE
        END;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
        CREATE TYPE session_status AS ENUM ('pending_coach_approval', 'confirmed', 'completed', 'cancelled', 'rescheduled');
    END IF;
END $$;

-- 2. USERS TABLE
-- First, try to remove the constraint if it exists from a previous run
DO $$ BEGIN
    ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY, -- Removed strict AUTH reference for demo flexibility
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'coachee' NOT NULL,
  status user_status DEFAULT 'inactive' NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COACH PROFILES (Extended data for coaches)
CREATE TABLE IF NOT EXISTS public.coach_profiles (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  title TEXT,
  specialties TEXT[],
  hourly_rate NUMERIC,
  years_experience INTEGER,
  nationality TEXT,
  country_based TEXT,
  diplomas_certifications TEXT[],
  is_featured BOOLEAN DEFAULT false,
  approval_status user_status DEFAULT 'pending_approval',
  rating_avg NUMERIC DEFAULT 5.0,
  sessions_completed INTEGER DEFAULT 0
);

-- 4. SESSIONS (Appointments)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.profiles(id) NOT NULL,
  coachee_id UUID REFERENCES public.profiles(id) NOT NULL,
  topic TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status session_status DEFAULT 'pending_coach_approval' NOT NULL,
  meeting_url TEXT,
  coach_notes TEXT,
  coachee_notes TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,
  attachments TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Coach Profiles: Everyone can see active ones, coaches can see their own, and admins see all
DROP POLICY IF EXISTS "Public coach profile visibility" ON public.coach_profiles;
CREATE POLICY "Public coach profile visibility" ON public.coach_profiles
  FOR SELECT USING (approval_status = 'active' OR id = auth.uid());

DROP POLICY IF EXISTS "Coaches can update own profile" ON public.coach_profiles;
CREATE POLICY "Coaches can update own profile" ON public.coach_profiles
  FOR UPDATE USING (id = auth.uid());

-- Profiles: Users can see all active coaches, and only their own private data
DROP POLICY IF EXISTS "Public profile visibility" ON public.profiles;
CREATE POLICY "Public profile visibility" ON public.profiles
  FOR SELECT USING (status = 'active' OR id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Sessions: Users can see sessions they are part of
DROP POLICY IF EXISTS "Session visibility" ON public.sessions;
CREATE POLICY "Session visibility" ON public.sessions
  FOR SELECT USING (auth.uid() IN (coach_id, coachee_id));

DROP POLICY IF EXISTS "Coach edit sessions" ON public.sessions;
CREATE POLICY "Coach edit sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = coach_id);

-- 6. FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, status)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    new.email, 
    CASE WHEN new.email = 'trang.tt@erickson.vn' THEN 'admin'::user_role ELSE 'coachee'::user_role END,
    CASE WHEN new.email = 'trang.tt@erickson.vn' THEN 'active'::user_status ELSE 'inactive'::user_status END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The following trigger should be created on auth.users in the Supabase SQL Editor
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate trigger for idempotency
DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
