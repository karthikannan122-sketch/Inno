export type FirstReactionType = 'interesting' | 'not_sure' | 'needs_improvement';
export type ProblemRelevanceType = 'yes' | 'maybe' | 'no';
export type SolutionValueType = 'very_useful' | 'useful' | 'needs_improvement';

export type ReviewSentimentType = 'positive' | 'neutral' | 'negative' | 'mixed';
export type ReviewIntentType = 'support' | 'suggestion' | 'concern' | 'criticism' | 'question' | 'interest';
export type ImprovementStatusType = 'pending' | 'accepted' | 'saved' | 'dismissed' | 'completed';
export type ImprovementPriorityType = 'high' | 'medium' | 'low';

export interface SmartReviewInput {
  projectId: string;
  firstReaction: FirstReactionType;
  problemRelevance: ProblemRelevanceType;
  solutionValue: SolutionValueType;
  selectedImprovements: string[];
  comment?: string;
  followUpReason?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewerAvatar?: string;
  reviewerRole?: string;
}

export interface SmartReview {
  id: string;
  project_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
  reviewer_role?: string;
  first_reaction: FirstReactionType;
  problem_relevance: ProblemRelevanceType;
  solution_value: SolutionValueType;
  selected_improvements: string[];
  comment?: string;
  suggestion?: string;
  follow_up_reason?: string;
  quality_score?: number;
  created_at: string;
  updated_at?: string;
  ai_analysis?: ReviewAIAnalysis;
}

export interface ReviewAIAnalysis {
  id: string;
  review_id: string;
  project_id: string;
  sentiment: ReviewSentimentType;
  sentiment_score: number; // 0 to 1
  intent: ReviewIntentType;
  topics: string[];
  detected_concerns: string[];
  detected_suggestions: string[];
  ai_summary: string;
  actionable_improvement?: string;
  created_at: string;
  updated_at?: string;
}

export interface ProjectImprovementSuggestion {
  id: string;
  project_id: string;
  title: string;
  description: string;
  reason: string;
  source_review_count: number;
  priority: ImprovementPriorityType;
  status: ImprovementStatusType;
  cluster_category?: string;
  target_version?: string;
  created_at: string;
  updated_at?: string;
}

export interface FeedbackCluster {
  category: string;
  mention_count: number;
  summary: string;
  sample_quotes: string[];
  sentiment: ReviewSentimentType;
}

export interface ProjectValidationInsights {
  id?: string;
  project_id: string;
  total_reviews: number;
  positive_percentage: number;
  neutral_percentage: number;
  negative_percentage: number;
  problem_relevance_rate: number;
  solution_interest_rate: number;
  top_positive_signals: string[];
  top_concerns: { concern: string; mention_count: number }[];
  top_suggestions: { suggestion: string; mention_count: number }[];
  feedback_clusters: FeedbackCluster[];
  validation_summary: string;
  next_steps: string[];
  version_number: number;
  updated_at: string;
}

export interface ValidationCycleHistory {
  version_number: number;
  cycle_label: string;
  total_reviews: number;
  positive_percentage: number;
  problem_relevance_rate: number;
  top_improvements_applied: string[];
  validation_summary: string;
  date_completed: string;
}
