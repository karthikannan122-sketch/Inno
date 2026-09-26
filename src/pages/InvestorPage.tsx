import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  DollarSign, 
  Globe, 
  Tag, 
  UserCheck, 
  Sparkles, 
  ChevronRight, 
  Mail, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  FileText,
  AlertCircle,
  Eye,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Handshake,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { InvestorProfile, InvestorConnection, ConnectionStatus, Project } from '../types/database';
import { InvestorService } from '../services/investorService';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';
import { Badge, CategoryBadge, StatusBadge } from '../components/common/Badge';

export const InvestorPage: React.FC = () => {
  const routerNavigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useProjects();

  // Active Tab: 'directory' | 'dealflow' | 'connections' | 'my_profile'
  const [activeTab, setActiveTab] = useState<'directory' | 'dealflow' | 'connections' | 'my_profile'>('directory');
  
  // Data States
  const [investors, setInvestors] = useState<InvestorProfile[]>([]);
  const [connections, setConnections] = useState<InvestorConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [myInvestorProfile, setMyInvestorProfile] = useState<InvestorProfile | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCheckSize, setSelectedCheckSize] = useState<string>('All');

  // Modal / Request Drawer State
  const [selectedInvestorForModal, setSelectedInvestorForModal] = useState<InvestorProfile | null>(null);
  const [selectedProjectForPitch, setSelectedProjectForPitch] = useState<string>('');
  const [pitchMessage, setPitchMessage] = useState<string>('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  // Investor Profile Form State (for investor side)
  const [orgName, setOrgName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [checkSizeRange, setCheckSizeRange] = useState('$50K – $250K');
  const [investorType, setInvestorType] = useState('Venture Capital');
  const [contactEmail, setContactEmail] = useState('');
  const [interestsText, setInterestsText] = useState('AI & Machine Learning, Developer Tools, DeepTech');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveProfileSuccess, setSaveProfileSuccess] = useState(false);

  // User's own projects for pitch introduction
  const myProjects = useMemo(() => {
    const uid = user?.id || 'current';
    return projects.filter(p => p.owner_id === uid || p.owner_id === 'current' || (p.owner_id.startsWith('demo-creator') && !user));
  }, [projects, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const invs = await InvestorService.getInvestors();
      setInvestors(invs);

      const userId = user?.id || 'current';
      const conns = await InvestorService.getConnections(userId);
      setConnections(conns);

      const myProf = await InvestorService.getInvestorByUserId(userId);
      if (myProf) {
        setMyInvestorProfile(myProf);
        setOrgName(myProf.organization_name);
        setBio(myProf.bio || '');
        setWebsite(myProf.website || '');
        setCheckSizeRange(myProf.check_size_range || '$50K – $250K');
        setInvestorType(myProf.investor_type || 'Venture Capital');
        setContactEmail(myProf.contact_email || '');
        setInterestsText(myProf.investment_interests.join(', '));
      }
    } catch (err) {
      console.error('Error loading investor module data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Categories list
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    investors.forEach(inv => inv.preferred_categories?.forEach(c => set.add(c)));
    return ['All', ...Array.from(set)];
  }, [investors]);

  // Filtered Investors
  const filteredInvestors = useMemo(() => {
    return investors.filter(inv => {
      const matchesSearch = 
        inv.organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.investment_interests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || inv.preferred_categories.includes(selectedCategory);
      const matchesCheck = selectedCheckSize === 'All' || inv.check_size_range === selectedCheckSize;

      return matchesSearch && matchesCat && matchesCheck;
    });
  }, [investors, searchQuery, selectedCategory, selectedCheckSize]);

  // Filtered Dealflow Projects (for Investor View)
  const publishedInnovations = useMemo(() => {
    return projects.filter(p => p.status === 'published' || p.status === 'under_review');
  }, [projects]);

  // Handle send pitch / connection request
  const handleSendPitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestorForModal) return;
    
    if (!selectedProjectForPitch && myProjects.length > 0) {
      alert('Please select a project to introduce to the investor.');
      return;
    }

    setSendingRequest(true);
    const chosenProj = projects.find(p => p.id === selectedProjectForPitch) || projects[0];

    const result = await InvestorService.sendConnectionRequest({
      investorId: selectedInvestorForModal.user_id,
      creatorId: user?.id || 'demo-creator-01',
      projectId: chosenProj ? chosenProj.id : 'proj-intro',
      message: pitchMessage || `Hi ${selectedInvestorForModal.user_name || 'Investor'}, we would love to connect and share our innovation validation progress for ${chosenProj?.title || 'our project'}.`,
      initiatedBy: 'creator',
      project: chosenProj,
      investorProfile: selectedInvestorForModal,
      creatorName: user?.full_name || 'Innovator',
      creatorAvatar: user?.avatar_url
    });

    setSendingRequest(false);
    if (result.connection) {
      setRequestSuccess(`Connection request successfully sent to ${selectedInvestorForModal.organization_name}!`);
      setSelectedInvestorForModal(null);
      setPitchMessage('');
      loadData();
      setTimeout(() => setRequestSuccess(null), 4500);
    }
  };

  // Handle status updates on incoming requests
  const handleUpdateStatus = async (connectionId: string, status: ConnectionStatus) => {
    await InvestorService.updateConnectionStatus(connectionId, status);
    loadData();
  };

  // Save investor profile
  const handleSaveInvestorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const interests = interestsText.split(',').map(s => s.trim()).filter(Boolean);
    const userId = user?.id || 'current';

    const res = await InvestorService.saveInvestorProfile(userId, {
      organization_name: orgName,
      bio,
      website,
      check_size_range: checkSizeRange,
      investor_type: investorType,
      contact_email: contactEmail,
      investment_interests: interests,
      preferred_categories: interests.slice(0, 3),
      user_name: user?.full_name || 'Verified Investor',
      user_avatar: user?.avatar_url
    });

    setSavingProfile(false);
    if (res.profile) {
      setMyInvestorProfile(res.profile);
      setSaveProfileSuccess(true);
      setTimeout(() => setSaveProfileSuccess(false), 3500);
      loadData();
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Toast Alert */}
      {requestSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-[#181924] text-white border border-[#34A853]/50 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-mono animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#34A853]" />
          <span>{requestSuccess}</span>
        </div>
      )}

      {/* ── Header ── */}
      <SlideUp delay={0.05}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="section-label" style={{ color: 'var(--color-coral)' }}>
              <span>CREATOR & INVESTOR SYNDICATE</span>
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
              Investor Discovery & Connection
            </h1>
            <p className="text-xs sm:text-sm text-[#8E90A2] max-w-2xl font-mono">
              Connect validated innovations with verified early-stage angels, syndicates, and seed venture funds. Discover aligned capital without financial intermediary complexity.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2.5 rounded-xl border border-innovexa-border shadow-xs flex items-center gap-2 text-xs font-mono">
              <Building2 className="w-4 h-4 text-[#7C5CE6]" />
              <span className="text-innovexa-ink font-bold">{investors.length}</span>
              <span className="text-innovexa-ink-muted">Funds Active</span>
            </div>
            <div className="bg-white px-4 py-2.5 rounded-xl border border-innovexa-border shadow-xs flex items-center gap-2 text-xs font-mono">
              <Handshake className="w-4 h-4 text-[#E66F82]" />
              <span className="text-innovexa-ink font-bold">{connections.length}</span>
              <span className="text-innovexa-ink-muted">Connections</span>
            </div>
          </div>
        </div>
      </SlideUp>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-innovexa-border pb-1 overflow-x-auto">
        {[
          { id: 'directory', label: 'INVESTOR DIRECTORY', icon: Building2 },
          { id: 'dealflow', label: 'INNOVATION DEALFLOW', icon: TrendingUp },
          { id: 'connections', label: `CONNECTIONS (${connections.length})`, icon: Handshake },
          { id: 'my_profile', label: myInvestorProfile ? 'INVESTOR SETTINGS' : 'BECOME AN INVESTOR', icon: Briefcase },
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
          TAB 1: INVESTOR DIRECTORY (CREATOR VIEW)
      ────────────────────────────────────────────────────────── */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-innovexa-border shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#8E90A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search investors, thesis, focus areas..."
                className="w-full bg-[#F7F4EE]/60 border border-innovexa-border rounded-xl pl-9 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-[#E66F82] transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <span className="text-[11px] font-mono text-[#8E90A2] flex items-center gap-1">
                <Filter className="w-3 h-3" /> Category:
              </span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-[#F7F4EE] border border-innovexa-border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#E66F82]"
              >
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <span className="text-[11px] font-mono text-[#8E90A2] ml-2 flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Check Size:
              </span>
              <select
                value={selectedCheckSize}
                onChange={e => setSelectedCheckSize(e.target.value)}
                className="bg-[#F7F4EE] border border-innovexa-border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#E66F82]"
              >
                <option value="All">All Ranges</option>
                <option value="$10K – $75K">$10K – $75K</option>
                <option value="$25K – $150K">$25K – $150K</option>
                <option value="$50K – $250K">$50K – $250K</option>
                <option value="$50K – $300K">$50K – $300K</option>
              </select>
            </div>
          </div>

          {/* Investors Grid */}
          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-[#8E90A2] animate-pulse">
              LOADING INVESTOR SYNDICATE DIRECTORY...
            </div>
          ) : filteredInvestors.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-innovexa-border p-12 text-center space-y-3">
              <Building2 className="w-8 h-8 text-[#8E90A2] mx-auto opacity-50" />
              <div className="text-sm font-medium text-innovexa-ink font-serif">No investors matched your filter criteria.</div>
              <p className="text-xs text-[#8E90A2] font-mono">Try searching with a broader category or reset your check size filter.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedCheckSize('All'); }}
                className="px-4 py-2 bg-[#F7F4EE] hover:bg-white text-xs font-mono rounded-xl border border-innovexa-border transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredInvestors.map(inv => {
                const isConnected = connections.some(c => c.investor_id === inv.user_id && (c.status === 'accepted' || c.status === 'pending'));
                const existingConn = connections.find(c => c.investor_id === inv.user_id);

                return (
                  <div
                    key={inv.id}
                    className="bg-white rounded-2xl border border-innovexa-border p-6 shadow-xs hover:shadow-md hover:border-[#E66F82]/40 transition-all duration-200 flex flex-col justify-between gap-5 group"
                  >
                    <div className="space-y-4">
                      {/* Top Bar */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={inv.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={inv.user_name}
                            className="w-12 h-12 rounded-xl object-cover border border-innovexa-border"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-innovexa-ink font-serif group-hover:text-[#E66F82] transition-colors">
                                {inv.organization_name}
                              </h3>
                              <span title="Verified Fund">
                                <ShieldCheck className="w-4 h-4 text-[#34A853] shrink-0" />
                              </span>
                            </div>
                            <div className="text-xs text-[#8E90A2] font-mono">
                              {inv.user_name} • <span className="text-[#7C5CE6]">{inv.investor_type || 'Venture Capital'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Check Size Pill */}
                        <div className="bg-[#7C5CE6]/10 text-[#7C5CE6] border border-[#7C5CE6]/20 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold whitespace-nowrap">
                          {inv.check_size_range || '$25K – $150K'}
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-innovexa-ink leading-relaxed line-clamp-3">
                        {inv.bio || 'Early-stage innovation investor supporting founders through validation and prototype launch.'}
                      </p>

                      {/* Focus Tags */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono uppercase text-[#8E90A2] tracking-wider">Investment Focus:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {inv.investment_interests.map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-[#F7F4EE] border border-innovexa-border/80 text-innovexa-ink px-2.5 py-0.5 rounded-md text-[10px] font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-innovexa-border flex items-center justify-between gap-3">
                      {inv.website && (
                        <a
                          href={inv.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-[#8E90A2] hover:text-innovexa-ink flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" />
                          <span>Website</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      )}

                      {isConnected ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20 rounded-xl text-xs font-mono font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="uppercase">{existingConn?.status || 'Connected'}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedInvestorForModal(inv);
                            if (myProjects.length > 0) {
                              setSelectedProjectForPitch(myProjects[0].id);
                            }
                          }}
                          className="px-4 py-2 bg-[#181924] hover:bg-[#E66F82] text-white text-xs font-mono font-bold rounded-xl transition-colors inline-flex items-center gap-2 ml-auto shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Request Connection</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 2: INNOVATION DEALFLOW (INVESTOR VIEW)
      ────────────────────────────────────────────────────────── */}
      {activeTab === 'dealflow' && (
        <div className="space-y-6">
          <div className="bg-[#181924] text-white p-6 rounded-3xl space-y-2 border border-white/10">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#E66F82] font-bold">
              VALIDATED INNOVATION PIPELINE
            </div>
            <h2 className="text-xl font-serif font-bold">Live Community Dealflow</h2>
            <p className="text-xs text-white/70 font-mono max-w-2xl leading-relaxed">
              Browse innovations undergoing community validation with quantified signal metrics, user problem relevance rates, and validation journey scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {publishedInnovations.map(project => (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-innovexa-border p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <CategoryBadge category={project.category} />
                    <div className="flex items-center gap-1 bg-[#7C5CE6]/10 text-[#7C5CE6] border border-[#7C5CE6]/20 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">
                      <span>{project.validation_score || 75}% VALIDATED</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-innovexa-ink font-serif hover:text-[#E66F82] transition-colors cursor-pointer" onClick={() => routerNavigate(`/projects/${project.id}`)}>
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#8E90A2] font-mono mt-0.5">
                      By {project.owner_name || 'Innovator'} • {project.project_type.toUpperCase()}
                    </p>
                  </div>

                  <p className="text-xs text-innovexa-ink leading-relaxed line-clamp-3">
                    {project.problem_description || project.solution_description}
                  </p>
                </div>

                <div className="pt-3 border-t border-innovexa-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => routerNavigate(`/projects/${project.id}`)}
                    className="text-xs font-mono text-[#7C5CE6] hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Specs</span>
                  </button>

                  <button
                    onClick={() => {
                      if (investors.length > 0) {
                        setSelectedInvestorForModal(investors[0]);
                        setSelectedProjectForPitch(project.id);
                      }
                    }}
                    className="px-3 py-1.5 bg-[#181924] hover:bg-[#E66F82] text-white text-[11px] font-mono font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <span>Connect Creator</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 3: CONNECTIONS & REQUESTS HUB
      ────────────────────────────────────────────────────────── */}
      {activeTab === 'connections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-innovexa-ink">Connection Requests & Direct Introductions</h2>
            <button onClick={loadData} className="text-xs font-mono text-[#8E90A2] hover:text-innovexa-ink flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {connections.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-innovexa-border p-12 text-center space-y-3">
              <Handshake className="w-8 h-8 text-[#8E90A2] mx-auto opacity-50" />
              <div className="text-sm font-medium text-innovexa-ink font-serif">No connection requests logged yet.</div>
              <p className="text-xs text-[#8E90A2] font-mono">Send your first connection request from the Investor Directory to start engaging.</p>
              <button
                onClick={() => setActiveTab('directory')}
                className="px-4 py-2 bg-[#181924] text-white text-xs font-mono rounded-xl hover:bg-[#E66F82] transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>Browse Investor Directory</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map(conn => {
                const isPending = conn.status === 'pending';
                const isAccepted = conn.status === 'accepted';
                const isRejected = conn.status === 'rejected';

                return (
                  <div
                    key={conn.id}
                    className="bg-white rounded-2xl border border-innovexa-border p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-innovexa-ink font-serif">
                          {conn.investor_org || conn.investor_name || 'Investor Syndicate'}
                        </span>
                        <span className="text-xs text-[#8E90A2]">↔</span>
                        <span className="text-xs font-medium text-[#7C5CE6] font-mono">
                          {conn.project_title || 'Innovation Project'}
                        </span>
                        <span className="text-xs text-[#8E90A2]">({conn.creator_name || 'Creator'})</span>
                      </div>

                      <p className="text-xs text-innovexa-ink bg-[#F7F4EE]/80 p-3 rounded-xl border border-innovexa-border font-mono leading-relaxed">
                        "{conn.message}"
                      </p>

                      <div className="text-[10px] font-mono text-[#8E90A2]">
                        Initiated {new Date(conn.created_at).toLocaleDateString()} by {conn.initiated_by || 'creator'}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(conn.id, 'accepted')}
                            className="px-3.5 py-1.5 bg-[#34A853] hover:bg-[#2d9248] text-white text-xs font-mono font-bold rounded-xl transition-colors inline-flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(conn.id, 'rejected')}
                            className="px-3.5 py-1.5 bg-[#F7F4EE] hover:bg-[#E66F82]/10 text-[#E66F82] border border-innovexa-border text-xs font-mono rounded-xl transition-colors inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </>
                      ) : (
                        <div
                          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase ${
                            isAccepted 
                              ? 'bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20'
                              : 'bg-[#E66F82]/10 text-[#E66F82] border border-[#E66F82]/20'
                          }`}
                        >
                          {conn.status}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 4: INVESTOR PROFILE / REGISTRATION
      ────────────────────────────────────────────────────────── */}
      {activeTab === 'my_profile' && (
        <div className="max-w-2xl bg-white p-8 rounded-3xl border border-innovexa-border shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-innovexa-ink">Investor Profile & Focus Settings</h2>
            <p className="text-xs text-[#8E90A2] font-mono">
              Configure your investment profile to receive aligned innovation dealflow from community creators.
            </p>
          </div>

          {saveProfileSuccess && (
            <div className="p-3 bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20 rounded-xl text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Investor profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveInvestorProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-innovexa-ink mb-1 font-medium">
                Organization / Fund Name *
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="e.g. Apex Horizon Ventures or Angel Syndicate"
                className="w-full bg-[#F7F4EE] border border-innovexa-border rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#E66F82]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-innovexa-ink mb-1 font-medium">
                  Investor Type
                </label>
                <select
                  value={investorType}
                  onChange={e => setInvestorType(e.target.value)}
                  className="w-full bg-[#F7F4EE] border border-innovexa-border rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#E66F82]"
                >
                  <option value="Angel Investor">Angel Investor</option>
                  <option value="Venture Capital">Venture Capital</option>
                  <option value="Micro VC">Micro VC</option>
                  <option value="Angel Syndicate">Angel Syndicate</option>
                  <option value="Accelerator / Incubator">Accelerator / Incubator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-innovexa-ink mb-1 font-medium">
                  Typical Check Size Range
                </label>
                <select
                  value={checkSizeRange}
                  onChange={e => setCheckSizeRange(e.target.value)}
                  className="w-full bg-[#F7F4EE] border border-innovexa-border rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#E66F82]"
                >
                  <option value="$10K – $50K">$10K – $50K</option>
                  <option value="$25K – $150K">$25K – $150K</option>
                  <option value="$50K – $250K">$50K – $250K</option>
                  <option value="$100K – $500K">$100K – $500K</option>
                  <option value="$500K+">$500K+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-innovexa-ink mb-1 font-medium">
                Investment Thesis & Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Describe what stage, technology, and business models you actively back..."
                className="w-full bg-[#F7F4EE] border border-innovexa-border rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#E66F82]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-innovexa-ink mb-1 font-medium">
                Target Focus Areas (Comma separated)
              </label>
              <input
                type="text"
                value={interestsText}
                onChange={e => setInterestsText(e.target.value)}
                placeholder="e.g. AI, Healthcare, Agritech, Developer Tools"
                className="w-full bg-[#F7F4EE] border border-innovexa-border rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#E66F82]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-innovexa-ink mb-1 font-medium">
                  Website URL
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://fundname.vc"
                  className="w-full bg-[#F7F4EE] border border-innovexa-border rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#E66F82]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-innovexa-ink mb-1 font-medium">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="partner@fund.vc"
                  className="w-full bg-[#F7F4EE] border border-innovexa-border rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#E66F82]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-innovexa-border flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 bg-[#181924] hover:bg-[#E66F82] text-white text-xs font-mono font-bold rounded-xl transition-colors shadow-sm inline-flex items-center gap-2"
              >
                {savingProfile ? (
                  <span>Saving Profile...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Investor Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── CONNECTION REQUEST MODAL ── */}
      {selectedInvestorForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-innovexa-border shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-mono text-[#E66F82] uppercase tracking-wider font-bold">
                  DIRECT INTRO REQUEST
                </div>
                <h3 className="text-lg font-serif font-bold text-innovexa-ink">
                  Connect with {selectedInvestorForModal.organization_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvestorForModal(null)}
                className="p-1.5 text-[#8E90A2] hover:text-innovexa-ink rounded-lg hover:bg-black/5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendPitch} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-innovexa-ink mb-1 font-medium">
                  Select Project to Introduce *
                </label>
                {myProjects.length > 0 ? (
                  <select
                    value={selectedProjectForPitch}
                    onChange={e => setSelectedProjectForPitch(e.target.value)}
                    className="w-full bg-[#F7F4EE] border border-innovexa-border rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#E66F82]"
                  >
                    {myProjects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.category}) — {p.validation_score || 70}% Validated
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-[#F7F4EE] border border-innovexa-border rounded-xl text-xs font-mono text-[#8E90A2]">
                    No project created yet. You can introduce your general innovation vision or create an idea first.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono text-innovexa-ink mb-1 font-medium">
                  Introduction Pitch Note
                </label>
                <textarea
                  rows={4}
                  required
                  value={pitchMessage}
                  onChange={e => setPitchMessage(e.target.value)}
                  placeholder={`Hi ${selectedInvestorForModal.user_name || 'Team'}, we are building an innovation in ${selectedInvestorForModal.preferred_categories[0] || 'your focus area'} and have validated core user demand on INNOVEXA. We'd love to share our architecture and progress.`}
                  className="w-full bg-[#F7F4EE] border border-innovexa-border rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-[#E66F82]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvestorForModal(null)}
                  className="px-4 py-2 text-xs font-mono text-[#8E90A2] hover:text-innovexa-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingRequest}
                  className="px-6 py-2.5 bg-[#181924] hover:bg-[#E66F82] text-white text-xs font-mono font-bold rounded-xl transition-colors shadow-xs inline-flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingRequest ? 'Sending...' : 'Send Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InvestorPage;
