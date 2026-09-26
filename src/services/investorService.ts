import { supabase, isSupabaseConfigured, STORAGE_KEYS } from '../lib/supabase';
import { InvestorProfile, InvestorConnection, ConnectionStatus, Project } from '../types/database';

export const STORAGE_INVESTORS = 'innovexa_investor_profiles_store';
export const STORAGE_CONNECTIONS = 'innovexa_investor_connections_store';

// Default Curated Innovation Angels & Seed Investors for demo/offline resilience
export const INITIAL_INVESTORS: InvestorProfile[] = [
  {
    id: 'inv-001',
    user_id: 'user-investor-01',
    organization_name: 'Apex Horizon Ventures',
    user_name: 'Elena Rostova',
    user_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Early-stage deeptech & AI seed investor focusing on high-utility workflows, computer vision, and autonomous developer tooling.',
    investment_interests: ['AI & Machine Learning', 'Developer Tools', 'Computer Vision', 'Enterprise Automation'],
    preferred_categories: ['Artificial Intelligence', 'Developer Tools', 'Productivity', 'Robotics'],
    website: 'https://apexhorizon.vc',
    check_size_range: '$50K – $250K',
    investor_type: 'Venture Capital',
    contact_email: 'elena@apexhorizon.vc',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'inv-002',
    user_id: 'user-investor-02',
    organization_name: 'GreenScale Capital',
    user_name: 'Marcus Vance',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Backing climate, agritech, and sustainable infrastructure founders moving from validation stage to prototype deployment.',
    investment_interests: ['Smart Agriculture', 'Clean Energy', 'Circular Economy', 'IoT Sensors'],
    preferred_categories: ['Agriculture', 'CleanTech', 'Hardware', 'Sustainability'],
    website: 'https://greenscalecapital.io',
    check_size_range: '$25K – $150K',
    investor_type: 'Angel Syndicate',
    contact_email: 'marcus@greenscalecapital.io',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: 'inv-003',
    user_id: 'user-investor-03',
    organization_name: 'BioHealth Foundry',
    user_name: 'Dr. Anita Desai',
    user_avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bio: 'Physician-turned-investor scouting digital health, telehealth telemetry, clinical decision support, and bio-informatics.',
    investment_interests: ['Digital Health', 'Diagnostics', 'Preventative Care', 'HIPAA Infrastructure'],
    preferred_categories: ['Healthcare', 'BioTech', 'MedTech'],
    website: 'https://biohealthfoundry.com',
    check_size_range: '$50K – $300K',
    investor_type: 'Micro VC',
    contact_email: 'anita@biohealthfoundry.com',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 'inv-004',
    user_id: 'user-investor-04',
    organization_name: 'NextGen FutureTech Angel Group',
    user_name: 'David Chen',
    user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Ex-founder investing in pre-seed software, fintech infrastructure, cybersecurity, and open-source ecosystems.',
    investment_interests: ['Fintech', 'Cybersecurity', 'Open Source', 'EdTech'],
    preferred_categories: ['Fintech', 'Security', 'Education', 'SaaS'],
    website: 'https://nextgenfuture.tech',
    check_size_range: '$10K – $75K',
    investor_type: 'Angel Investor',
    contact_email: 'david@nextgenfuture.tech',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  }
];

export const INITIAL_CONNECTIONS: InvestorConnection[] = [
  {
    id: 'conn-001',
    investor_id: 'user-investor-01',
    creator_id: 'demo-creator-01',
    project_id: 'seed-proj-01',
    project_title: 'MedScribe AI',
    project_category: 'Healthcare',
    creator_name: 'Alex Rivera',
    creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    investor_name: 'Elena Rostova',
    investor_org: 'Apex Horizon Ventures',
    investor_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    message: 'Hello Elena, we have reached 88% validation score on MedScribe AI with 14 community doctor reviews. We would love to share our technical roadmap and architecture.',
    status: 'accepted',
    initiated_by: 'creator',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'conn-002',
    investor_id: 'user-investor-02',
    creator_id: 'demo-creator-01',
    project_id: 'seed-proj-02',
    project_title: 'CropGuard Vision',
    project_category: 'Agriculture',
    creator_name: 'Alex Rivera',
    creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    investor_name: 'Marcus Vance',
    investor_org: 'GreenScale Capital',
    investor_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    message: 'Hi Marcus, following GreenScale’s focus on sustainable agritech, CropGuard Vision has completed problem validation and is preparing for prototype deployment.',
    status: 'pending',
    initiated_by: 'creator',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export class InvestorService {
  /**
   * Fetches all investor profiles from Supabase or localStorage
   */
  static async getInvestors(): Promise<InvestorProfile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('investor_profiles')
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url,
              bio,
              username
            )
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            organization_name: item.organization_name,
            bio: item.bio || item.profiles?.bio,
            investment_interests: item.investment_interests || [],
            preferred_categories: item.preferred_categories || [],
            website: item.website,
            check_size_range: item.check_size_range,
            investor_type: item.investor_type,
            contact_email: item.contact_email,
            user_name: item.profiles?.full_name || 'Investor',
            user_avatar: item.profiles?.avatar_url,
            created_at: item.created_at,
            updated_at: item.updated_at
          }));
        }
      } catch (err) {
        console.warn('Supabase investor fetch failed, falling back to local storage:', err);
      }
    }

    // Local storage fallback
    try {
      const raw = localStorage.getItem(STORAGE_INVESTORS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (_) {}

    localStorage.setItem(STORAGE_INVESTORS, JSON.stringify(INITIAL_INVESTORS));
    return INITIAL_INVESTORS;
  }

  /**
   * Fetches the investor profile for a specific user ID
   */
  static async getInvestorByUserId(userId: string): Promise<InvestorProfile | null> {
    const all = await this.getInvestors();
    return all.find(inv => inv.user_id === userId) || null;
  }

  /**
   * Creates or updates an investor profile
   */
  static async saveInvestorProfile(
    userId: string,
    profileData: Partial<InvestorProfile>
  ): Promise<{ profile: InvestorProfile | null; error: string | null }> {
    const existing = await this.getInvestorByUserId(userId);
    const newId = existing?.id || `inv-${Date.now()}`;
    
    const payload: InvestorProfile = {
      id: newId,
      user_id: userId,
      organization_name: profileData.organization_name || 'Independent Syndicate',
      bio: profileData.bio || '',
      investment_interests: profileData.investment_interests || [],
      preferred_categories: profileData.preferred_categories || [],
      website: profileData.website || '',
      check_size_range: profileData.check_size_range || '$25K – $100K',
      investor_type: profileData.investor_type || 'Angel Investor',
      contact_email: profileData.contact_email || '',
      user_name: profileData.user_name || existing?.user_name || 'Investor',
      user_avatar: profileData.user_avatar || existing?.user_avatar,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('investor_profiles')
          .upsert({
            id: payload.id.startsWith('inv-') && payload.id.length < 36 ? undefined : payload.id,
            user_id: payload.user_id,
            organization_name: payload.organization_name,
            bio: payload.bio,
            investment_interests: payload.investment_interests,
            preferred_categories: payload.preferred_categories,
            website: payload.website,
            check_size_range: payload.check_size_range,
            investor_type: payload.investor_type,
            contact_email: payload.contact_email,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.warn('Supabase investor upsert failed:', error.message);
        } else if (data) {
          payload.id = data.id;
        }
      } catch (err: any) {
        console.warn('Supabase investor profile update exception:', err);
      }
    }

    // Save locally
    try {
      const all = await this.getInvestors();
      const filtered = all.filter(i => i.user_id !== userId);
      const updatedList = [payload, ...filtered];
      localStorage.setItem(STORAGE_INVESTORS, JSON.stringify(updatedList));
    } catch (_) {}

    return { profile: payload, error: null };
  }

  /**
   * Fetches all connection requests for a given user (as creator or investor)
   */
  static async getConnections(userId: string): Promise<InvestorConnection[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('investor_connections')
          .select(`
            *,
            projects:project_id (title, category),
            creator:creator_id (full_name, avatar_url),
            investor:investor_id (full_name, avatar_url)
          `)
          .or(`creator_id.eq.${userId},investor_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            investor_id: item.investor_id,
            creator_id: item.creator_id,
            project_id: item.project_id,
            message: item.message,
            status: item.status,
            initiated_by: item.initiated_by || 'creator',
            project_title: item.projects?.title || 'Innovation Project',
            project_category: item.projects?.category || 'General',
            creator_name: item.creator?.full_name || 'Creator',
            creator_avatar: item.creator?.avatar_url,
            investor_name: item.investor?.full_name || 'Investor',
            investor_avatar: item.investor?.avatar_url,
            created_at: item.created_at,
            updated_at: item.updated_at
          }));
        }
      } catch (err) {
        console.warn('Supabase connections fetch failed, using local store:', err);
      }
    }

    // Local storage
    try {
      const raw = localStorage.getItem(STORAGE_CONNECTIONS);
      if (raw) {
        const all: InvestorConnection[] = JSON.parse(raw);
        return all.filter(c => c.creator_id === userId || c.investor_id === userId || userId === 'current' || userId.startsWith('demo-'));
      }
    } catch (_) {}

    localStorage.setItem(STORAGE_CONNECTIONS, JSON.stringify(INITIAL_CONNECTIONS));
    return INITIAL_CONNECTIONS;
  }

  /**
   * Creator sends connection request to investor, or Investor requests interest from Creator
   */
  static async sendConnectionRequest(params: {
    investorId: string;
    creatorId: string;
    projectId: string;
    message: string;
    initiatedBy?: 'creator' | 'investor';
    project?: Project;
    investorProfile?: InvestorProfile;
    creatorName?: string;
    creatorAvatar?: string;
  }): Promise<{ connection: InvestorConnection | null; error: string | null }> {
    const newConnection: InvestorConnection = {
      id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      investor_id: params.investorId,
      creator_id: params.creatorId,
      project_id: params.projectId,
      message: params.message.trim(),
      status: 'pending',
      initiated_by: params.initiatedBy || 'creator',
      project_title: params.project?.title || 'Innovation Project',
      project_category: params.project?.category || 'General',
      creator_name: params.creatorName || params.project?.owner_name || 'Creator',
      creator_avatar: params.creatorAvatar || params.project?.owner_avatar,
      investor_name: params.investorProfile?.user_name || 'Investor',
      investor_org: params.investorProfile?.organization_name || 'Investment Syndicate',
      investor_avatar: params.investorProfile?.user_avatar,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('investor_connections')
          .insert({
            investor_id: params.investorId,
            creator_id: params.creatorId,
            project_id: params.projectId,
            message: params.message,
            status: 'pending',
            initiated_by: params.initiatedBy || 'creator'
          })
          .select()
          .single();

        if (error) {
          console.warn('Supabase connection insert error:', error.message);
        } else if (data) {
          newConnection.id = data.id;
        }
      } catch (err: any) {
        console.warn('Supabase connection exception:', err);
      }
    }

    // Update local storage
    try {
      const raw = localStorage.getItem(STORAGE_CONNECTIONS);
      const all: InvestorConnection[] = raw ? JSON.parse(raw) : INITIAL_CONNECTIONS;
      const updated = [newConnection, ...all.filter(c => c.id !== newConnection.id)];
      localStorage.setItem(STORAGE_CONNECTIONS, JSON.stringify(updated));
    } catch (_) {}

    return { connection: newConnection, error: null };
  }

  /**
   * Responds to a connection request (accept, reject, cancel)
   */
  static async updateConnectionStatus(
    connectionId: string,
    status: ConnectionStatus
  ): Promise<{ error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('investor_connections')
          .update({
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', connectionId);

        if (error) {
          console.warn('Supabase status update error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase status update exception:', err);
      }
    }

    // Update local storage
    try {
      const raw = localStorage.getItem(STORAGE_CONNECTIONS);
      if (raw) {
        const all: InvestorConnection[] = JSON.parse(raw);
        const updated = all.map(c => {
          if (c.id === connectionId) {
            return { ...c, status, updated_at: new Date().toISOString() };
          }
          return c;
        });
        localStorage.setItem(STORAGE_CONNECTIONS, JSON.stringify(updated));
      }
    } catch (_) {}

    return { error: null };
  }
}
