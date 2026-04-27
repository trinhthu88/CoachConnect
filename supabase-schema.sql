-- Connect+ Database Schema
-- Run this in your Supabase SQL Editor

-- 1. ENUMS (Custom Types)
CREATE TYPE user_role AS ENUM ('admin', 'coach', 'coachee');
CREATE TYPE user_status AS ENUM ('pending_approval', 'active', 'suspended', 'rejected');
CREATE TYPE session_status AS ENUM ('pending_coach_approval', 'confirmed', 'completed', 'cancelled', 'rescheduled');

-- 2. USERS TABLE (Extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'coachee' NOT NULL,
  status user_status DEFAULT 'pending_approval' NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COACH PROFILES (Extended data for coaches)
CREATE TABLE public.coach_profiles (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  title TEXT,
  specialties TEXT[],
  hourly_rate NUMERIC,
  years_experience INTEGER,
  is_featured BOOLEAN DEFAULT false,
  approval_status user_status DEFAULT 'pending_approval',
  rating_avg NUMERIC DEFAULT 5.0,
  sessions_completed INTEGER DEFAULT 0
);

-- 4. SESSIONS (Appointments)
CREATE TABLE public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.profiles(id) NOT NULL,
  coachee_id UUID REFERENCES public.profiles(id) NOT NULL,
  topic TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status session_status DEFAULT 'pending_coach_approval' NOT NULL,
  meeting_url TEXT,
  coach_notes_private TEXT, -- Only coach can see
  coach_notes_shared TEXT,  -- Coach and Coachee can see
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can see all active coaches, and only their own private data
CREATE POLICY "Public profile visibility" ON public.profiles
  FOR SELECT USING (status = 'active' OR id = auth.uid());

-- Sessions: Users can see sessions they are part of
CREATE POLICY "Session visibility" ON public.sessions
  FOR SELECT USING (auth.uid() IN (coach_id, coachee_id));

CREATE POLICY "Coach edit sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = coach_id);

-- 6. FUNCTIONS & TRIGGERS
-- Automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
