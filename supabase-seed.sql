-- Connect+ Seed Data
-- Run this in your Supabase SQL Editor after running supabase-schema.sql

-- Note: In a real app, IDs would come from auth.users. 
-- For this seed to work easily, we assume you might want to create some dummy profiles first.
-- WARNING: This is for development/testing only.

-- 1. Create dummy profiles (Note: normally these link to auth.users)
-- Since we can't easily guess your auth.users IDs, we'll create some 
-- known UUIDs for testing purposes. You might need to adjust these 
-- if you want to link them to real logged-in users later.

DO $$
DECLARE
    admin_id UUID := '00000000-0000-0000-0000-000000000001';
    coach_id UUID := '00000000-0000-0000-0000-000000000002';
    coachee_id UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
    -- Insert Profiles
    INSERT INTO public.profiles (id, full_name, email, role, status, bio)
    VALUES 
        (admin_id, 'Platform Admin', 'admin@connectplus.com', 'admin', 'active', 'System administrator.'),
        (coach_id, 'Marcus Aurelius', 'marcus@coach.com', 'coach', 'active', 'Executive coach focusing on resilience and leadership.'),
        (coachee_id, 'Sarah Jenkins', 'sarah@user.com', 'coachee', 'active', 'Marketing director looking for growth.')
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        status = EXCLUDED.status;

    -- Insert Coach Specific Data
    INSERT INTO public.coach_profiles (id, title, specialties, hourly_rate, years_experience, is_featured, approval_status)
    VALUES 
        (coach_id, 'Senior Executive Coach', ARRAY['Leadership', 'Stoicism', 'Strategy'], 250, 15, true, 'active')
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        specialties = EXCLUDED.specialties;

    -- Insert a Sample Session
    INSERT INTO public.sessions (coach_id, coachee_id, topic, start_time, duration_minutes, status, meeting_url)
    VALUES 
        (coach_id, coachee_id, 'Quarterly Planning', NOW() + INTERVAL '1 day', 60, 'confirmed', 'https://zoom.us/j/123456789')
    ON CONFLICT DO NOTHING;

END $$;
