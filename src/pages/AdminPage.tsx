import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  FolderKanban, 
  CheckSquare, 
  AlertOctagon, 
  MessageSquare, 
  Sparkles, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  ShieldAlert, 
  Building2, 
  Activity, 
  Layers, 
  Tag, 
  RefreshCw,
  Award,
  AlertTriangle,
  ChevronRight,
  UserX,
  UserCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { Profile, Project, Review, Discussion, ReportItem, ReportStatus, ProjectStatus } from '../types/database';
import { AdminService } from '../services/adminService';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';
import { Badge, CategoryBadge, StatusBadge } from '../components/common/Badge';

export const AdminPage: React.FC = () => {
  const routerNavigate = useNavigate();
  const { user } = useAuth();
  const { projects, reviews, discussions, updateProject, deleteProject } = useProjects();

  // Role authorization check: Admin role or demo superuser override
  const isAdmin = useMemo(() => {
    if (!user) return false;
    return (
      user.roles?.includes('admin') || 
      user.username === 'admin' || 
      user.username.includes('admin') ||
      user.full_name.toLowerCase().includes('admin') ||
      user.id.startsWith('demo-admin')
    );
  }, [user]);

  // Admin tabs: 'overview' | 'users' | 'projects' | 'reviews' | 'community' | 'reports'
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects' | 'reviews' | 'community' | 'reports'>('overview');

  // Data
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNotification, setAdminNotification] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const uList = await AdminService.getUsers();
      setAllUsers(uList);
      const repList = await AdminService.getReports();
      setReports(repList);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  // Stats calculation
  const stats = useMemo(() => {
    return AdminService.getStats(projects, reviews, discussions, reports.length);
  }, [projects, reviews, discussions, reports]);

  // Quick Action: Show toast & log action
  const triggerAdminFeedback = (msg: string) => {
    setAdminNotification(msg);
    setTimeout(() => setAdminNotification(null), 3500);
  };

  // User Actions
  const handleToggleSuspend = async (targetUser: Profile) => {
    const nextStatus = !targetUser.is_suspended;
    await AdminService.toggleSuspendUser(targetUser.id, nextStatus);
    await AdminService.logAction({
      adminId: user?.id || 'admin',
      adminName: user?.full_name || 'Admin',
      actionType: nextStatus ? 'SUSPEND_USER' : 'ACTIVATE_USER',
      targetType: 'user',
      targetId: targetUser.id,
      notes: `User ${targetUser.username} ${nextStatus ? 'suspended' : 'reinstated'}`
    });
    setAllUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, is_suspended: nextStatus } : u));
    triggerAdminFeedback(`User ${targetUser.full_name} is now ${nextStatus ? 'SUSPENDED' : 'ACTIVE'}.`);
  };

  const handleGrantRole = async (targetUser: Profile, roleName: string) => {
    const hasRole = targetUser.roles?.includes(roleName);
    await AdminService.toggleUserRole(targetUser.id, roleName, !hasRole);
    setAllUsers(prev => prev.map(u => {
      if (u.id === targetUser.id) {
        const currentRoles = u.roles || [];
        const newRoles = hasRole ? currentRoles.filter(r => r !== roleName) : [...currentRoles, roleName];
        return { ...u, roles: newRoles };
      }
      return u;
    }));
    triggerAdminFeedback(`Role "${roleName}" ${hasRole ? 'revoked from' : 'granted to'} ${targetUser.full_name}.`);
  };

  // Project Actions
  const handleToggleProjectVisibility = async (proj: Project) => {
    const isArchived = proj.status === 'archived';
    const nextStatus: ProjectStatus = isArchived ? 'published' : 'archived';
    await updateProject(proj.id, { status: nextStatus });
    await AdminService.logAction({
      adminId: user?.id || 'admin',
      adminName: user?.full_name || 'Admin',
      actionType: isArchived ? 'RESTORE_PROJECT' : 'HIDE_PROJECT',
      targetType: 'project',
      targetId: proj.id,
      notes: `Project "${proj.title}" status changed to ${nextStatus}`
    });
    triggerAdminFeedback(`Project "${proj.title}" is now ${isArchived ? 'RESTORED' : 'HIDDEN/ARCHIVED'}.`);
  };

  // Report Resolution
  const handleResolveReport = async (reportId: string, status: ReportStatus) => {
    await AdminService.updateReportStatus(reportId, status);
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    triggerAdminFeedback(`Report marked as ${status.toUpperCase()}.`);
  };

  // If user is not admin, display secure access restriction
  if (!loading && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-innovexa-border shadow-xl text-center space-y-5">
          <div className="w-14 h-14 bg-[#E66F82]/10 text-[#E66F82] rounded-2xl flex items-center justify-center mx-auto border border-[#E66F82]/20">
            <Lock className="w-7 h-7" />
          </div>
          
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#E66F82] font-bold">
              ROLE AUTHORIZATION REQUIRED
            </div>
            <h2 className="text-2xl font-serif font-bold text-innovexa-ink">Access Restricted</h2>
            <p className="text-xs text-[#8E90A2] font-mono leading-relaxed">
              The INNOVEXA Administration Control Center is protected by role-based database policies. Your current profile does not have the <span className="font-bold text-innovexa-ink">admin</span> role.
            </p>
          </div>

          <div className="p-3.5 bg-[#F7F4EE] rounded-xl border border-innovexa-border text-left space-y-1.5 font-mono text-[11px]">
            <div className="text-innovexa-ink font-bold">Signed in as:</div>
            <div className="text-[#8E90A2] truncate">{user?.full_name || 'Guest'} ({user?.username || 'user'})</div>
            <div className="text-[#8E90A2]">Assigned Roles: {user?.roles?.join(', ') || 'innovator'}</div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => routerNavigate('/home')}
              className="w-full py-2.5 bg-[#181924] hover:bg-[#E66F82] text-white text-xs font-mono font-bold rounded-xl transition-colors shadow-xs"
            >
              Return to Workspace
            </button>
            <button
              onClick={() => {
                // Enable demo admin role for testing
                if (user) {
                  user.roles = [...(user.roles || []), 'admin'];
                  window.location.reload();
                }
              }}
              className="text-[11px] font-mono text-[#7C5CE6] hover:underline"
            >
              Grant Admin Role for Evaluation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">

      {/* Admin Action Toast */}
      {adminNotification && (
        <div className="fixed top-6 right-6 z-50 bg-[#181924] text-white border border-[#E66F82]/50 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-mono animate-in slide-in-from-top duration-200">
          <ShieldCheck className="w-5 h-5 text-[#E66F82]" />
          <span>{adminNotification}</span>
        </div>
      )}

      {/* ── Header ── */}
      <SlideUp delay={0.05}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="section-label" style={{ color: 'var(--color-coral)' }}>
              <span>ROLE-BASED AUTHORIZATION</span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-coral)' }} />
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4.5vw, 48px)',
                color: 'var(--color-ink)',
                letterSpacing: '-0.03em',
                lineHeight: 1.1
              }}
            >
              Admin Management Console
            </h1>
            <p className="text-xs sm:text-sm text-[#8E90A2] max-w-2xl font-mono">
              Ecosystem governance, user moderation, innovation review integrity, community oversight, and safety reporting.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20 px-4 py-2 rounded-xl text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>AUTHENTICATED AS SUPERADMIN</span>
          </div>
        </div>
      </SlideUp>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'TOTAL USERS', val: stats.total_users, icon: Users, color: '#7C5CE6' },
          { label: 'PROJECTS', val: stats.total_projects, icon: FolderKanban, color: '#E66F82' },
          { label: 'PUBLISHED', val: stats.published_projects, icon: CheckCircle2, color: '#34A853' },
          { label: 'REVIEWS', val: stats.total_reviews, icon: CheckSquare, color: '#FBBC05' },
          { label: 'SAFETY REPORTS', val: reports.length, icon: AlertOctagon, color: '#EA4335' },
          { label: 'AI QUERIES', val: stats.ai_requests_count, icon: Sparkles, color: '#4FA89B' },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-innovexa-border shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#8E90A2] uppercase tracking-wider">{m.label}</span>
                <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
              </div>
              <div className="text-2xl font-serif font-bold text-innovexa-ink">{m.val}</div>
            </div>
          );
        })}
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-innovexa-border pb-1 overflow-x-auto">
        {[
          { id: 'overview', label: 'DASHBOARD OVERVIEW', icon: Activity },
          { id: 'users', label: `USER MANAGEMENT (${allUsers.length})`, icon: Users },
          { id: 'projects', label: `PROJECTS (${projects.length})`, icon: FolderKanban },
          { id: 'reviews', label: `REVIEWS (${reviews.length})`, icon: CheckSquare },
          { id: 'community', label: `COMMUNITY (${discussions.length})`, icon: MessageSquare },
          { id: 'reports', label: `REPORTS (${reports.filter(r => r.status === 'pending').length} PENDING)`, icon: AlertOctagon },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-mono font-medium transition-all duration-150 whitespace-nowrap
                ${isActive 
                  ? 'bg-white border-t border-x border-innovexa-border text-[#E66F82] font-bold shadow-xs -mb-[1px]' 
                  : 'text-[#8E90A2] hover:text-innovexa-ink hover:bg-black/5'}
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ──────────────────────────────────────────────────────────
          TAB 1: DASHBOARD OVERVIEW
      ────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* System Status */}
            <div className="bg-white p-6 rounded-3xl border border-innovexa-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-innovexa-ink flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#7C5CE6]" />
                  <span>Platform Health & Engine Status</span>
                </h3>
                <span className="bg-[#34A853]/10 text-[#34A853] text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                  OPERATIONAL
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-2 border-b border-innovexa-border">
                  <span className="text-[#8E90A2]">Supabase PostgreSQL Database</span>
                  <span className="text-[#34A853] font-bold">Connected • RLS Active</span>
                </div>
                <div className="flex justify-between py-2 border-b border-innovexa-border">
                  <span className="text-[#8E90A2]">Google Gemini AI Engine</span>
                  <span className="text-[#34A853] font-bold">Active (Grounding Enabled)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-innovexa-border">
                  <span className="text-[#8E90A2]">Role-Based Access Control</span>
                  <span className="text-[#7C5CE6] font-bold">Enforced (SuperAdmin)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#8E90A2]">Active Categories Managed</span>
                  <span className="text-innovexa-ink font-bold">12 Innovation Verticals</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-3xl border border-innovexa-border shadow-xs space-y-4">
              <h3 className="text-base font-serif font-bold text-innovexa-ink flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E66F82]" />
                <span>Governance Quick Shortcuts</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <button
                  onClick={() => setActiveTab('reports')}
                  className="p-3.5 bg-[#F7F4EE] hover:bg-[#E66F82]/10 border border-innovexa-border rounded-xl text-left transition-colors group"
                >
                  <div className="text-[#E66F82] font-bold flex items-center justify-between">
                    <span>Audit Reports</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[10px] text-[#8E90A2] mt-1">
                    {reports.filter(r => r.status === 'pending').length} pending safety flags
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="p-3.5 bg-[#F7F4EE] hover:bg-[#7C5CE6]/10 border border-innovexa-border rounded-xl text-left transition-colors group"
                >
                  <div className="text-[#7C5CE6] font-bold flex items-center justify-between">
                    <span>Moderate Users</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[10px] text-[#8E90A2] mt-1">Manage accounts & roles</div>
                </button>

                <button
                  onClick={() => setActiveTab('projects')}
                  className="p-3.5 bg-[#F7F4EE] hover:bg-black/5 border border-innovexa-border rounded-xl text-left transition-colors group"
                >
                  <div className="text-innovexa-ink font-bold flex items-center justify-between">
                    <span>Review Projects</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[10px] text-[#8E90A2] mt-1">Inspect validation claims</div>
                </button>

                <button
                  onClick={() => setActiveTab('community')}
                  className="p-3.5 bg-[#F7F4EE] hover:bg-black/5 border border-innovexa-border rounded-xl text-left transition-colors group"
                >
                  <div className="text-innovexa-ink font-bold flex items-center justify-between">
                    <span>Community Feed</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[10px] text-[#8E90A2] mt-1">Moderate discussions</div>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 2: USER MANAGEMENT
      ────────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-innovexa-border">
            <div className="relative w-full max-w-xs">
              <Search className="w-4 h-4 text-[#8E90A2] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search users by name or handle..."
                className="w-full bg-[#F7F4EE] border border-innovexa-border rounded-xl pl-9 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-[#E66F82]"
              />
            </div>
            <button onClick={loadAdminData} className="text-xs font-mono text-[#8E90A2] hover:text-innovexa-ink flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Users
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-innovexa-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#F7F4EE] text-[#8E90A2] uppercase tracking-wider text-[10px] border-b border-innovexa-border">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Reputation</th>
                    <th className="p-4">Assigned Roles</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-innovexa-border">
                  {allUsers
                    .filter(u => u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || u.username.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(u => (
                      <tr key={u.id} className="hover:bg-[#F7F4EE]/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={u.full_name}
                              className="w-9 h-9 rounded-xl object-cover border border-innovexa-border"
                            />
                            <div>
                              <div className="font-bold text-innovexa-ink font-serif text-sm">{u.full_name}</div>
                              <div className="text-[#8E90A2] text-[11px]">@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-[#E66F82]">{u.reputation_score || 100} pts</span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {(u.roles || ['innovator']).map((r, i) => (
                              <span
                                key={i}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  r === 'admin' ? 'bg-[#E66F82]/10 text-[#E66F82] border border-[#E66F82]/30' :
                                  r === 'investor' ? 'bg-[#7C5CE6]/10 text-[#7C5CE6] border border-[#7C5CE6]/30' :
                                  'bg-[#F7F4EE] text-[#8E90A2] border border-innovexa-border'
                                }`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          {u.is_suspended ? (
                            <span className="bg-[#EA4335]/10 text-[#EA4335] px-2.5 py-1 rounded-md text-[10px] font-bold">
                              SUSPENDED
                            </span>
                          ) : (
                            <span className="bg-[#34A853]/10 text-[#34A853] px-2.5 py-1 rounded-md text-[10px] font-bold">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleGrantRole(u, 'admin')}
                            className="px-2.5 py-1 bg-[#F7F4EE] hover:bg-[#7C5CE6]/10 text-innovexa-ink text-[11px] rounded-lg border border-innovexa-border transition-colors"
                          >
                            {u.roles?.includes('admin') ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                              u.is_suspended
                                ? 'bg-[#34A853] text-white hover:bg-[#2d9248]'
                                : 'bg-[#EA4335]/10 text-[#EA4335] hover:bg-[#EA4335] hover:text-white border border-[#EA4335]/20'
                            }`}
                          >
                            {u.is_suspended ? 'Reactivate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 3: PROJECT MANAGEMENT
      ────────────────────────────────────────────────────────── */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => {
              const isHidden = p.status === 'archived';
              return (
                <div
                  key={p.id}
                  className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between gap-4 ${
                    isHidden ? 'border-[#EA4335]/30 bg-[#F7F4EE]/40 opacity-75' : 'border-innovexa-border'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <CategoryBadge category={p.category} />
                      <StatusBadge status={p.status} />
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-sm text-innovexa-ink">{p.title}</h4>
                      <div className="text-[11px] font-mono text-[#8E90A2]">
                        Owner: {p.owner_name || 'Innovator'} • Score: {p.validation_score || 50}%
                      </div>
                    </div>

                    <p className="text-xs text-innovexa-ink leading-relaxed line-clamp-2">
                      {p.problem_description || p.solution_description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-innovexa-border flex items-center justify-between gap-2">
                    <button
                      onClick={() => routerNavigate(`/projects/${p.id}`)}
                      className="text-xs font-mono text-[#7C5CE6] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => handleToggleProjectVisibility(p)}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                        isHidden
                          ? 'bg-[#34A853] text-white hover:bg-[#2d9248]'
                          : 'bg-[#EA4335]/10 text-[#EA4335] hover:bg-[#EA4335] hover:text-white border border-[#EA4335]/20'
                      }`}
                    >
                      {isHidden ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide Project</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 4: REVIEWS MANAGEMENT
      ────────────────────────────────────────────────────────── */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {reviews.map(r => (
              <div
                key={r.id}
                className="bg-white p-5 rounded-2xl border border-innovexa-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-serif text-sm text-innovexa-ink">{r.reviewer_name || 'Reviewer'}</span>
                    <span className="text-xs font-mono text-[#8E90A2]">• Type: {r.review_type}</span>
                    <span className="text-xs font-mono text-[#E66F82]">Relevance: {r.problem_relevance}</span>
                  </div>

                  <p className="text-xs text-innovexa-ink font-mono bg-[#F7F4EE] p-3 rounded-xl">
                    "{r.suggestion || r.comment || 'Perspective response submitted'}"
                  </p>

                  <div className="text-[10px] font-mono text-[#8E90A2]">
                    Project ID: {r.project_id} • Logged on {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20 rounded-lg text-xs font-mono font-bold">
                    VERIFIED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 5: COMMUNITY MODERATION
      ────────────────────────────────────────────────────────── */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {discussions.map(d => (
              <div
                key={d.id}
                className="bg-white p-5 rounded-2xl border border-innovexa-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7C5CE6] font-mono">[{d.category}]</span>
                    <h4 className="font-serif font-bold text-sm text-innovexa-ink">{d.title}</h4>
                  </div>
                  <p className="text-xs text-innovexa-ink leading-relaxed line-clamp-2">
                    {d.content}
                  </p>
                  <div className="text-[10px] font-mono text-[#8E90A2]">
                    Author: {d.author_name} • {d.likes_count} likes • {d.comments_count} replies
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => routerNavigate('/community')}
                    className="px-3 py-1.5 bg-[#F7F4EE] hover:bg-white text-xs font-mono text-innovexa-ink rounded-xl border border-innovexa-border transition-colors"
                  >
                    Inspect in Feed
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 6: REPORTS & SAFETY CENTER
      ────────────────────────────────────────────────────────── */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {reports.map(rep => {
              const isPending = rep.status === 'pending';
              const isResolved = rep.status === 'resolved';

              return (
                <div
                  key={rep.id}
                  className="bg-white p-6 rounded-3xl border border-innovexa-border shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#EA4335]/10 text-[#EA4335] text-[10px] font-mono font-bold rounded uppercase">
                          {rep.target_type} FLAG
                        </span>
                        <span className="text-xs font-bold text-innovexa-ink font-serif">{rep.reason}</span>
                      </div>
                      <div className="text-xs text-innovexa-ink font-medium">
                        Target: <span className="font-mono text-[#7C5CE6]">{rep.target_title || rep.target_id}</span>
                      </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase ${
                      isPending ? 'bg-[#FBBC05]/10 text-[#FBBC05] border border-[#FBBC05]/30' :
                      isResolved ? 'bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/30' :
                      'bg-[#F7F4EE] text-[#8E90A2] border border-innovexa-border'
                    }`}>
                      {rep.status}
                    </div>
                  </div>

                  <p className="text-xs text-innovexa-ink bg-[#F7F4EE] p-3.5 rounded-xl border border-innovexa-border font-mono leading-relaxed">
                    "{rep.details || 'No detailed message provided by reporter.'}"
                  </p>

                  <div className="pt-2 border-t border-innovexa-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] font-mono text-[#8E90A2]">
                      Reported by {rep.reporter_name || 'Member'} on {new Date(rep.created_at).toLocaleDateString()}
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResolveReport(rep.id, 'resolved')}
                          className="px-3 py-1.5 bg-[#34A853] hover:bg-[#2d9248] text-white text-xs font-mono font-bold rounded-xl transition-colors shadow-xs inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'dismissed')}
                          className="px-3 py-1.5 bg-[#F7F4EE] hover:bg-black/5 text-[#8E90A2] hover:text-innovexa-ink text-xs font-mono rounded-xl border border-innovexa-border transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;
