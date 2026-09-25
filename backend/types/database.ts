export type ProjectType = 'idea' | 'product' | 'startup';
export type ProjectStatus = 'draft' | 'under_review' | 'published' | 'archived';

export type ValidationStage = 
  | 'idea' 
  | 'problem_validation' 
  | 'gathering_feedback' 
  | 'validated' 
  | 'needs_improvement' 
  | 'ready_to_launch';

export type ProblemRelevance = 'yes' | 'sometimes' | 'no';
export type SolutionClarity = 'yes' | 'partially' | 'no';
export type Usefulness = 'yes' | 'maybe' | 'no';
export type DifferentiationRating = 'yes' | 'maybe' | 'no';
export type ReviewCategoryType = 'constructive' | 'suggestion' | 'question' | 'praise';
export type FeedbackDecisionType = 'apply' | 'save_later' | 'ignore';
export type SuggestionStatus = 'suggested' | 'applied' | 'saved' | 'dismissed';

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  reputation_score: number;
  interests?: string[];
  roles?: string[];
  created_at: string;
}

export interface UserInterest {
  id: string;
  user_id: string;
  interest: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
}

export interface Project {
  id: string;
  owner_id: string;
  owner_name?: string;
  owner_avatar?: string;
  title: string;
  project_type: ProjectType;
  category: string;
  problem_title: string;
  problem_description: string;
  solution_description: string;
  target_audience: string;
  value_proposition: string;
  differentiation: string;
  live_url?: string;
  github_url?: string;
  demo_url?: string;
  cover_image_url?: string;
  status: ProjectStatus;
  validation_status?: ValidationStage;
  visibility: 'public' | 'unlisted' | 'private';
  tags: string[];
  current_version: number;
  created_at: string;
  updated_at: string;
  
  // Validation Journey & Computed fields
  validation_score?: number; // 0-100%
  readiness_score?: number;
  signals?: InnovationSignals;
  reviews_count?: number;
  perspectives_count?: number;
  upvotes_count?: number;
  downvotes_count?: number;
  user_vote?: 'up' | 'down' | null;
  is_demo?: boolean;
}

export interface InnovationSignals {
  problem_relevance: number; // 0-100%
  solution_clarity: number;  // 0-100%
  user_interest: number;     // 0-100%
  differentiation: number;   // 0-100%
  readiness: number;         // 0-100%
  overall: number;           // 0-100%
  strong_signals: string[];
  concerns: string[];
}

export interface ProjectVote {
  project_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface SimilarSolutionComparison {
  id: string;
  name: string;
  type: 'open_source' | 'saas_competitor' | 'workspace_project';
  category: string;
  description: string;
  similarityScore?: number; // e.g. 82%
  similarityReason?: string;
  similarityBreakdown?: {
    problem: number;    // e.g. 91%
    audience: number;   // e.g. 82%
    domain: number;     // e.g. 90%
    solution: number;   // e.g. 73%
  };
  whyRelated?: string[];
  sharedCapabilities: string[];
  limitations: string[];
  uniquenessAngle: string;
  recommendedMoat: string;
  comparisonScores: {
    feature: string;
    yourProject: string;
    competitor: string;
    advantage: 'your_project' | 'competitor' | 'neutral';
  }[];
}

export interface ProjectUniquenessReport {
  projectTitle: string;
  category: string;
  similarSolutionsCount: number;
  marketCrowdedness: 'Low' | 'Moderate' | 'High';
  overallUniquenessScore: number; // 0-100
  executiveMessage: string;
  similarSolutions: SimilarSolutionComparison[];
  differentiatorStrategies: {
    title: string;
    badge: string;
    description: string;
    actionableHook: string;
  }[];
  comparisonMatrix: {
    dimension: string;
    yourInnovation: string;
    existingSolutions: string;
    whyYoursWins: string;
  }[];
}

export interface ProjectVersion {
  id: string;
  project_id: string;
  version_number: number | string; // 'v1.0' or 1
  title: string;
  description: string;
  changes_summary: string;
  feedback_addressed?: string;
  validation_score?: number;
  created_at: string;
}

export interface ValidationCycle {
  id: string;
  project_id: string;
  version_id?: string;
  cycle_number: number;
  reviews_count: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  validation_score: number;
  status: 'active' | 'completed' | 'archived';
  started_at: string;
  completed_at?: string;
}

export interface ReviewQuestion {
  id: string;
  project_id?: string;
  question: string;
  question_type: 'relevance' | 'clarity' | 'usefulness' | 'differentiation' | 'custom';
  is_default: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  project_id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  reviewer_role?: string;
  cycle_id?: string;
  is_involved?: boolean; // Conflict of interest safeguard
  problem_relevance: ProblemRelevance;
  solution_clarity: SolutionClarity;
  usefulness: Usefulness;
  differentiation_rating?: DifferentiationRating;
  suggestion?: string;
  review_type: ReviewCategoryType;
  is_demo: boolean;
  quality_score: number;
  helpful_votes?: number;
  created_at: string;
}

export interface ReviewAnswer {
  id: string;
  review_id: string;
  question_id: string;
  answer: string;
  created_at: string;
}

export interface ReviewerMatch {
  id: string;
  project_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
  reviewer_role?: string;
  match_score: number; // 0-100%
  match_reasons: string[];
  domain_match: boolean;
  experience_match: boolean;
  status: 'pending' | 'completed' | 'declined';
  assigned_at: string;
}

export interface RelatedProjectData {
  id: string;
  project_id: string;
  related_project_id: string;
  related_project_title: string;
  related_project_category: string;
  similarity_score: number; // 0-100%
  breakdown: {
    problem: number;
    audience: number;
    domain: number;
    solution: number;
  };
  why_related: string[];
}

export interface ProjectInsightItem {
  id: string;
  project_id: string;
  insight_type: 'positive_signal' | 'major_concern' | 'improvement_opportunity' | 'next_action';
  title: string;
  description: string;
  category: 'Pricing' | 'UI/UX' | 'Features' | 'Trust & Security' | 'Differentiation' | 'General';
  suggestion_count: number;
  confidence: number;
}

export interface InsightCluster {
  category: 'Pricing' | 'UI/UX' | 'Features' | 'Trust & Security' | 'Differentiation';
  suggestion_count: number;
  summary: string;
  suggestions: ImprovementSuggestion[];
}

export interface ImprovementSuggestion {
  id: string;
  project_id: string;
  cluster_category: string;
  title: string;
  description: string;
  reviewers_count: number;
  status: SuggestionStatus;
  priority: 'high' | 'medium' | 'low';
  target_version?: string;
  created_at: string;
}

export interface ProjectRelationship {
  id: string;
  project_id: string;
  related_project_id: string;
  relationship_type: 'similar_audience' | 'alternative_solution' | 'shared_category' | 'complementary';
  similarity_score?: number;
  explanation: string;
  created_at: string;
  related_project?: Project;
}

export interface FeedbackDecision {
  id: string;
  project_id: string;
  review_id: string;
  decision: FeedbackDecisionType;
  target_version?: number;
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'review_received' | 'project_matched' | 'version_created' | 'discussion_reply' | 'system';
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name?: string;
  sender_avatar?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Discussion {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar?: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  is_saved?: boolean;
  created_at: string;
}

export interface DiscussionComment {
  id: string;
  discussion_id: string;
  user_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  created_at: string;
}

export interface ProjectInsightsData {
  readiness_score: number;
  total_reviews: number;
  positive_signals: { label: string; percentage: number; count: number }[];
  constructive_signals: { label: string; percentage: number; count: number }[];
  critical_signals: { label: string; percentage: number; count: number }[];
  common_suggestions: string[];
  breakdown: {
    problem_relevance: { yes: number; sometimes: number; no: number };
    solution_clarity: { yes: number; partially: number; no: number };
    usefulness: { yes: number; maybe: number; no: number };
  };
  ai_summary?: {
    strengths: string[];
    concerns: string[];
    suggested_actions: string[];
    summary_text: string;
  };
}
