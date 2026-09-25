import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, STORAGE_KEYS } from '../lib/supabase';
import { Profile } from '../types/database';

export interface RewardEvent {
  id: string;
  points: number;
  reason: string;
  timestamp: string;
  totalScore: number;
}

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInAsDemo: (persona?: 'alex' | 'priya' | 'marcus') => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  completeOnboarding: (interests: string[], roles: string[]) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  awardReputationPoints: (points: number, reason: string) => void;
  lastReward: RewardEvent | null;
  clearLastReward: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastReward, setLastReward] = useState<RewardEvent | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile) {
              const { data: interests } = await supabase
                .from('user_interests')
                .select('interest')
                .eq('user_id', profile.id);
              
              const { data: roles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', profile.id);

              const fullProfile: Profile = {
                ...profile,
                interests: interests?.map(i => i.interest) || [],
                roles: roles?.map(r => r.role) || [],
              };
              setUser(fullProfile);
              localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(fullProfile));
            }
          } else {
            // Check if demo/local session was saved
            const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            if (stored) {
              try {
                setUser(JSON.parse(stored));
              } catch (e) {
                localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
                setUser(null);
              }
            } else {
              setUser(null);
            }
          }
        } catch (err) {
          console.error('Supabase auth initialization error:', err);
          setUser(null);
        }
      } else {
        // Check local storage for persistent mock session
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch (e) {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile) {
              const { data: interests } = await supabase
                .from('user_interests')
                .select('interest')
                .eq('user_id', profile.id);
              
              const { data: roles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', profile.id);

              const fullProfile: Profile = {
                ...profile,
                interests: interests?.map(i => i.interest) || profile.interests || [],
                roles: roles?.map(r => r.role) || profile.roles || [],
              };
              setUser(fullProfile);
              localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(fullProfile));
            }
          } catch (err) {
            console.error('Error in onAuthStateChange profile load:', err);
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });

        if (error) {
          const isRateLimit = error.message?.toLowerCase().includes('rate limit') || (error as any)?.code === 'over_email_send_rate_limit';
          
          if (isRateLimit) {
            console.warn('Supabase email rate limit hit. Attempting direct signin or resilient session...');
            // 1. Check if the user was already created and can sign in directly
            const signInAttempt = await supabase.auth.signInWithPassword({ email, password });
            if (signInAttempt.data?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', signInAttempt.data.user.id)
                .maybeSingle();

              if (profile) {
                setUser(profile);
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
              }
              return { error: null };
            }

            // 2. Otherwise provision resilient session so developer/tester is not locked out
            const fallbackId = 'user-' + Date.now();
            const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') + '_' + Math.floor(100 + Math.random() * 900);
            const fallbackProfile: Profile = {
              id: fallbackId,
              full_name: fullName,
              username,
              avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=e96b7a,7c5ce6,5d7fe8`,
              bio: 'Active innovator and community contributor on INNOVEXA.',
              location: 'Global',
              reputation_score: 100,
              created_at: new Date().toISOString(),
              interests: ['Artificial Intelligence', 'Technology'],
              roles: ['Creator', 'Reviewer']
            };

            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(fallbackProfile));
            setUser(fallbackProfile);
            return { 
              error: null 
            };
          }

          return { error: error.message };
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile) {
            setUser(profile);
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
          } else {
            const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') + '_' + Math.floor(100 + Math.random() * 900);
            const newProfile: Profile = {
              id: data.user.id,
              full_name: fullName,
              username,
              avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=e96b7a,7c5ce6,5d7fe8`,
              bio: 'Active innovator and community contributor on INNOVEXA.',
              location: 'Global',
              reputation_score: 100,
              created_at: new Date().toISOString(),
              interests: [],
              roles: []
            };

            try {
              await supabase.from('profiles').upsert(newProfile);
            } catch (e) {
              console.warn('Could not upsert profile directly:', e);
            }
            setUser(newProfile);
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newProfile));
          }
        }
        return { error: null };
      } else {
        // Offline / local simulation
        const newId = 'user-' + Date.now();
        const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const newProfile: Profile = {
          id: newId,
          full_name: fullName,
          username: username || 'innovator',
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=e96b7a,7c5ce6,5d7fe8`,
          bio: 'Building and exploring the next generation of impactful innovations.',
          location: 'Global',
          reputation_score: 100,
          interests: [],
          roles: [],
          created_at: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newProfile));
        setUser(newProfile);
        return { error: null };
      }
    } catch (err: any) {
      return { error: err.message || 'An error occurred during signup' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          // If Supabase credentials are invalid or email confirmation failed, check for fallback
          console.warn('Supabase signIn returned error:', error.message);
          return { error: error.message };
        }

        if (data.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            if (profile) {
              const { data: interests } = await supabase
                .from('user_interests')
                .select('interest')
                .eq('user_id', profile.id);
              
              const { data: roles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', profile.id);

              const fullProfile: Profile = {
                ...profile,
                interests: interests?.map(i => i.interest) || profile.interests || [],
                roles: roles?.map(r => r.role) || profile.roles || [],
              };

              setUser(fullProfile);
              localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(fullProfile));
            } else {
              // Construct profile if database trigger did not create it
              const fullName = data.user.user_metadata?.full_name || 
                email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
              const newProfile: Profile = {
                id: data.user.id,
                full_name: fullName,
                username: username || 'innovator',
                avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=e96b7a,7c5ce6,5d7fe8`,
                bio: 'Active innovator and community contributor on INNOVEXA.',
                location: 'Global',
                reputation_score: 100,
                interests: ['Technology', 'Artificial Intelligence'],
                roles: ['Creator', 'Reviewer'],
                created_at: new Date().toISOString()
              };

              try {
                await supabase.from('profiles').upsert(newProfile);
              } catch (e) {
                console.warn('Could not create profile row in Supabase:', e);
              }

              setUser(newProfile);
              localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newProfile));
            }
          } catch (profileErr) {
            console.error('Error loading Supabase profile on sign in:', profileErr);
            // Fallback profile from user auth
            const fallbackProfile: Profile = {
              id: data.user.id,
              full_name: data.user.email?.split('@')[0] || 'Innovator',
              username: data.user.email?.split('@')[0] || 'user',
              avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.user.email || 'user')}&backgroundColor=e96b7a,7c5ce6,5d7fe8`,
              bio: 'Active innovator on INNOVEXA.',
              location: 'Global',
              reputation_score: 100,
              interests: ['Technology'],
              roles: ['Creator'],
              created_at: new Date().toISOString()
            };
            setUser(fallbackProfile);
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(fallbackProfile));
          }
        }
        return { error: null };
      } else {
        // If local mode, create or load existing user profile
        let existingUser: Profile | null = null;
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (stored) {
          try {
            existingUser = JSON.parse(stored);
          } catch (e) {
            existingUser = null;
          }
        }

        if (!existingUser) {
          const fullName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          existingUser = {
            id: 'user-' + Date.now(),
            full_name: fullName || 'Innovator',
            username: email.split('@')[0],
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=e96b7a,7c5ce6,5d7fe8`,
            bio: 'Active innovator and community reviewer on INNOVEXA.',
            location: 'San Francisco, CA',
            reputation_score: 120,
            interests: ['Artificial Intelligence', 'Technology', 'Sustainability', 'Design'],
            roles: ['Creator', 'Reviewer', 'Builder'],
            created_at: new Date().toISOString()
          };
        }

        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(existingUser));
        setUser(existingUser);
        return { error: null };
      }
    } catch (err: any) {
      return { error: err.message || 'Failed to sign in' };
    } finally {
      setLoading(false);
    }
  };

  const signInAsDemo = async (persona?: 'alex' | 'priya' | 'marcus') => {
    setLoading(true);
    try {
      let demoProfile: Profile;
      if (persona === 'priya') {
        demoProfile = {
          id: 'demo-priya',
          full_name: 'Dr. Priya Sharma',
          username: 'priya_healthtech',
          avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          bio: 'HealthTech researcher & Bio-informatics specialist.',
          location: 'Boston, MA',
          reputation_score: 340,
          created_at: new Date().toISOString(),
          interests: ['Healthcare', 'Artificial Intelligence', 'Robotics'],
          roles: ['Researcher', 'Reviewer']
        };
      } else if (persona === 'marcus') {
        demoProfile = {
          id: 'demo-marcus',
          full_name: 'Marcus Vance',
          username: 'marcus_fintech',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          bio: 'Decentralized systems builder and FinTech innovator.',
          location: 'London, UK',
          reputation_score: 180,
          created_at: new Date().toISOString(),
          interests: ['Finance', 'Cybersecurity', 'Technology'],
          roles: ['Builder', 'Creator']
        };
      } else {
        demoProfile = {
          id: 'current-innovator',
          full_name: 'Alex Rivera',
          username: 'alex_rivera',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          bio: 'Fullstack builder and AI innovator on INNOVEXA.',
          location: 'San Francisco, CA',
          reputation_score: 220,
          created_at: new Date().toISOString(),
          interests: ['Artificial Intelligence', 'Technology', 'Sustainability', 'Education'],
          roles: ['Creator', 'Reviewer', 'Builder']
        };
      }

      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(demoProfile));
      setUser(demoProfile);
      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };

    const updated = { ...user, ...updates };
    setUser(updated);

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      return { error: error ? error.message : null };
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
      return { error: null };
    }
  };

  const completeOnboarding = async (interests: string[], roles: string[]) => {
    if (!user) return;
    const updated = { ...user, interests, roles };
    setUser(updated);

    if (isSupabaseConfigured) {
      // Upsert interests
      for (const interest of interests) {
        await supabase.from('user_interests').upsert({ user_id: user.id, interest });
      }
      // Upsert roles
      for (const role of roles) {
        await supabase.from('user_roles').upsert({ user_id: user.id, role });
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
    }
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      return { error: error ? error.message : null };
    }
    return { error: null };
  };

  const awardReputationPoints = (points: number, reason: string) => {
    if (!user) return;
    const currentScore = user.reputation_score ?? 100;
    const newScore = Math.max(0, currentScore + points);

    const updatedUser: Profile = {
      ...user,
      reputation_score: newScore
    };

    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));

    if (isSupabaseConfigured) {
      supabase.from('profiles').update({ reputation_score: newScore }).eq('id', user.id).then();
    }

    const event: RewardEvent = {
      id: 'reward-' + Date.now(),
      points,
      reason,
      timestamp: new Date().toISOString(),
      totalScore: newScore
    };

    setLastReward(event);
  };

  const clearLastReward = () => {
    setLastReward(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isConfigured: isSupabaseConfigured,
      signUp,
      signIn,
      signInAsDemo,
      signOut,
      updateProfile,
      completeOnboarding,
      resetPassword,
      awardReputationPoints,
      lastReward,
      clearLastReward
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
