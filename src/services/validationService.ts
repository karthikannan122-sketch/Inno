import { supabase, isSupabaseConfigured, STORAGE_KEYS } from '../lib/supabase';
import { Project } from '../types/database';
import { 
  SmartReviewInput, 
  SmartReview, 
  ReviewAIAnalysis, 
  ProjectImprovementSuggestion, 
  ProjectValidationInsights,
  ImprovementStatusType,
  ValidationCycleHistory
} from '../types/validation';
import { SEED_REVIEWS } from '../data/seedData';

const STORAGE_AI_ANALYSES = 'innovexa_review_ai_analyses';
const STORAGE_IMPROVEMENTS = 'innovexa_project_improvements';
const STORAGE_VALIDATION_INSIGHTS = 'innovexa_project_validation_insights';
const STORAGE_VALIDATION_HISTORY = 'innovexa_validation_history';

export const validationService = {
  /**
   * Submit or update a smart review, then trigger individual AI review analysis.
   * Review is ALWAYS saved first to ensure zero data loss if AI processing fails.
   */
  async submitSmartReview(
    input: SmartReviewInput, 
    project: Project
  ): Promise<{ review: SmartReview; analysis: ReviewAIAnalysis | null; isUpdate: boolean; error: string | null }> {
    const reviewerId = input.reviewerId || 'current_user';
    const now = new Date().toISOString();

    const reviewPayload = {
      project_id: input.projectId,
      reviewer_id: reviewerId,
      reviewer_name: input.reviewerName || 'Community Peer',
      reviewer_avatar: input.reviewerAvatar || undefined,
      reviewer_role: input.reviewerRole || 'Innovator',
      first_reaction: input.firstReaction,
      problem_relevance: input.problemRelevance,
      solution_value: input.solutionValue,
      selected_improvements: input.selectedImprovements || [],
      comment: input.comment?.trim() || '',
      suggestion: input.comment?.trim() || '',
      follow_up_reason: input.followUpReason || undefined,
      solution_clarity: input.solutionValue === 'very_useful' ? 'yes' : input.solutionValue === 'useful' ? 'partially' : 'no',
      usefulness: input.solutionValue === 'very_useful' ? 'yes' : input.solutionValue === 'useful' ? 'maybe' : 'no',
      review_type: (input.firstReaction === 'needs_improvement' ? 'constructive' : input.firstReaction === 'interesting' ? 'praise' : 'suggestion') as any,
      quality_score: 90,
      updated_at: now
    };

    let savedReview: SmartReview | null = null;
    let isUpdate = false;

    // 1. Save / Upsert to Supabase or LocalStorage
    if (isSupabaseConfigured) {
      try {
        // Check for existing review by this user on this project
        const { data: existing } = await supabase
          .from('reviews')
          .select('id')
          .eq('project_id', input.projectId)
          .eq('reviewer_id', reviewerId)
          .maybeSingle();

        if (existing?.id) {
          isUpdate = true;
          const { data, error } = await supabase
            .from('reviews')
            .update(reviewPayload)
            .eq('id', existing.id)
            .select()
            .single();

          if (error) throw error;
          savedReview = data as SmartReview;
        } else {
          const { data, error } = await supabase
            .from('reviews')
            .insert([{ ...reviewPayload, created_at: now }])
            .select()
            .single();

          if (error) throw error;
          savedReview = data as SmartReview;
        }
      } catch (err: any) {
        console.warn('Supabase review insert failed, using fallback storage:', err);
      }
    }

    // Fallback storage if Supabase is unconfigured or failed
    if (!savedReview) {
      const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      const allReviews: SmartReview[] = stored ? JSON.parse(stored) : [...(SEED_REVIEWS as any[])];
      const existingIdx = allReviews.findIndex(r => r.project_id === input.projectId && r.reviewer_id === reviewerId);

      if (existingIdx >= 0) {
        isUpdate = true;
        savedReview = {
          ...allReviews[existingIdx],
          ...reviewPayload,
          id: allReviews[existingIdx].id,
          created_at: allReviews[existingIdx].created_at || now,
          updated_at: now
        } as SmartReview;
        allReviews[existingIdx] = savedReview;
      } else {
        savedReview = {
          ...reviewPayload,
          id: `rev-${Date.now()}`,
          created_at: now,
          updated_at: now
        } as SmartReview;
        allReviews.unshift(savedReview);
      }
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(allReviews));
    }

    // 2. Trigger Individual AI Review Analysis
    let analysisResult: ReviewAIAnalysis | null = null;
    try {
      analysisResult = await this.analyzeIndividualReviewAI(project, savedReview);
      if (analysisResult) {
        await this.saveReviewAIAnalysis(analysisResult);
        savedReview.ai_analysis = analysisResult;
      }
    } catch (aiErr) {
      console.warn('AI individual review analysis failed (review is safely preserved):', aiErr);
    }

    return {
      review: savedReview,
      analysis: analysisResult,
      isUpdate,
      error: null
    };
  },

  /**
   * Calls AI backend to analyze an individual review's sentiment, intent, topics, concerns, suggestions.
   */
  async analyzeIndividualReviewAI(project: Project, review: SmartReview): Promise<ReviewAIAnalysis | null> {
    try {
      const res = await fetch('/api/ai-review-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, review })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.data) {
        return this.generateFallbackReviewAnalysis(review, project.id);
      }

      const d = json.data;
      return {
        id: `analysis-${review.id}`,
        review_id: review.id,
        project_id: project.id,
        sentiment: d.sentiment || 'neutral',
        sentiment_score: typeof d.sentiment_score === 'number' ? d.sentiment_score : 0.75,
        intent: d.intent || 'suggestion',
        topics: Array.isArray(d.topics) ? d.topics : ['Usability'],
        detected_concerns: Array.isArray(d.detected_concerns) ? d.detected_concerns : [],
        detected_suggestions: Array.isArray(d.detected_suggestions) ? d.detected_suggestions : [],
        ai_summary: d.ai_summary || 'Feedback provided on project value and improvements.',
        actionable_improvement: d.actionable_improvement || undefined,
        created_at: new Date().toISOString()
      };
    } catch (e) {
      return this.generateFallbackReviewAnalysis(review, project.id);
    }
  },

  /**
   * Deterministic local fallback analysis if Gemini API is unreachable
   */
  generateFallbackReviewAnalysis(review: SmartReview, projectId: string): ReviewAIAnalysis {
    const isPositive = review.first_reaction === 'interesting' && review.solution_value === 'very_useful';
    const isNegative = review.first_reaction === 'needs_improvement' || review.solution_value === 'needs_improvement';
    const sentiment = isPositive ? 'positive' : isNegative ? 'negative' : 'neutral';

    const topics: string[] = [];
    (review.selected_improvements || []).forEach(imp => {
      if (imp.toLowerCase().includes('use') || imp.toLowerCase().includes('design')) topics.push('UX & UI');
      else if (imp.toLowerCase().includes('feature')) topics.push('Features');
      else if (imp.toLowerCase().includes('performance')) topics.push('Performance');
      else if (imp.toLowerCase().includes('affordable')) topics.push('Pricing');
      else if (imp.toLowerCase().includes('security')) topics.push('Security');
      else topics.push('General');
    });

    const uniqueTopics = Array.from(new Set(topics));
    if (uniqueTopics.length === 0) uniqueTopics.push('Value Proposition');

    const detected_concerns: string[] = [];
    if (review.first_reaction === 'needs_improvement') {
      detected_concerns.push(review.follow_up_reason ? `Needs improvement: ${review.follow_up_reason}` : 'General concept refinement requested');
    }
    if (review.selected_improvements && review.selected_improvements.length > 0) {
      detected_concerns.push(`Requested enhancements: ${review.selected_improvements.slice(0, 2).join(', ')}`);
    }

    const detected_suggestions: string[] = [];
    if (review.comment) {
      detected_suggestions.push(review.comment);
    } else if (review.selected_improvements && review.selected_improvements.length > 0) {
      detected_suggestions.push(`Focus on making it ${review.selected_improvements[0].toLowerCase()}`);
    }

    return {
      id: `analysis-${review.id}`,
      review_id: review.id,
      project_id: projectId,
      sentiment,
      sentiment_score: isPositive ? 0.85 : isNegative ? 0.35 : 0.6,
      intent: review.comment ? 'suggestion' : isPositive ? 'support' : 'concern',
      topics: uniqueTopics,
      detected_concerns,
      detected_suggestions,
      ai_summary: review.comment 
        ? `Reviewer noted: "${review.comment.slice(0, 100)}${review.comment.length > 100 ? '...' : ''}"`
        : `Reviewer evaluated project with ${sentiment} impression, prioritizing ${uniqueTopics.join(' and ')}.`,
      actionable_improvement: review.selected_improvements?.[0] ? `Improve ${review.selected_improvements[0].toLowerCase()}` : undefined,
      created_at: new Date().toISOString()
    };
  },

  /**
   * Save an individual review AI analysis entry
   */
  async saveReviewAIAnalysis(analysis: ReviewAIAnalysis): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('review_ai_analysis')
          .upsert([analysis], { onConflict: 'review_id' });
        return;
      } catch (e) {
        console.warn('Supabase review_ai_analysis upsert failed:', e);
      }
    }
    const raw = localStorage.getItem(STORAGE_AI_ANALYSES);
    const existing: ReviewAIAnalysis[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter(a => a.review_id !== analysis.review_id);
    localStorage.setItem(STORAGE_AI_ANALYSES, JSON.stringify([analysis, ...filtered]));
  },

  /**
   * Get all reviews for a project along with their individual AI analyses
   */
  async getProjectReviewsWithAnalysis(projectId: string): Promise<SmartReview[]> {
    let reviews: SmartReview[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          reviews = data as SmartReview[];
        }
      } catch (e) {
        console.warn('Supabase fetch reviews failed:', e);
      }
    }

    if (reviews.length === 0) {
      const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      const all: SmartReview[] = stored ? JSON.parse(stored) : (SEED_REVIEWS as any[]);
      reviews = all.filter(r => r.project_id === projectId);
    }

    // Fetch AI analyses
    let analyses: ReviewAIAnalysis[] = [];
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('review_ai_analysis')
          .select('*')
          .eq('project_id', projectId);
        if (data) analyses = data as ReviewAIAnalysis[];
      } catch (_) {}
    }
    if (analyses.length === 0) {
      const raw = localStorage.getItem(STORAGE_AI_ANALYSES);
      if (raw) analyses = JSON.parse(raw);
    }

    // Merge analyses
    return reviews.map(r => {
      const a = analyses.find(item => item.review_id === r.id);
      return {
        ...r,
        ai_analysis: a || undefined
      };
    });
  },

  /**
   * Checks if user already reviewed this project
   */
  async getUserExistingReview(projectId: string, userId: string): Promise<SmartReview | null> {
    const reviews = await this.getProjectReviewsWithAnalysis(projectId);
    return reviews.find(r => r.reviewer_id === userId) || null;
  },

  /**
   * Get or generate Aggregated Validation Insights for project owner.
   */
  async getAggregatedValidationInsights(
    project: Project, 
    forceRefresh = false
  ): Promise<{ insights: ProjectValidationInsights; suggestions: ProjectImprovementSuggestion[] }> {
    const reviews = await this.getProjectReviewsWithAnalysis(project.id);
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      const emptyInsights: ProjectValidationInsights = {
        project_id: project.id,
        total_reviews: 0,
        positive_percentage: 0,
        neutral_percentage: 0,
        negative_percentage: 0,
        problem_relevance_rate: 0,
        solution_interest_rate: 0,
        top_positive_signals: [],
        top_concerns: [],
        top_suggestions: [],
        feedback_clusters: [],
        validation_summary: 'Not enough feedback yet. Share your project link to start collecting community validation signals.',
        next_steps: [
          'Share your project on the INNOVEXA Explore page',
          'Invite domain peers to submit quick 45-second feedback',
          'Check back after receiving 3+ community reviews'
        ],
        version_number: project.current_version || 1,
        updated_at: new Date().toISOString()
      };
      return { insights: emptyInsights, suggestions: [] };
    }

    // Check cached insights if not force refreshing
    if (!forceRefresh) {
      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase
            .from('project_validation_insights')
            .select('*')
            .eq('project_id', project.id)
            .maybeSingle();

          if (data && data.total_reviews === totalReviews) {
            const suggestions = await this.getImprovementSuggestions(project.id);
            return { insights: data as ProjectValidationInsights, suggestions };
          }
        } catch (_) {}
      } else {
        const raw = localStorage.getItem(`${STORAGE_VALIDATION_INSIGHTS}_${project.id}`);
        if (raw) {
          const parsed = JSON.parse(raw) as ProjectValidationInsights;
          if (parsed.total_reviews === totalReviews) {
            const suggestions = await this.getImprovementSuggestions(project.id);
            return { insights: parsed, suggestions };
          }
        }
      }
    }

    // 1. Calculate deterministic ground truth statistics
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    let problemRelevantCount = 0;
    let solutionInterestCount = 0;

    const improvementCounts: Record<string, number> = {};

    reviews.forEach(r => {
      const reaction = r.first_reaction;
      if (reaction === 'interesting') positiveCount++;
      else if (reaction === 'needs_improvement') negativeCount++;
      else neutralCount++;

      if (r.problem_relevance === 'yes') problemRelevantCount += 1;
      else if (r.problem_relevance === 'maybe') problemRelevantCount += 0.5;

      if (r.solution_value === 'very_useful') solutionInterestCount += 1;
      else if (r.solution_value === 'useful') solutionInterestCount += 0.5;

      (r.selected_improvements || []).forEach(imp => {
        improvementCounts[imp] = (improvementCounts[imp] || 0) + 1;
      });
    });

    const positive_percentage = Math.round((positiveCount / totalReviews) * 100);
    const neutral_percentage = Math.round((neutralCount / totalReviews) * 100);
    const negative_percentage = Math.max(0, 100 - positive_percentage - neutral_percentage);
    const problem_relevance_rate = Math.round((problemRelevantCount / totalReviews) * 100);
    const solution_interest_rate = Math.round((solutionInterestCount / totalReviews) * 100);

    // 2. Call AI validation aggregate endpoint for rich clusters and recommendations
    let aiData: any = null;
    try {
      const res = await fetch('/api/ai-validation-aggregate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          reviews,
          individualAnalyses: reviews.map(r => r.ai_analysis).filter(Boolean)
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          aiData = json.data;
        }
      }
    } catch (e) {
      console.warn('AI validation aggregate API failed, generating grounded fallback:', e);
    }

    // Top concerns & suggestions from actual data
    const top_concerns = aiData?.top_concerns || Object.entries(improvementCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([concern, mention_count]) => ({ concern, mention_count }));

    const top_suggestions = aiData?.top_suggestions || reviews
      .filter(r => r.comment || r.suggestion)
      .slice(0, 5)
      .map(r => ({ suggestion: (r.comment || r.suggestion)!, mention_count: 1 }));

    const top_positive_signals = aiData?.top_positive_signals || [
      problem_relevance_rate >= 70 ? 'Problem relevance strongly validated by target audience' : 'Concept is recognized by peers',
      solution_interest_rate >= 70 ? 'Solution usefulness received positive community ratings' : 'Clear innovation angle established',
      positive_percentage >= 60 ? 'Strong initial impression among early reviewers' : 'Community engaged with constructive direction'
    ];

    const feedback_clusters = aiData?.feedback_clusters || [
      {
        category: 'Usability & Workflow',
        mention_count: improvementCounts['Easier to use'] || improvementCounts['Better design'] || 1,
        summary: 'Reviewers emphasized seamless navigation and clear step-by-step guidance.',
        sample_quotes: reviews.filter(r => r.comment).map(r => r.comment!).slice(0, 2),
        sentiment: 'neutral' as const
      },
      {
        category: 'Feature Capabilities',
        mention_count: improvementCounts['More features'] || improvementCounts['More useful for my needs'] || 1,
        summary: 'Community suggested expanding specific integration and automation features.',
        sample_quotes: [],
        sentiment: 'positive' as const
      }
    ];

    const validation_summary = aiData?.validation_summary || (
      positive_percentage >= 70
        ? `Community validation indicates strong enthusiasm (${positive_percentage}% positive reaction), with ${problem_relevance_rate}% problem relevance validation. Key optimization requests center on ${top_concerns[0]?.concern || 'user experience'}.`
        : `Community feedback provides constructive guidance with ${problem_relevance_rate}% problem relevance. The priority opportunity is addressing ${top_concerns[0]?.concern || 'core usability and clarity'}.`
    );

    const next_steps = aiData?.next_steps || [
      `1. Review and address top concern: ${top_concerns[0]?.concern || 'Usability'}`,
      '2. Update project roadmap or prototype version',
      '3. Re-request community validation for Version 2'
    ];

    const insights: ProjectValidationInsights = {
      project_id: project.id,
      total_reviews: totalReviews,
      positive_percentage: aiData?.positive_percentage ?? positive_percentage,
      neutral_percentage: aiData?.neutral_percentage ?? neutral_percentage,
      negative_percentage: aiData?.negative_percentage ?? negative_percentage,
      problem_relevance_rate: aiData?.problem_relevance_rate ?? problem_relevance_rate,
      solution_interest_rate: aiData?.solution_interest_rate ?? solution_interest_rate,
      top_positive_signals,
      top_concerns,
      top_suggestions,
      feedback_clusters,
      validation_summary,
      next_steps,
      version_number: project.current_version || 1,
      updated_at: new Date().toISOString()
    };

    // Save insights
    await this.saveProjectInsights(insights);

    // Generate and sync improvement suggestions
    const rawSuggestions = aiData?.improvement_recommendations || this.generateDefaultSuggestions(project, top_concerns);
    const existingSuggestions = await this.getImprovementSuggestions(project.id);

    const suggestions: ProjectImprovementSuggestion[] = rawSuggestions.map((s: any, idx: number) => {
      const match = existingSuggestions.find(ex => ex.title.toLowerCase() === s.title.toLowerCase());
      return {
        id: match ? match.id : `sug-${project.id}-${idx}-${Date.now()}`,
        project_id: project.id,
        title: s.title,
        description: s.description,
        reason: s.reason,
        source_review_count: s.source_review_count || 1,
        priority: s.priority || 'medium',
        status: match ? match.status : 'pending',
        cluster_category: s.cluster_category || 'UX',
        created_at: match ? match.created_at : new Date().toISOString()
      };
    });

    await this.saveImprovementSuggestions(project.id, suggestions);

    return { insights, suggestions };
  },

  generateDefaultSuggestions(project: Project, topConcerns: { concern: string; mention_count: number }[]): any[] {
    const suggestions: any[] = [];
    if (topConcerns.length > 0) {
      suggestions.push({
        title: `Optimize ${topConcerns[0].concern}`,
        description: `Implement direct improvements targeting "${topConcerns[0].concern}" based on community feedback.`,
        reason: `${topConcerns[0].mention_count} reviewer(s) specifically requested this enhancement.`,
        source_review_count: topConcerns[0].mention_count,
        priority: 'high',
        cluster_category: 'Core Optimization'
      });
    }
    suggestions.push({
      title: 'Clarify Value Proposition & Onboarding',
      description: 'Provide an interactive interactive demo or 2-step setup wizard for first-time visitors.',
      reason: 'Helps convert unsure reviewers into confident adopters.',
      source_review_count: Math.max(1, Math.floor(project.reviews_count || 1)),
      priority: 'medium',
      cluster_category: 'Onboarding'
    });
    return suggestions;
  },

  async saveProjectInsights(insights: ProjectValidationInsights): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('project_validation_insights')
          .upsert([insights], { onConflict: 'project_id' });
        return;
      } catch (e) {
        console.warn('Supabase project_validation_insights upsert failed:', e);
      }
    }
    localStorage.setItem(`${STORAGE_VALIDATION_INSIGHTS}_${insights.project_id}`, JSON.stringify(insights));
  },

  async getImprovementSuggestions(projectId: string): Promise<ProjectImprovementSuggestion[]> {
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('project_improvement_suggestions')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });
        if (data && data.length > 0) return data as ProjectImprovementSuggestion[];
      } catch (_) {}
    }
    const raw = localStorage.getItem(`${STORAGE_IMPROVEMENTS}_${projectId}`);
    return raw ? JSON.parse(raw) : [];
  },

  async saveImprovementSuggestions(projectId: string, suggestions: ProjectImprovementSuggestion[]): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('project_improvement_suggestions')
          .upsert(suggestions);
        return;
      } catch (e) {
        console.warn('Supabase save suggestions failed:', e);
      }
    }
    localStorage.setItem(`${STORAGE_IMPROVEMENTS}_${projectId}`, JSON.stringify(suggestions));
  },

  async updateSuggestionStatus(
    projectId: string, 
    suggestionId: string, 
    status: ImprovementStatusType
  ): Promise<void> {
    const list = await this.getImprovementSuggestions(projectId);
    const updated = list.map(s => s.id === suggestionId ? { ...s, status, updated_at: new Date().toISOString() } : s);
    await this.saveImprovementSuggestions(projectId, updated);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('project_improvement_suggestions')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', suggestionId);
      } catch (_) {}
    }
  },

  /**
   * Request New Validation: archives current cycle and starts fresh validation round for next version.
   */
  async requestNewValidationCycle(project: Project): Promise<ValidationCycleHistory[]> {
    const currentVersion = project.current_version || 1;
    const { insights, suggestions } = await this.getAggregatedValidationInsights(project, false);

    const cycleRecord: ValidationCycleHistory = {
      version_number: currentVersion,
      cycle_label: `Version ${currentVersion}.0 Validation`,
      total_reviews: insights.total_reviews,
      positive_percentage: insights.positive_percentage,
      problem_relevance_rate: insights.problem_relevance_rate,
      top_improvements_applied: suggestions.filter(s => s.status === 'accepted' || s.status === 'completed').map(s => s.title),
      validation_summary: insights.validation_summary,
      date_completed: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const history = await this.getValidationHistory(project.id);
    const updatedHistory = [cycleRecord, ...history.filter(h => h.version_number !== currentVersion)];
    
    localStorage.setItem(`${STORAGE_VALIDATION_HISTORY}_${project.id}`, JSON.stringify(updatedHistory));

    // Force regenerate fresh insights for next cycle
    await this.getAggregatedValidationInsights(project, true);

    return updatedHistory;
  },

  async getValidationHistory(projectId: string): Promise<ValidationCycleHistory[]> {
    const raw = localStorage.getItem(`${STORAGE_VALIDATION_HISTORY}_${projectId}`);
    if (raw) return JSON.parse(raw);

    // Initial mock benchmark history if this is an upgraded project
    return [
      {
        version_number: 1,
        cycle_label: 'Version 1.0 Initial Concept',
        total_reviews: 14,
        positive_percentage: 58,
        problem_relevance_rate: 64,
        top_improvements_applied: ['Simplified UI Layout', 'Clarified Problem Statement'],
        validation_summary: 'Early adopters confirmed problem need but requested streamlined navigation.',
        date_completed: '2 weeks ago'
      }
    ];
  }
};
