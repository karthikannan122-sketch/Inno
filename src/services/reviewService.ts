import { supabase, isSupabaseConfigured, STORAGE_KEYS } from '../lib/supabase';
import { Review } from '../types/database';
import { SEED_REVIEWS } from '../data/seedData';

export const reviewService = {
  async getReviews(): Promise<Review[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    }
    const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return stored ? JSON.parse(stored) : SEED_REVIEWS;
  },

  async getReviewsByProjectId(projectId: string): Promise<Review[]> {
    const all = await this.getReviews();
    return all.filter(r => r.project_id === projectId);
  },

  async submitReview(reviewData: Partial<Review>): Promise<{ data: Review | null; error: string | null }> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select()
        .single();
      return { data, error: error ? error.message : null };
    }
    const reviews = await this.getReviews();
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
      project_id: reviewData.project_id || '',
      reviewer_id: reviewData.reviewer_id || 'current',
      reviewer_name: reviewData.reviewer_name || 'Innovator Reviewer',
      reviewer_role: reviewData.reviewer_role || 'Domain Peer',
      problem_relevance: reviewData.problem_relevance || 'yes',
      solution_clarity: reviewData.solution_clarity || 'yes',
      usefulness: reviewData.usefulness || 'yes',
      suggestion: reviewData.suggestion || '',
      review_type: reviewData.review_type || 'constructive',
      is_demo: false,
      quality_score: 90,
      helpful_votes: 0,
      ...reviewData
    } as Review;

    const updated = [newReview, ...reviews];
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    return { data: newReview, error: null };
  }
};
