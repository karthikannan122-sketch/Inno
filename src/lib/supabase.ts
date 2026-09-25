import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key] as string;
  }
  const g = globalThis as Record<string, unknown>;
  if (g.process && typeof g.process === 'object' && 'env' in g.process) {
    const envObj = (g.process as { env: Record<string, string | undefined> }).env;
    return envObj[key] || '';
  }
  return '';
};

const supabaseUrl = 
  getEnv('VITE_SUPABASE_URL') || 
  getEnv('SUPABASE_URL') || 
  '';

const supabaseAnonKey = 
  getEnv('VITE_SUPABASE_ANON_KEY') || 
  getEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || 
  getEnv('SUPABASE_PUBLISHABLE_KEY') || 
  getEnv('SUPABASE_SECRET_KEY') || 
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// If credentials are present, initialize real client; otherwise create a dummy client to avoid crashes
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://innovexa-placeholder.supabase.co', 'placeholder-anon-key');

// Local storage keys for resilient offline/mock mode
export const STORAGE_KEYS = {
  CURRENT_USER: 'innovexa_current_user',
  PROJECTS: 'innovexa_projects_store',
  REVIEWS: 'innovexa_reviews_store',
  VERSIONS: 'innovexa_versions_store',
  RELATIONSHIPS: 'innovexa_relationships_store',
  DECISIONS: 'innovexa_decisions_store',
  MESSAGES: 'innovexa_messages_store',
  DISCUSSIONS: 'innovexa_discussions_store',
  NOTIFICATIONS: 'innovexa_notifications_store',
  SETTINGS: 'innovexa_user_settings',
  PROJECT_VOTES: 'innovexa_project_votes_store',
};
