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
    v_admin_id UUID := '00000000-0000-0000-0000-000000000001';
    v_coach_id UUID := '00000000-0000-0000-0000-000000000002';
    v_coachee_id UUID := '00000000-0000-0000-0000-000000000003';
    v_coach_2_id UUID := '00000000-0000-0000-0000-000000000004';
    v_coach_3_id UUID := '00000000-0000-0000-0000-000000000005';
    v_coach_4_id UUID := '00000000-0000-0000-0000-000000000006';
    v_coachee_2_id UUID := '00000000-0000-0000-0000-000000000007';
    v_coachee_3_id UUID := '00000000-0000-0000-0000-000000000008';
BEGIN
    -- Ensure columns exist (in case schema is out of sync)
    BEGIN
        ALTER TABLE public.coach_profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
        ALTER TABLE public.coach_profiles ADD COLUMN IF NOT EXISTS country_based TEXT;
        ALTER TABLE public.coach_profiles ADD COLUMN IF NOT EXISTS specialties TEXT[];
        ALTER TABLE public.coach_profiles ADD COLUMN IF NOT EXISTS diplomas_certifications TEXT[];
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS coach_notes TEXT;
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS coachee_notes TEXT;
        ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS action_items JSONB DEFAULT '[]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Clean up existing seed data to allow fresh run if needed
    DELETE FROM public.sessions WHERE coach_id IN (v_coach_id, v_coach_2_id, v_coach_3_id, v_coach_4_id);
    DELETE FROM public.coach_profiles WHERE id IN (v_coach_id, v_coach_2_id, v_coach_3_id, v_coach_4_id);
    DELETE FROM public.profiles WHERE id IN (v_admin_id, v_coach_id, v_coach_2_id, v_coach_3_id, v_coach_4_id, v_coachee_id, v_coachee_2_id, v_coachee_3_id);

    -- Insert Profiles
    INSERT INTO public.profiles (id, full_name, email, role, status, bio)
    VALUES 
        (v_admin_id, 'Platform Admin', 'trang.tt@erickson.vn', 'admin', 'active', 'System administrator.'),
        (v_coach_id, 'Marcus Aurelius', 'marcus@coach.com', 'coach', 'active', 'Senior Executive coach focusing on leadership and resilience.'),
        (v_coach_2_id, 'Dr. Elena Vance', 'elena@coach.com', 'coach', 'active', 'Behavioral specialist & EQ expert with a focus on burnout prevention.'),
        (v_coach_3_id, 'Maya Lin', 'maya@coach.com', 'coach', 'active', 'Career transition specialist helping leaders find their next pivot.'),
        (v_coach_4_id, 'James Wilson', 'james@coach.com', 'coach', 'active', 'Financial mindset performance coach for high-stakes environments.'),
        (v_coachee_id, 'Sarah Jenkins', 'sarah@user.com', 'coachee', 'active', 'Marketing director building leadership skills for team expansion.'),
        (v_coachee_2_id, 'Alex Rivera', 'alex@user.com', 'coachee', 'pending_approval', 'Product manager aspiring to lead cross-functional teams in tech.'),
        (v_coachee_3_id, 'Chen Wei', 'chen@user.com', 'coachee', 'pending_approval', 'Software architect transitioning to a senior management role.')
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        bio = EXCLUDED.bio;

    -- Insert Coach Specific Data
    INSERT INTO public.coach_profiles (id, title, specialties, nationality, country_based, diplomas_certifications, hourly_rate, years_experience, is_featured, approval_status)
    VALUES 
        (v_coach_id, 'Senior Executive Coach', ARRAY['Leadership', 'Stoicism', 'Strategy'], 'Italian', 'Vietnam', ARRAY['ICF Master Coach', 'PhD in Leadership'], 250, 15, true, 'active'),
        (v_coach_2_id, 'Behavioral Scientist', ARRAY['Psychology', 'EQ', 'Burnout'], 'American', 'USA', ARRAY['PhD Psychology', 'Board Certified Coach'], 180, 10, false, 'active'),
        (v_coach_3_id, 'Career Transformation Lead', ARRAY['Career Path', 'Interviewing', 'Branding'], 'Singaporean', 'Singapore', ARRAY['Certified Career Coach', 'MBA'], 150, 20, true, 'active'),
        (v_coach_4_id, 'Performance Strategist', ARRAY['Focus', 'Productivity', 'Mindset'], 'British', 'UK', ARRAY['NLP Practitioner', 'MSc Finance'], 200, 12, false, 'active')
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        specialties = EXCLUDED.specialties,
        nationality = EXCLUDED.nationality,
        country_based = EXCLUDED.country_based,
        diplomas_certifications = EXCLUDED.diplomas_certifications;

    -- Insert Sample Sessions
    -- 1. Completed Session (Marcus)
    INSERT INTO public.sessions (coach_id, coachee_id, topic, start_time, duration_minutes, status, meeting_url, coach_notes, coachee_notes, action_items)
    VALUES 
        (v_coach_id, v_coachee_id, 'Stoic Leadership Principles', NOW() - INTERVAL '2 days', 60, 'completed', 'https://zoom.us/j/123456789', 'The coachee showed great progress in applying dichotomy of control...', 'I feel much more centered after this session...', '[{"text": "Read Meditations Book 1", "completed": true}, {"text": "Practice morning reflection", "completed": false}]'::jsonb)
    ON CONFLICT DO NOTHING;

    -- 2. Completed Session (Elena)
    INSERT INTO public.sessions (coach_id, coachee_id, topic, start_time, duration_minutes, status, meeting_url, coach_notes, coachee_notes, action_items)
    VALUES 
        (v_coach_2_id, v_coachee_id, 'Emotional IQ Assessment', NOW() - INTERVAL '5 days', 60, 'completed', 'https://zoom.us/j/123456789', 'Sarah has a high level of self-awareness but struggles with social regulation in high-stress meetings.', 'The primary takeaway was identifying my triggers during board meetings.', '[{"text": "Complete EQ-i 2.0 Assessment", "completed": true}, {"text": "Journal 3 stressful interactions this week", "completed": true}]'::jsonb)
    ON CONFLICT DO NOTHING;

    -- 3. Upcoming Confirmed Session
    INSERT INTO public.sessions (coach_id, coachee_id, topic, start_time, duration_minutes, status, meeting_url)
    VALUES 
        (v_coach_2_id, v_coachee_id, 'Conflict Resolution in Teams', NOW() + INTERVAL '1 day', 45, 'confirmed', 'https://zoom.us/j/987654321')
    ON CONFLICT DO NOTHING;

    -- 3. Pending Approval Session
    INSERT INTO public.sessions (coach_id, coachee_id, topic, start_time, duration_minutes, status)
    VALUES 
        (v_coach_id, v_coachee_id, 'Deep Work Strategy', NOW() + INTERVAL '3 days', 60, 'pending_coach_approval')
    ON CONFLICT DO NOTHING;

END $$;
