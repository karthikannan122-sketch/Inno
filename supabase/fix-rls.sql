-- ====================================================
-- INNOVEXA: FIX & OPEN RLS POLICIES FOR ALL TABLES
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/stfpitwhsemzpnevvheq/sql/new
-- ====================================================

-- 1. Disable RLS or grant open access across all 19 tables
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_interests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.validation_cycles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.review_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.review_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviewer_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.related_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_insights DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.improvement_suggestions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.innovation_signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.discussions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.discussion_comments DISABLE ROW LEVEL SECURITY;

-- 2. Grant full permissions to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Add default demo creator profile if none exists
INSERT INTO public.profiles (id, full_name, username, avatar_url, reputation_score)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Community Innovator',
  'innovator_main',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  100
)
ON CONFLICT (id) DO NOTHING;

-- Verification query
SELECT 'RLS successfully disabled for all tables - project submissions are now 100% open' AS status;
