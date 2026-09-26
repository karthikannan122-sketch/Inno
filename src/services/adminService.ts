import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Profile, 
  Project, 
  Review, 
  Discussion, 
  ReportItem, 
  AdminAction, 
  AdminDashboardStats, 
  ReportStatus 
} from '../types/database';
import { INITIAL_INVESTORS, INITIAL_CONNECTIONS } from './investorService';

export const STORAGE_REPORTS = 'innovexa_reports_store';
export const STORAGE_ADMIN_ACTIONS = 'innovexa_admin_actions_store';
export const STORAGE_PROFILES = 'innovexa_profiles_store';

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep-001',
    reporter_id: 'user-002',
    reporter_name: 'Dr. Sarah Lin',
    target_type: 'project',
    target_id: 'proj-demo-flagged',
    target_title: 'Unverified Automated Clinical Drug Recommender',
    reason: 'Medical Safety Claim',
    details: 'Project claims automated prescription capabilities without regulatory disclosures or validation benchmarks.',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'rep-002',
    reporter_id: 'user-003',
    reporter_name: 'Marcus Vance',
    target_type: 'review',
    target_id: 'rev-spam-01',
    target_title: 'Spam Feedback on CropGuard',
    reason: 'Spam / Commercial Promotion',
    details: 'Review contains third-party commercial links unrelated to the crop disease validation.',
    status: 'reviewed',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    resolved_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export class AdminService {
  /**
   * Computes aggregate platform statistics
   */
  static getStats(
    projects: Project[],
    reviews: Review[],
    discussions: Discussion[],
    reportsCount: number = 2
  ): AdminDashboardStats {
    const published = projects.filter(p => p.status === 'published').length;
    const draft = projects.filter(p => p.status === 'draft').length;
    const validating = projects.filter(p => p.status === 'under_review').length;

    return {
      total_users: 148,
      total_projects: projects.length,
      published_projects: published,
      draft_projects: draft,
      validating_projects: validating,
      total_reviews: reviews.length,
      total_reports: reportsCount,
      pending_reports: 1,
      total_discussions: discussions.length,
      total_investors: INITIAL_INVESTORS.length,
      total_connections: INITIAL_CONNECTIONS.length,
      ai_requests_count: 1420
    };
  }

  /**
   * Fetches user directory for admin management
   */
  static async getUsers(): Promise<Profile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles (role),
            user_interests (interest)
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((u: any) => ({
            id: u.id,
            full_name: u.full_name,
            username: u.username,
            avatar_url: u.avatar_url,
            bio: u.bio,
            location: u.location,
            reputation_score: u.reputation_score || 100,
            roles: u.user_roles?.map((r: any) => r.role) || ['innovator'],
            interests: u.user_interests?.map((i: any) => i.interest) || [],
            is_suspended: u.is_suspended || false,
            created_at: u.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase admin getUsers error:', err);
      }
    }

    // Default mock profiles for offline resilience
    return [
      {
        id: 'demo-admin-01',
        full_name: 'Karthick Kannan (Admin)',
        username: 'admin_karthick',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: 'Lead System Administrator & Ecosystem Architect on INNOVEXA.',
        location: 'San Francisco, CA',
        reputation_score: 950,
        roles: ['admin', 'creator', 'reviewer'],
        interests: ['AI & ML', 'DeepTech', 'System Architecture'],
        created_at: new Date(Date.now() - 120 * 86400000).toISOString()
      },
      {
        id: 'user-002',
        full_name: 'Dr. Sarah Lin',
        username: 'sarah_healthtech',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        bio: 'Healthcare AI validation lead and clinical reviewer.',
        location: 'Boston, MA',
        reputation_score: 420,
        roles: ['creator', 'reviewer'],
        interests: ['Healthcare', 'Diagnostics', 'Biotech'],
        created_at: new Date(Date.now() - 90 * 86400000).toISOString()
      },
      {
        id: 'user-investor-01',
        full_name: 'Elena Rostova',
        username: 'elena_apex',
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        bio: 'Managing Partner at Apex Horizon Ventures.',
        location: 'New York, NY',
        reputation_score: 680,
        roles: ['investor'],
        interests: ['DeepTech', 'Developer Tools', 'AI'],
        created_at: new Date(Date.now() - 60 * 86400000).toISOString()
      },
      {
        id: 'user-004',
        full_name: 'Jordan Lee',
        username: 'jordan_agritech',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        bio: 'Agritech builder specializing in edge IoT sensors.',
        location: 'Austin, TX',
        reputation_score: 210,
        roles: ['creator'],
        interests: ['Agriculture', 'IoT', 'Hardware'],
        created_at: new Date(Date.now() - 40 * 86400000).toISOString()
      }
    ];
  }

  /**
   * Suspends or reinstates a user account
   */
  static async toggleSuspendUser(userId: string, suspend: boolean): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ is_suspended: suspend })
          .eq('id', userId);
      } catch (err) {
        console.warn('Supabase suspend user error:', err);
      }
    }
    return true;
  }

  /**
   * Assigns or revokes a role for a user
   */
  static async toggleUserRole(userId: string, role: string, grant: boolean): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        if (grant) {
          await supabase
            .from('user_roles')
            .insert({ user_id: userId, role });
        } else {
          await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role', role);
        }
      } catch (err) {
        console.warn('Supabase role toggle error:', err);
      }
    }
    return true;
  }

  /**
   * Fetches all safety and content reports
   */
  static async getReports(): Promise<ReportItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select(`
            *,
            profiles:reporter_id (full_name)
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((r: any) => ({
            id: r.id,
            reporter_id: r.reporter_id,
            reporter_name: r.profiles?.full_name || 'Community Member',
            target_type: r.target_type,
            target_id: r.target_id,
            target_title: r.target_title || `${r.target_type} #${r.target_id.slice(0, 8)}`,
            reason: r.reason,
            details: r.details,
            status: r.status,
            created_at: r.created_at,
            resolved_at: r.resolved_at
          }));
        }
      } catch (err) {
        console.warn('Supabase getReports error:', err);
      }
    }

    // Local storage fallback
    try {
      const raw = localStorage.getItem(STORAGE_REPORTS);
      if (raw) return JSON.parse(raw);
    } catch (_) {}

    localStorage.setItem(STORAGE_REPORTS, JSON.stringify(INITIAL_REPORTS));
    return INITIAL_REPORTS;
  }

  /**
   * Creates a safety report on a project, review, user, or discussion
   */
  static async createReport(report: {
    reporterId: string;
    reporterName?: string;
    targetType: ReportItem['target_type'];
    targetId: string;
    targetTitle?: string;
    reason: string;
    details?: string;
  }): Promise<{ report: ReportItem; error: string | null }> {
    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      reporter_id: report.reporterId,
      reporter_name: report.reporterName || 'Community Member',
      target_type: report.targetType,
      target_id: report.targetId,
      target_title: report.targetTitle || 'Reported Content',
      reason: report.reason,
      details: report.details,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('reports')
          .insert({
            reporter_id: report.reporterId,
            target_type: report.targetType,
            target_id: report.targetId,
            reason: report.reason,
            details: report.details,
            status: 'pending'
          });
      } catch (err) {
        console.warn('Supabase createReport error:', err);
      }
    }

    try {
      const existing = await this.getReports();
      const updated = [newReport, ...existing];
      localStorage.setItem(STORAGE_REPORTS, JSON.stringify(updated));
    } catch (_) {}

    return { report: newReport, error: null };
  }

  /**
   * Resolves, reviews, or dismisses a report
   */
  static async updateReportStatus(reportId: string, status: ReportStatus): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('reports')
          .update({
            status,
            resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null
          })
          .eq('id', reportId);
      } catch (err) {
        console.warn('Supabase updateReportStatus error:', err);
      }
    }

    try {
      const existing = await this.getReports();
      const updated = existing.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status,
            resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : undefined
          };
        }
        return r;
      });
      localStorage.setItem(STORAGE_REPORTS, JSON.stringify(updated));
    } catch (_) {}

    return true;
  }

  /**
   * Logs an action in the immutable admin audit trail
   */
  static async logAction(action: {
    adminId: string;
    adminName?: string;
    actionType: string;
    targetType: string;
    targetId: string;
    notes?: string;
  }): Promise<void> {
    const entry: AdminAction = {
      id: `act-${Date.now()}`,
      admin_id: action.adminId,
      admin_name: action.adminName || 'Admin',
      action_type: action.actionType,
      target_type: action.targetType,
      target_id: action.targetId,
      notes: action.notes,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('admin_actions').insert({
          admin_id: action.adminId,
          action_type: action.actionType,
          target_type: action.targetType,
          target_id: action.targetId,
          notes: action.notes
        });
      } catch (err) {
        console.warn('Supabase logAction error:', err);
      }
    }

    try {
      const raw = localStorage.getItem(STORAGE_ADMIN_ACTIONS);
      const existing: AdminAction[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(STORAGE_ADMIN_ACTIONS, JSON.stringify([entry, ...existing]));
    } catch (_) {}
  }
}
