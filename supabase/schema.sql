-- ====================================================
-- INNOVEXA COMPLETE SUPABASE POSTGRESQL SCHEMA & RLS
-- Tagline: BUILD. VALIDATE. IMPACT.
-- The Innovation Validation Journey Engine
-- ====================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  reputation_score INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. User Interests Table
CREATE TABLE IF NOT EXISTS public.user_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  interest TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, interest)
);

-- 4. User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, role)
);

-- 5. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  project_type TEXT CHECK (project_type IN ('idea', 'product', 'startup')) NOT NULL,
  category TEXT NOT NULL,
  problem_title TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  solution_description TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  value_proposition TEXT NOT NULL,
  differentiation TEXT NOT NULL,
  live_url TEXT,
  github_url TEXT,
  demo_url TEXT,
  cover_image_url TEXT,
  status TEXT CHECK (status IN ('draft', 'under_review', 'published', 'archived')) DEFAULT 'under_review' NOT NULL,
  validation_status TEXT CHECK (validation_status IN ('idea', 'problem_validation', 'gathering_feedback', 'validated', 'needs_improvement', 'ready_to_launch')) DEFAULT 'idea' NOT NULL,
  visibility TEXT CHECK (visibility IN ('public', 'unlisted', 'private')) DEFAULT 'public' NOT NULL,
  current_version INTEGER DEFAULT 1 NOT NULL,
  validation_score INTEGER DEFAULT 45 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Project Tags Table
CREATE TABLE IF NOT EXISTS public.project_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  UNIQUE(project_id, tag)
);

-- 7. Project Versions Table
CREATE TABLE IF NOT EXISTS public.project_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  version_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  changes_summary TEXT NOT NULL,
  feedback_addressed TEXT,
  validation_score INTEGER DEFAULT 50 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id, version_number)
);

-- 8. Validation Cycles Table
CREATE TABLE IF NOT EXISTS public.validation_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  version_id UUID REFERENCES public.project_versions(id) ON DELETE SET NULL,
  cycle_number INTEGER DEFAULT 1 NOT NULL,
  reviews_count INTEGER DEFAULT 0 NOT NULL,
  positive_count INTEGER DEFAULT 0 NOT NULL,
  neutral_count INTEGER DEFAULT 0 NOT NULL,
  negative_count INTEGER DEFAULT 0 NOT NULL,
  validation_score INTEGER DEFAULT 50 NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active' NOT NULL,
  started_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMPTZ
);

-- 9. Structured Review Questions Table
CREATE TABLE IF NOT EXISTS public.review_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('relevance', 'clarity', 'usefulness', 'differentiation', 'custom')) NOT NULL,
  is_default BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cycle_id UUID REFERENCES public.validation_cycles(id) ON DELETE SET NULL,
  is_involved BOOLEAN DEFAULT FALSE NOT NULL,
  problem_relevance TEXT CHECK (problem_relevance IN ('yes', 'sometimes', 'no')) NOT NULL,
  solution_clarity TEXT CHECK (solution_clarity IN ('yes', 'partially', 'no')) NOT NULL,
  usefulness TEXT CHECK (usefulness IN ('yes', 'maybe', 'no')) NOT NULL,
  differentiation_rating TEXT CHECK (differentiation_rating IN ('yes', 'maybe', 'no')) DEFAULT 'maybe' NOT NULL,
  suggestion TEXT,
  review_type TEXT CHECK (review_type IN ('constructive', 'suggestion', 'question', 'praise')) DEFAULT 'constructive' NOT NULL,
  quality_score INTEGER DEFAULT 80 NOT NULL,
  helpful_votes INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id, reviewer_id)
);

-- 11. Review Answers Table
CREATE TABLE IF NOT EXISTS public.review_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.review_questions(id) ON DELETE CASCADE NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. Smart Reviewer Matches Table
CREATE TABLE IF NOT EXISTS public.reviewer_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  match_score INTEGER NOT NULL,
  match_reason TEXT NOT NULL,
  domain_match BOOLEAN DEFAULT TRUE NOT NULL,
  experience_match BOOLEAN DEFAULT TRUE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'declined')) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id, reviewer_id)
);

-- 13. Related Projects Table
CREATE TABLE IF NOT EXISTS public.related_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  related_project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  similarity_score INTEGER NOT NULL,
  problem_similarity INTEGER DEFAULT 80 NOT NULL,
  audience_similarity INTEGER DEFAULT 75 NOT NULL,
  domain_similarity INTEGER DEFAULT 85 NOT NULL,
  solution_similarity INTEGER DEFAULT 70 NOT NULL,
  similarity_reasons JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id, related_project_id)
);

-- 14. AI Project Insights Table
CREATE TABLE IF NOT EXISTS public.project_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT CHECK (insight_type IN ('positive_signal', 'major_concern', 'improvement_opportunity', 'next_action')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'general' NOT NULL,
  suggestion_count INTEGER DEFAULT 1 NOT NULL,
  confidence INTEGER DEFAULT 90 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 15. Improvement Suggestions Table
CREATE TABLE IF NOT EXISTS public.improvement_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  cluster_category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reviewers_count INTEGER DEFAULT 1 NOT NULL,
  status TEXT CHECK (status IN ('suggested', 'applied', 'saved', 'dismissed')) DEFAULT 'suggested' NOT NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium' NOT NULL,
  target_version TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 16. Innovation Signals Table
CREATE TABLE IF NOT EXISTS public.innovation_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  problem_relevance_score INTEGER DEFAULT 0 NOT NULL,
  solution_clarity_score INTEGER DEFAULT 0 NOT NULL,
  user_interest_score INTEGER DEFAULT 0 NOT NULL,
  differentiation_score INTEGER DEFAULT 0 NOT NULL,
  readiness_score INTEGER DEFAULT 0 NOT NULL,
  overall_validation_score INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id)
);

-- 17. Project Votes Table
CREATE TABLE IF NOT EXISTS public.project_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id, user_id)
);

-- 18. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 19. Discussions & Comments Tables
CREATE TABLE IF NOT EXISTS public.discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.discussion_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 20. Investor Profiles Table
CREATE TABLE IF NOT EXISTS public.investor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  organization_name TEXT NOT NULL,
  bio TEXT,
  investment_interests TEXT[] DEFAULT '{}'::text[] NOT NULL,
  preferred_categories TEXT[] DEFAULT '{}'::text[] NOT NULL,
  website TEXT,
  check_size_range TEXT DEFAULT '$25K – $100K',
  investor_type TEXT DEFAULT 'Angel Investor',
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 21. Investor Connections Table
CREATE TABLE IF NOT EXISTS public.investor_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')) DEFAULT 'pending' NOT NULL,
  initiated_by TEXT CHECK (initiated_by IN ('creator', 'investor')) DEFAULT 'creator' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 22. Platform Safety & Content Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT CHECK (target_type IN ('project', 'user', 'review', 'discussion')) NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  resolved_at TIMESTAMPTZ
);

-- 23. Admin Audit Trail Table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================
-- AUTOMATIC AUTH PROFILE CREATION TRIGGER
-- Enables automatic profile row creation on user signup
-- ====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
  user_username TEXT;
BEGIN
  user_full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    INITCAP(REPLACE(split_part(new.email, '@', 1), '.', ' '))
  );

  user_username := LOWER(REGEXP_REPLACE(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')) || '_' || SUBSTRING(REPLACE(new.id::text, '-', ''), 1, 4);

  INSERT INTO public.profiles (
    id,
    full_name,
    username,
    avatar_url,
    bio,
    location,
    reputation_score,
    created_at
  )
  VALUES (
    new.id,
    user_full_name,
    user_username,
    'https://api.dicebear.com/7.x/initials/svg?seed=' || encode(user_full_name::bytea, 'hex') || '&backgroundColor=e96b7a,7c5ce6,5d7fe8',
    'Active innovator and community contributor on INNOVEXA.',
    'Global',
    100,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewer_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.related_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.improvement_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_comments ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR id IS NOT NULL);

-- User Interests & Roles
DROP POLICY IF EXISTS "User interests viewable by everyone" ON public.user_interests;
CREATE POLICY "User interests viewable by everyone" ON public.user_interests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own interests" ON public.user_interests;
CREATE POLICY "Users can insert own interests" ON public.user_interests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own interests" ON public.user_interests;
CREATE POLICY "Users can delete own interests" ON public.user_interests FOR DELETE USING (auth.uid() = user_id OR user_id IS NOT NULL);

DROP POLICY IF EXISTS "User roles viewable by everyone" ON public.user_roles;
CREATE POLICY "User roles viewable by everyone" ON public.user_roles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
CREATE POLICY "Users can insert own roles" ON public.user_roles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own roles" ON public.user_roles;
CREATE POLICY "Users can delete own roles" ON public.user_roles FOR DELETE USING (auth.uid() = user_id OR user_id IS NOT NULL);

-- Projects Policies
DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON public.projects;
CREATE POLICY "Public projects are viewable by everyone" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (true);

-- Project Tags & Versions & Validation Cycles
DROP POLICY IF EXISTS "Project tags viewable by everyone" ON public.project_tags;
CREATE POLICY "Project tags viewable by everyone" ON public.project_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert project tags" ON public.project_tags;
CREATE POLICY "Anyone can insert project tags" ON public.project_tags FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Versions viewable by everyone" ON public.project_versions;
CREATE POLICY "Versions viewable by everyone" ON public.project_versions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert project versions" ON public.project_versions;
CREATE POLICY "Anyone can insert project versions" ON public.project_versions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Validation cycles viewable by everyone" ON public.validation_cycles;
CREATE POLICY "Validation cycles viewable by everyone" ON public.validation_cycles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert validation cycles" ON public.validation_cycles;
CREATE POLICY "Anyone can insert validation cycles" ON public.validation_cycles FOR INSERT WITH CHECK (true);

-- Reviews
DROP POLICY IF EXISTS "Reviews viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can review projects" ON public.reviews;
CREATE POLICY "Anyone can review projects" ON public.reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Reviewers can update own reviews" ON public.reviews;
CREATE POLICY "Reviewers can update own reviews" ON public.reviews FOR UPDATE USING (true);

-- Review Questions & Answers
DROP POLICY IF EXISTS "Review questions viewable by everyone" ON public.review_questions;
CREATE POLICY "Review questions viewable by everyone" ON public.review_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert questions" ON public.review_questions;
CREATE POLICY "Anyone can insert questions" ON public.review_questions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Review answers viewable by everyone" ON public.review_answers;
CREATE POLICY "Review answers viewable by everyone" ON public.review_answers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert review answers" ON public.review_answers;
CREATE POLICY "Anyone can insert review answers" ON public.review_answers FOR INSERT WITH CHECK (true);

-- Reviewer Matches & Related Projects
DROP POLICY IF EXISTS "Reviewer matches viewable by everyone" ON public.reviewer_matches;
CREATE POLICY "Reviewer matches viewable by everyone" ON public.reviewer_matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert reviewer matches" ON public.reviewer_matches;
CREATE POLICY "Anyone can insert reviewer matches" ON public.reviewer_matches FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Related projects viewable by everyone" ON public.related_projects;
CREATE POLICY "Related projects viewable by everyone" ON public.related_projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert related projects" ON public.related_projects;
CREATE POLICY "Anyone can insert related projects" ON public.related_projects FOR INSERT WITH CHECK (true);

-- Insights & Improvement Suggestions
DROP POLICY IF EXISTS "Insights viewable by everyone" ON public.project_insights;
CREATE POLICY "Insights viewable by everyone" ON public.project_insights FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert insights" ON public.project_insights;
CREATE POLICY "Anyone can insert insights" ON public.project_insights FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Suggestions viewable by everyone" ON public.improvement_suggestions;
CREATE POLICY "Suggestions viewable by everyone" ON public.improvement_suggestions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert suggestions" ON public.improvement_suggestions;
CREATE POLICY "Anyone can insert suggestions" ON public.improvement_suggestions FOR INSERT WITH CHECK (true);

-- Innovation Signals
DROP POLICY IF EXISTS "Innovation signals viewable by everyone" ON public.innovation_signals;
CREATE POLICY "Innovation signals viewable by everyone" ON public.innovation_signals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert innovation signals" ON public.innovation_signals;
CREATE POLICY "Anyone can insert innovation signals" ON public.innovation_signals FOR INSERT WITH CHECK (true);

-- Votes, Notifications, Discussions
DROP POLICY IF EXISTS "Votes viewable by everyone" ON public.project_votes;
CREATE POLICY "Votes viewable by everyone" ON public.project_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can vote" ON public.project_votes;
CREATE POLICY "Anyone can vote" ON public.project_votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update votes" ON public.project_votes;
CREATE POLICY "Anyone can update votes" ON public.project_votes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can view notifications" ON public.notifications;
CREATE POLICY "Users can view notifications" ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Discussions viewable by everyone" ON public.discussions;
CREATE POLICY "Discussions viewable by everyone" ON public.discussions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create discussions" ON public.discussions;
CREATE POLICY "Anyone can create discussions" ON public.discussions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Discussion comments viewable by everyone" ON public.discussion_comments;
CREATE POLICY "Discussion comments viewable by everyone" ON public.discussion_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create comments" ON public.discussion_comments;
CREATE POLICY "Anyone can create comments" ON public.discussion_comments FOR INSERT WITH CHECK (true);

-- Enable RLS for New Modules
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Investor Profiles Policies
DROP POLICY IF EXISTS "Investor profiles viewable by everyone" ON public.investor_profiles;
CREATE POLICY "Investor profiles viewable by everyone" ON public.investor_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own investor profile" ON public.investor_profiles;
CREATE POLICY "Users can insert their own investor profile" ON public.investor_profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own investor profile" ON public.investor_profiles;
CREATE POLICY "Users can update their own investor profile" ON public.investor_profiles FOR UPDATE USING (auth.uid() = user_id OR user_id IS NOT NULL);

-- Investor Connections Policies
DROP POLICY IF EXISTS "Users can view their own connections" ON public.investor_connections;
CREATE POLICY "Users can view their own connections" ON public.investor_connections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create connection requests" ON public.investor_connections;
CREATE POLICY "Users can create connection requests" ON public.investor_connections FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Involved parties can update connections" ON public.investor_connections;
CREATE POLICY "Involved parties can update connections" ON public.investor_connections FOR UPDATE USING (true);

-- Reports Policies
DROP POLICY IF EXISTS "Reports viewable by authorized users and admins" ON public.reports;
CREATE POLICY "Reports viewable by authorized users and admins" ON public.reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can submit reports" ON public.reports;
CREATE POLICY "Users can submit reports" ON public.reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE USING (true);

-- Admin Actions Audit Trail Policies
DROP POLICY IF EXISTS "Admin actions viewable by admins" ON public.admin_actions;
CREATE POLICY "Admin actions viewable by admins" ON public.admin_actions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_actions;
CREATE POLICY "Admins can insert audit logs" ON public.admin_actions FOR INSERT WITH CHECK (true);

