-- ====================================================
-- INNOVEXA SMART VALIDATION LOOP DATABASE SCHEMA & RLS
-- "Simple feedback for users. Intelligent insights for creators."
-- ====================================================

-- 1. Extend Reviews table for Smart Validation Loop
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS first_reaction TEXT CHECK (first_reaction IN ('interesting', 'not_sure', 'needs_improvement')),
  ADD COLUMN IF NOT EXISTS solution_value TEXT CHECK (solution_value IN ('very_useful', 'useful', 'needs_improvement', 'yes', 'maybe', 'no')),
  ADD COLUMN IF NOT EXISTS selected_improvements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS comment TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_reason TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

-- 2. Individual AI Review Analysis Table
CREATE TABLE IF NOT EXISTS public.review_ai_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')) DEFAULT 'neutral' NOT NULL,
  sentiment_score NUMERIC DEFAULT 0.5 NOT NULL,
  intent TEXT CHECK (intent IN ('support', 'suggestion', 'concern', 'criticism', 'question', 'interest')) DEFAULT 'suggestion' NOT NULL,
  topics JSONB DEFAULT '[]'::jsonb NOT NULL,
  detected_concerns JSONB DEFAULT '[]'::jsonb NOT NULL,
  detected_suggestions JSONB DEFAULT '[]'::jsonb NOT NULL,
  ai_summary TEXT NOT NULL,
  actionable_improvement TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(review_id)
);

-- 3. Project Improvement Suggestions Table (AI-generated actionable recommendations)
CREATE TABLE IF NOT EXISTS public.project_improvement_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reason TEXT NOT NULL,
  source_review_count INTEGER DEFAULT 1 NOT NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium' NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'saved', 'dismissed', 'completed')) DEFAULT 'pending' NOT NULL,
  target_version TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Aggregated Project Validation Insights Table
CREATE TABLE IF NOT EXISTS public.project_validation_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  total_reviews INTEGER DEFAULT 0 NOT NULL,
  positive_percentage NUMERIC DEFAULT 0 NOT NULL,
  neutral_percentage NUMERIC DEFAULT 0 NOT NULL,
  negative_percentage NUMERIC DEFAULT 0 NOT NULL,
  problem_relevance_rate NUMERIC DEFAULT 0 NOT NULL,
  solution_interest_rate NUMERIC DEFAULT 0 NOT NULL,
  top_positive_signals JSONB DEFAULT '[]'::jsonb NOT NULL,
  top_concerns JSONB DEFAULT '[]'::jsonb NOT NULL,
  top_suggestions JSONB DEFAULT '[]'::jsonb NOT NULL,
  feedback_clusters JSONB DEFAULT '[]'::jsonb NOT NULL,
  validation_summary TEXT,
  next_steps JSONB DEFAULT '[]'::jsonb NOT NULL,
  version_number INTEGER DEFAULT 1 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id)
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.review_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_improvement_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_validation_insights ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Review AI Analysis
-- Anyone can read AI analysis for public projects
CREATE POLICY "Public read review_ai_analysis"
  ON public.review_ai_analysis FOR SELECT
  USING (true);

-- Authenticated users or server functions can insert AI analysis
CREATE POLICY "Insert review_ai_analysis"
  ON public.review_ai_analysis FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 7. RLS Policies for Project Improvement Suggestions
-- Public read for suggestions
CREATE POLICY "Public read project_improvement_suggestions"
  ON public.project_improvement_suggestions FOR SELECT
  USING (true);

-- Project owners can update suggestions status (accept, save, dismiss)
CREATE POLICY "Owner update project_improvement_suggestions"
  ON public.project_improvement_suggestions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_improvement_suggestions.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Insert policy for suggestions
CREATE POLICY "Insert project_improvement_suggestions"
  ON public.project_improvement_suggestions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 8. RLS Policies for Project Validation Insights
-- Public read for insights
CREATE POLICY "Public read project_validation_insights"
  ON public.project_validation_insights FOR SELECT
  USING (true);

-- Insert/Update policy for insights
CREATE POLICY "Upsert project_validation_insights"
  ON public.project_validation_insights FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_validation_insights.project_id
      AND projects.owner_id = auth.uid()
    ) OR auth.role() = 'authenticated' OR auth.role() = 'anon'
  );
