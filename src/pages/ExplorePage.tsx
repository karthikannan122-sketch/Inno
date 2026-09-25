import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  ThumbsUp, 
  ExternalLink, 
  GitBranch, 
  Globe, 
  Layers, 
  Code2, 
  Package, 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  Scale, 
  CheckCircle2, 
  X, 
  AlertCircle,
  TrendingUp,
  Flame,
  Clock,
  Award,
  Cpu,
  GraduationCap,
  Bookmark,
  RefreshCw,
  Lightbulb,
  Check,
  ShieldCheck,
  Target,
  Zap,
  UserCheck
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useReviewModal } from '../context/ReviewModalContext';
import { Project, ProjectType } from '../types/database';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';
import { Badge, CategoryBadge, TypeBadge, StatusBadge } from '../components/common/Badge';
import { ProjectVoteButtons } from '../components/projects/ProjectVoteButtons';
import { ProjectResourceModal } from '../components/projects/ProjectResourceModal';
import { ProjectComparisonModal } from '../components/projects/ProjectComparisonModal';
import { OpenSourceResourceDirectory } from '../components/resources/OpenSourceResourceDirectory';
import { 
  analyzeSearchQuery, 
  calculateProjectRelevance, 
  RankedProjectResult,
  SearchQueryAnalysis
} from '../services/aiSearchService';

interface ExplorePageProps {
  onNavigate?: (view: string, id?: string) => void;
  onOpenReview?: (project: Project) => void;
}

const EXAMPLE_SEARCH_PILLS = [
  'AI healthcare',
  'student productivity',
  'smart agriculture',
  'cybersecurity',
  'waste management',
  'education technology',
  'fintech',
  'community'
];

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onNavigate: propOnNavigate,
  onOpenReview: propOnOpenReview
}) => {
  const routerNavigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openReviewModal } = useReviewModal();
  const { user } = useAuth();
  const { projects, reviews, loading } = useProjects();

  const onNavigate = propOnNavigate || ((view: string, id?: string) => {
    if (id) routerNavigate(`/projects/${id}`);
    else routerNavigate(`/${view}`);
  });

  const onOpenReview = propOnOpenReview || ((p: Project) => openReviewModal(p));

  // State
  const [activeViewMode, setActiveViewMode] = useState<'innovations' | 'resources'>('innovations');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [isAiDiscoverMode, setIsAiDiscoverMode] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'relevant' | 'trending' | 'newest' | 'reviews' | 'upvotes' | 'readiness'>('trending');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Multi-Project Comparison Tray State
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareToast, setCompareToast] = useState<string | null>(null);

  // Resource Modal State
  const [selectedResourceProject, setSelectedResourceProject] = useState<Project | null>(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

  // Recently Viewed Projects (stored locally)
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('innovexa_recently_viewed_projects');
      if (stored) {
        setRecentlyViewedIds(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Handle URL Query Parameters (?q=... or ?search=... or ?compare=id1,id2 or ?category=...)
  useEffect(() => {
    const compareParam = searchParams.get('compare');
    if (compareParam) {
      const ids = compareParam.split(',').map(s => s.trim()).filter(Boolean);
      if (ids.length >= 2 && ids.length <= 4) {
        setSelectedCompareIds(ids);
        setIsCompareModalOpen(true);
      } else if (ids.length === 1) {
        setSelectedCompareIds(ids);
      }
    }

    const qParam = searchParams.get('q') || searchParams.get('search');
    if (qParam && qParam.trim()) {
      setSearchInput(qParam.trim());
      setActiveSearchQuery(qParam.trim());
      setSortBy('relevant');
    }

    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  // Only public published projects are discoverable to normal users
  const publicProjects = useMemo(() => {
    return projects.filter(p => p.visibility === 'public' && p.status !== 'draft');
  }, [projects]);

  // Dynamically extract distinct categories from real database projects
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    publicProjects.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set).sort()];
  }, [publicProjects]);

  const typeOptions: { id: string; label: string }[] = [
    { id: 'All',     label: 'ALL TYPES' },
    { id: 'idea',    label: '💡 IDEAS'     },
    { id: 'product', label: '📦 PRODUCTS'  },
    { id: 'startup', label: '🚀 STARTUPS'  },
  ];

  // Real-time Query Understanding Analysis
  const queryAnalysis: SearchQueryAnalysis | null = useMemo(() => {
    if (!activeSearchQuery.trim()) return null;
    return analyzeSearchQuery(activeSearchQuery.trim());
  }, [activeSearchQuery]);

  // Execute Search & Relevance Ranking
  const searchRankedResults = useMemo<RankedProjectResult[]>(() => {
    if (!activeSearchQuery.trim() || !queryAnalysis) return [];
    
    return publicProjects
      .map(p => calculateProjectRelevance(p, queryAnalysis))
      .filter(res => res.relevanceScore >= 20) // Discard completely unrelated items
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [publicProjects, activeSearchQuery, queryAnalysis]);

  // Filtered & Sorted Search Results (when searching)
  const filteredSearchResults = useMemo(() => {
    if (!activeSearchQuery.trim()) return [];

    return searchRankedResults.filter(r => {
      const p = r.project;
      const matchesCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesType = selectedType === 'All' || p.project_type === selectedType;
      const matchesStatus = selectedStatus === 'All' || 
        (selectedStatus === 'published' && p.status === 'published') ||
        (selectedStatus === 'validation' && (p.validation_status === 'gathering_feedback' || p.validation_status === 'problem_validation')) ||
        (selectedStatus === 'ready' && (p.validation_status === 'ready_to_launch' || (p.readiness_score || 0) >= 80));

      return matchesCat && matchesType && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'relevant')   return b.relevanceScore - a.relevanceScore;
      if (sortBy === 'trending')   return ((b.project.upvotes_count || 0) * 2 + (b.project.reviews_count || 0) * 3 + (b.project.readiness_score || 0)) -
                                          ((a.project.upvotes_count || 0) * 2 + (a.project.reviews_count || 0) * 3 + (a.project.readiness_score || 0));
      if (sortBy === 'newest')     return new Date(b.project.created_at).getTime() - new Date(a.project.created_at).getTime();
      if (sortBy === 'reviews')    return (b.project.reviews_count || 0) - (a.project.reviews_count || 0);
      if (sortBy === 'upvotes')    return (b.project.upvotes_count || 0) - (a.project.upvotes_count || 0);
      if (sortBy === 'readiness')  return (b.project.readiness_score || 0) - (a.project.readiness_score || 0);
      return b.relevanceScore - a.relevanceScore;
    });
  }, [searchRankedResults, activeSearchQuery, selectedCategory, selectedType, selectedStatus, sortBy]);

  // General Filtered Projects (when NOT searching)
  const generalFilteredProjects = useMemo(() => {
    return publicProjects.filter(p => {
      const matchesCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesType = selectedType === 'All' || p.project_type === selectedType;
      const matchesStatus = selectedStatus === 'All' || 
        (selectedStatus === 'published' && p.status === 'published') ||
        (selectedStatus === 'validation' && (p.validation_status === 'gathering_feedback' || p.validation_status === 'problem_validation')) ||
        (selectedStatus === 'ready' && (p.validation_status === 'ready_to_launch' || (p.readiness_score || 0) >= 80));

      return matchesCat && matchesType && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'trending')   return ((b.upvotes_count || 0) * 2 + (b.reviews_count || 0) * 3 + (b.readiness_score || 0)) -
                                          ((a.upvotes_count || 0) * 2 + (a.reviews_count || 0) * 3 + (a.readiness_score || 0));
      if (sortBy === 'newest')     return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'reviews')    return (b.reviews_count || 0) - (a.reviews_count || 0);
      if (sortBy === 'upvotes')    return (b.upvotes_count || 0) - (a.upvotes_count || 0);
      if (sortBy === 'readiness')  return (b.readiness_score || 0) - (a.readiness_score || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [publicProjects, selectedCategory, selectedType, selectedStatus, sortBy]);

  // ====================================================
  // CURATED DISCOVERY SECTIONS (REAL DATA)
  // ====================================================

  // 1. Trending Innovations (high engagement formula)
  const trendingProjects = useMemo(() => {
    return [...publicProjects].sort((a, b) => {
      const scoreA = (a.upvotes_count || 0) * 2 + (a.reviews_count || 0) * 3 + (a.readiness_score || 0);
      const scoreB = (b.upvotes_count || 0) * 2 + (b.reviews_count || 0) * 3 + (b.readiness_score || 0);
      return scoreB - scoreA;
    }).slice(0, 3);
  }, [publicProjects]);

  // 2. Recently Added Innovations (newest published timestamp)
  const recentlyAddedProjects = useMemo(() => {
    return [...publicProjects].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 3);
  }, [publicProjects]);

  // 3. Highly Engaged & Validated (top reviews & feedback)
  const highlyEngagedProjects = useMemo(() => {
    return [...publicProjects].sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0)).slice(0, 3);
  }, [publicProjects]);

  // 4. AI & Emerging Technology
  const emergingTechProjects = useMemo(() => {
    return publicProjects.filter(p => {
      const cat = p.category.toLowerCase();
      const tags = (p.tags || []).map(t => t.toLowerCase());
      return cat.includes('ai') || cat.includes('tech') || tags.some(t => 
        ['ai', 'ml', 'computer vision', 'iot', 'robotics', 'blockchain', 'web3', 'llm', 'smart'].some(k => t.includes(k))
      );
    }).slice(0, 3);
  }, [publicProjects]);

  // 5. Student & Education Innovations
  const studentInnovations = useMemo(() => {
    return publicProjects.filter(p => {
      const text = `${p.title} ${p.category} ${p.target_audience} ${p.tags.join(' ')}`.toLowerCase();
      return text.includes('student') || text.includes('education') || text.includes('campus') || text.includes('learning') || text.includes('career');
    }).slice(0, 3);
  }, [publicProjects]);

  // 6. Recommended for You (Personalized if user has interests or roles)
  const recommendedProjects = useMemo(() => {
    if (!user) return [];
    const interests = (user.interests || []).map(i => i.toLowerCase());
    if (interests.length === 0) return [];

    return publicProjects.filter(p => {
      const pText = `${p.category} ${p.title} ${p.tags.join(' ')}`.toLowerCase();
      return interests.some(interest => pText.includes(interest));
    }).slice(0, 3);
  }, [publicProjects, user]);

  // 7. Recently Viewed Projects by User
  const recentlyViewedProjects = useMemo(() => {
    if (recentlyViewedIds.length === 0) return [];
    return recentlyViewedIds
      .map(id => publicProjects.find(p => p.id === id))
      .filter((p): p is Project => Boolean(p))
      .slice(0, 3);
  }, [recentlyViewedIds, publicProjects]);

  // Active Display Projects for Grid
  const displayProjects = activeSearchQuery.trim() 
    ? filteredSearchResults.map(r => r.project) 
    : generalFilteredProjects;

  const totalPages = Math.ceil(displayProjects.length / ITEMS_PER_PAGE) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [displayProjects, currentPage]);

  // Handlers
  const handleTriggerSearch = (queryText: string, isAiMode = false) => {
    const trimmed = queryText.trim();
    if (!trimmed) {
      setActiveSearchQuery('');
      setSearchParams({});
      return;
    }

    setActiveSearchQuery(trimmed);
    setIsAiDiscoverMode(isAiMode);
    setCurrentPage(1);
    setSortBy('relevant');
    setSearchParams({ q: trimmed });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearchQuery('');
    setSelectedCategory('All');
    setSelectedType('All');
    setSelectedStatus('All');
    setSortBy('trending');
    setCurrentPage(1);
    setSearchParams({});
  };

  const showToast = (msg: string) => {
    setCompareToast(msg);
    setTimeout(() => setCompareToast(null), 3500);
  };

  const handleToggleCompare = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (selectedCompareIds.includes(projectId)) {
      setSelectedCompareIds(prev => prev.filter(id => id !== projectId));
    } else {
      if (selectedCompareIds.length >= 4) {
        showToast('You can compare up to 4 innovations at a time.');
        return;
      }
      setSelectedCompareIds(prev => [...prev, projectId]);
    }
  };

  const handleOpenCompareModal = () => {
    if (selectedCompareIds.length < 2) {
      showToast('Select at least 2 projects to compare.');
      return;
    }
    setIsCompareModalOpen(true);
  };

  const handleRemoveFromCompare = (idToRemove: string) => {
    setSelectedCompareIds(prev => {
      const updated = prev.filter(id => id !== idToRemove);
      if (updated.length < 2 && isCompareModalOpen) {
        setIsCompareModalOpen(false);
      }
      return updated;
    });
  };

  const handleOpenExternal = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 pb-24 relative">

      {/* ── Toast Notification Banner ── */}
      {compareToast && (
        <div 
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg border font-mono text-xs font-semibold flex items-center gap-2 animate-bounce"
          style={{
            background: 'var(--color-ink, #181924)',
            color: '#FFFFFF',
            borderColor: 'var(--color-border, #EAE4D9)'
          }}
        >
          <AlertCircle className="w-4 h-4 text-[#E66F82]" />
          <span>{compareToast}</span>
        </div>
      )}

      {/* ── Page Header: INNOVEXA Innovation Discovery ── */}
      <SlideUp delay={0.05}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="section-label section-label-blue">
              <span>INNOVEXA INNOVATION DISCOVERY</span>
            </div>
            <div className="space-y-1">
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontSize: 'clamp(36px, 5vw, 52px)',
                  color: 'var(--color-ink)',
                  lineHeight: 1.0,
                  letterSpacing: '-0.02em',
                }}
              >
                EXPLORE INNOVATIONS
              </h1>
              <p 
                style={{ 
                  fontFamily: 'var(--font-body)', 
                  fontSize: '15px', 
                  color: 'var(--color-muted)', 
                  maxWidth: '620px', 
                  lineHeight: 1.6 
                }}
              >
                Discover ideas, products and startups created by the INNOVEXA community. Search problem spaces, compare architectures, and provide peer validation.
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div 
            className="p-1 rounded-[12px] flex items-center gap-1 shrink-0 self-start md:self-auto shadow-sm"
            style={{ background: 'var(--color-surface, #FFFFFF)', border: '1px solid var(--color-border, #EAE4D9)' }}
          >
            <button
              onClick={() => setActiveViewMode('innovations')}
              className="px-4 py-2 rounded-[9px] font-mono text-xs font-bold transition-all flex items-center gap-2"
              style={{
                background: activeViewMode === 'innovations' ? 'var(--color-ink, #181924)' : 'transparent',
                color: activeViewMode === 'innovations' ? 'white' : 'var(--color-muted, #8E90A2)',
                boxShadow: activeViewMode === 'innovations' ? '0 2px 6px rgba(24,25,36,0.15)' : 'none'
              }}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>COMMUNITY INNOVATIONS ({publicProjects.length})</span>
            </button>

            <button
              onClick={() => setActiveViewMode('resources')}
              className="px-4 py-2 rounded-[9px] font-mono text-xs font-bold transition-all flex items-center gap-2"
              style={{
                background: activeViewMode === 'resources' ? '#6875E8' : 'transparent',
                color: activeViewMode === 'resources' ? 'white' : 'var(--color-muted, #8E90A2)',
                boxShadow: activeViewMode === 'resources' ? '0 2px 6px rgba(104,117,232,0.25)' : 'none'
              }}
            >
              <Package className="w-3.5 h-3.5" />
              <span>OPEN RESOURCES & TOOLS</span>
            </button>
          </div>
        </div>
      </SlideUp>

      {/* ── View 2: Open Source Developer Resources Hub ── */}
      {activeViewMode === 'resources' ? (
        <SlideUp delay={0.1}>
          <OpenSourceResourceDirectory />
        </SlideUp>
      ) : (
        /* ── View 1: Intelligent Community Innovation Discovery ── */
        <div className="space-y-8">
          
          {/* ── Main Search & AI Discover Input Bar ── */}
          <SlideUp delay={0.08}>
            <div
              className="p-5 lg:p-6 rounded-[20px] shadow-sm space-y-4"
              style={{
                background: 'var(--color-surface, #FFFFFF)',
                border: '1px solid var(--color-border, #EAE4D9)',
              }}
            >
              <form 
                onSubmit={e => {
                  e.preventDefault();
                  handleTriggerSearch(searchInput, false);
                }}
                className="flex flex-col sm:flex-row items-center gap-2.5"
              >
                {/* Search input */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
                  <input
                    type="text"
                    placeholder="Search ideas, products, startups, problems, technologies..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="w-full pl-11 pr-10 py-3.5 text-xs sm:text-sm outline-none transition-all rounded-xl font-sans"
                    style={{
                      background: 'var(--color-bg-subtle, #FAF8F5)',
                      border: '1px solid var(--color-border, #EAE4D9)',
                      color: 'var(--color-ink, #181924)',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--color-coral, #E66F82)';
                      e.target.style.background = '#FFFFFF';
                      e.target.style.boxShadow = '0 0 0 3px rgba(230,111,130,0.08)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'var(--color-border, #EAE4D9)';
                      e.target.style.background = 'var(--color-bg-subtle, #FAF8F5)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        if (activeSearchQuery) handleClearSearch();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink font-bold text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-mono text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer"
                  style={{ background: 'var(--color-ink, #181924)' }}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>SEARCH</span>
                </button>

                {/* AI Discover Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (searchInput.trim()) {
                      handleTriggerSearch(searchInput, true);
                    } else {
                      handleTriggerSearch('AI emerging technology', true);
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-mono text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 hover:opacity-90 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #6875E8 0%, #5563D6 100%)' }}
                  title="Run natural language query understanding and discover aligned database projects"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E8B653]" />
                  <span>AI DISCOVER</span>
                </button>
              </form>

              {/* Example Searches Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
                <span className="font-mono text-[10px] font-bold text-muted uppercase shrink-0">
                  EXAMPLE SEARCHES:
                </span>
                {EXAMPLE_SEARCH_PILLS.map(pill => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => {
                      setSearchInput(pill);
                      handleTriggerSearch(pill, false);
                    }}
                    className={`px-3 py-1 rounded-lg font-mono text-[10px] transition-all shrink-0 border flex items-center gap-1.5 ${
                      activeSearchQuery.toLowerCase() === pill.toLowerCase()
                        ? 'bg-[#181924] text-white border-[#181924]'
                        : 'bg-[#FAF8F5] text-ink border-neutral-200 hover:border-[#6875E8] hover:bg-white'
                    }`}
                  >
                    <Lightbulb className="w-3 h-3 text-[#E8B653]" />
                    <span>{pill}</span>
                  </button>
                ))}
              </div>
            </div>
          </SlideUp>

          {/* ── AI Discovery Transparent Explanation Panel (When Active) ── */}
          {activeSearchQuery && queryAnalysis && (
            <SlideUp delay={0.1}>
              <div
                className="p-5 sm:p-6 rounded-[20px] border shadow-sm space-y-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(104,117,232,0.06) 0%, rgba(230,111,130,0.06) 100%)',
                  borderColor: 'rgba(104,117,232,0.25)'
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/70 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-[#6875E8]/20 text-[#6875E8] border border-[#6875E8]/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#E8B653]" />
                        <span>AI SEARCH UNDERSTANDING</span>
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-muted">
                        You searched for: <strong className="text-ink">"{activeSearchQuery}"</strong>
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-xl text-ink">
                      {filteredSearchResults.length} Relevant Innovation{filteredSearchResults.length !== 1 ? 's' : ''} Found
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => routerNavigate(`/insights?q=${encodeURIComponent(activeSearchQuery)}`)}
                      className="px-4 py-2 rounded-xl bg-[#181924] hover:bg-[#6875E8] text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3 h-3 text-[#E8B653]" />
                      <span>LAUNCH AI RESEARCH BLUEPRINT →</span>
                    </button>

                    <button
                      onClick={handleClearSearch}
                      className="px-3 py-2 rounded-xl font-mono text-xs font-bold text-muted hover:text-ink hover:bg-neutral-100 transition-all border border-neutral-200"
                    >
                      Clear Search ×
                    </button>
                  </div>
                </div>

                {/* Transparent Intent Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-white border border-neutral-200/80">
                    <div className="text-[10px] text-muted uppercase font-bold">Domain Focus</div>
                    <div className="text-xs font-semibold text-ink truncate mt-0.5">{queryAnalysis.domain}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-neutral-200/80">
                    <div className="text-[10px] text-muted uppercase font-bold">Target Cohort</div>
                    <div className="text-xs font-semibold text-ink truncate mt-0.5">{queryAnalysis.targetUsers}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-neutral-200/80">
                    <div className="text-[10px] text-muted uppercase font-bold">Detected Tech</div>
                    <div className="text-xs font-semibold text-[#6875E8] truncate mt-0.5">
                      {queryAnalysis.technologies.length > 0 ? queryAnalysis.technologies.join(', ') : 'Open Tech Stack'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-neutral-200/80">
                    <div className="text-[10px] text-muted uppercase font-bold">Relevance Filter</div>
                    <div className="text-xs font-semibold text-emerald-700 mt-0.5">Multi-Field Weighted Scoring</div>
                  </div>
                </div>
              </div>
            </SlideUp>
          )}

          {/* ── Quick Filter Bar & Sort Controls ── */}
          <SlideUp delay={0.12}>
            <div
              className="p-4 sm:p-5 rounded-[16px] space-y-4"
              style={{
                background: 'var(--color-surface, #FFFFFF)',
                border: '1px solid var(--color-border, #EAE4D9)',
              }}
            >
              {/* Top Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Project Type Tabs */}
                <div
                  className="flex items-center gap-0.5 p-1 shrink-0 rounded-xl"
                  style={{
                    background: 'var(--color-bg-subtle, #FAF8F5)',
                    border: '1px solid var(--color-border, #EAE4D9)',
                  }}
                >
                  {typeOptions.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedType(t.id); setCurrentPage(1); }}
                      className="px-3 py-1.5 font-mono text-xs transition-all rounded-[8px]"
                      style={{
                        background: selectedType === t.id ? 'var(--color-surface, #FFFFFF)' : 'transparent',
                        color: selectedType === t.id ? 'var(--color-ink, #181924)' : 'var(--color-muted, #8E90A2)',
                        fontWeight: selectedType === t.id ? 700 : 400,
                        boxShadow: selectedType === t.id ? '0 1px 3px rgba(32,32,42,0.08)' : 'none',
                        fontSize: '11px',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Status Filter & Sort Dropdown */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Status filter */}
                  <select
                    value={selectedStatus}
                    onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                    className="font-mono text-xs outline-none cursor-pointer px-3 py-2 rounded-xl"
                    style={{
                      background: 'var(--color-bg-subtle, #FAF8F5)',
                      color: 'var(--color-ink, #181924)',
                      border: '1px solid var(--color-border, #EAE4D9)',
                      fontSize: '11px',
                    }}
                  >
                    <option value="All">ALL STATUSES</option>
                    <option value="published">PUBLISHED ONLY</option>
                    <option value="validation">UNDER VALIDATION</option>
                    <option value="ready">READY TO LAUNCH</option>
                  </select>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
                    <select
                      value={sortBy}
                      onChange={e => { setSortBy(e.target.value as any); setCurrentPage(1); }}
                      className="font-mono text-xs outline-none cursor-pointer px-3 py-2 rounded-xl"
                      style={{
                        background: 'var(--color-bg-subtle, #FAF8F5)',
                        color: 'var(--color-ink, #181924)',
                        border: '1px solid var(--color-border, #EAE4D9)',
                        fontSize: '11px',
                      }}
                    >
                      {activeSearchQuery && <option value="relevant">SORT: MOST RELEVANT</option>}
                      <option value="trending">SORT: 🔥 TRENDING</option>
                      <option value="newest">SORT: 🆕 NEWEST</option>
                      <option value="reviews">SORT: 💬 MOST REVIEWED</option>
                      <option value="upvotes">SORT: 👍 MOST UPVOTED</option>
                      <option value="readiness">SORT: 🎯 READINESS SCORE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic Category Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-neutral-100">
                <span className="font-mono text-[10px] font-bold text-muted uppercase shrink-0">
                  CATEGORY:
                </span>
                {dynamicCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                    className="font-mono whitespace-nowrap transition-all shrink-0 text-[10px] px-3 py-1 rounded-lg uppercase tracking-wider"
                    style={{
                      background: selectedCategory === cat ? 'var(--color-ink, #181924)' : 'transparent',
                      color: selectedCategory === cat ? 'white' : 'var(--color-muted, #8E90A2)',
                      border: selectedCategory === cat
                        ? '1px solid var(--color-ink, #181924)'
                        : '1px solid var(--color-border, #EAE4D9)',
                      fontWeight: selectedCategory === cat ? 700 : 500
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </SlideUp>

          {/* ════════════════════════════════════════════════════════════════
              MODE A: SEARCH RESULTS LISTING (When Search Query Is Active)
             ════════════════════════════════════════════════════════════════ */}
          {activeSearchQuery ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted">
                  Showing {filteredSearchResults.length} match{filteredSearchResults.length !== 1 ? 'es' : ''} for "{activeSearchQuery}"
                  {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                  {selectedType !== 'All' && ` (${selectedType}s)`}
                </span>

                <button
                  onClick={handleClearSearch}
                  className="font-mono text-xs text-[#E66F82] hover:underline"
                >
                  Reset all filters ×
                </button>
              </div>

              {filteredSearchResults.length === 0 ? (
                /* No Closely Related Innovations Found State */
                <div
                  className="p-12 sm:p-16 text-center rounded-[20px] space-y-4 max-w-2xl mx-auto"
                  style={{ background: 'var(--color-surface, #FFFFFF)', border: '1px dashed var(--color-border, #EAE4D9)' }}
                >
                  <div className="w-14 h-14 rounded-full bg-neutral-100 text-muted flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="font-display font-semibold text-2xl text-ink">
                      No Closely Related Innovations Found.
                    </h3>
                    <p className="text-xs text-muted font-sans max-w-md mx-auto leading-relaxed">
                      We searched project titles, problem statements, solutions, categories, tags, and technologies for "{activeSearchQuery}", but found no direct matches.
                    </p>
                  </div>

                  {/* Suggestion keywords */}
                  <div className="pt-2 space-y-2">
                    <span className="font-mono text-[10px] font-bold text-muted uppercase block">
                      Try a broader search:
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {['AI', 'Education', 'Healthcare', 'Cybersecurity', 'Agriculture', 'Sustainability'].map(s => (
                        <button
                          key={s}
                          onClick={() => {
                            setSearchInput(s);
                            handleTriggerSearch(s, false);
                          }}
                          className="px-3 py-1 rounded-lg bg-[#FAF8F5] hover:bg-neutral-100 border border-neutral-200 font-mono text-xs font-semibold text-ink"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-center gap-3">
                    <button onClick={handleClearSearch} className="btn-secondary text-xs">
                      CLEAR SEARCH
                    </button>
                    <button onClick={() => onNavigate('create')} className="btn-primary text-xs">
                      CREATE THIS INNOVATION →
                    </button>
                  </div>
                </div>
              ) : (
                /* Results Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProjects.map((project, idx) => {
                    const rankedInfo = filteredSearchResults.find(r => r.project.id === project.id);
                    return (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        relevanceInfo={rankedInfo}
                        isSelectedForCompare={selectedCompareIds.includes(project.id)}
                        onToggleCompare={e => handleToggleCompare(e, project.id)}
                        onOpenDetails={() => onNavigate('project-detail', project.id)}
                        onOpenFeedback={() => routerNavigate(`/projects/${project.id}/review`)}
                        onOpenResources={e => {
                          e.stopPropagation();
                          setSelectedResourceProject(project);
                          setIsResourceModalOpen(true);
                        }}
                        onOpenExternal={handleOpenExternal}
                        delay={0.04 * (idx % 6)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ════════════════════════════════════════════════════════════════
                MODE B: CURATED DISCOVERY WORKSPACE (When Not Searching)
               ════════════════════════════════════════════════════════════════ */
            <div className="space-y-12">
              
              {/* 1. Recommended for You (Personalized if user logged in with interests) */}
              {recommendedProjects.length > 0 && (
                <DiscoverySection
                  title="🎯 Recommended for You"
                  subtitle={`Curated based on your interests: ${(user?.interests || []).join(', ')}`}
                  badge="PERSONALIZED"
                  projects={recommendedProjects}
                  selectedCompareIds={selectedCompareIds}
                  onToggleCompare={handleToggleCompare}
                  onNavigate={onNavigate}
                  onOpenFeedback={id => routerNavigate(`/projects/${id}/review`)}
                  onOpenResources={p => { setSelectedResourceProject(p); setIsResourceModalOpen(true); }}
                  onOpenExternal={handleOpenExternal}
                />
              )}

              {/* 2. Recently Viewed by User */}
              {recentlyViewedProjects.length > 0 && (
                <DiscoverySection
                  title="🕒 Recently Viewed"
                  subtitle="Innovations you recently explored in this session"
                  badge="HISTORY"
                  projects={recentlyViewedProjects}
                  selectedCompareIds={selectedCompareIds}
                  onToggleCompare={handleToggleCompare}
                  onNavigate={onNavigate}
                  onOpenFeedback={id => routerNavigate(`/projects/${id}/review`)}
                  onOpenResources={p => { setSelectedResourceProject(p); setIsResourceModalOpen(true); }}
                  onOpenExternal={handleOpenExternal}
                />
              )}

              {/* 3. 🔥 Trending Innovations */}
              <DiscoverySection
                title="🔥 Trending Innovations"
                subtitle="Projects gaining high community traction, upvotes, and validation readiness"
                badge="HIGH TRACTION"
                projects={trendingProjects}
                selectedCompareIds={selectedCompareIds}
                onToggleCompare={handleToggleCompare}
                onNavigate={onNavigate}
                onOpenFeedback={id => routerNavigate(`/projects/${id}/review`)}
                onOpenResources={p => { setSelectedResourceProject(p); setIsResourceModalOpen(true); }}
                onOpenExternal={handleOpenExternal}
              />

              {/* 4. 🆕 Recently Added Innovations */}
              <DiscoverySection
                title="🆕 Recently Added"
                subtitle="Fresh ideas and prototypes published by innovators across the globe"
                badge="LATEST SUBMISSIONS"
                projects={recentlyAddedProjects}
                selectedCompareIds={selectedCompareIds}
                onToggleCompare={handleToggleCompare}
                onNavigate={onNavigate}
                onOpenFeedback={id => routerNavigate(`/projects/${id}/review`)}
                onOpenResources={p => { setSelectedResourceProject(p); setIsResourceModalOpen(true); }}
                onOpenExternal={handleOpenExternal}
              />

              {/* 5. ⭐ Highly Engaged & Validated */}
              <DiscoverySection
                title="⭐ Highly Engaged & Validated"
                subtitle="Innovations with deep peer feedback, constructive perspectives, and high signal clarity"
                badge="PEER REVIEWED"
                projects={highlyEngagedProjects}
                selectedCompareIds={selectedCompareIds}
                onToggleCompare={handleToggleCompare}
                onNavigate={onNavigate}
                onOpenFeedback={id => routerNavigate(`/projects/${id}/review`)}
                onOpenResources={p => { setSelectedResourceProject(p); setIsResourceModalOpen(true); }}
                onOpenExternal={handleOpenExternal}
              />

              {/* 6. 🧠 AI & Emerging Technology */}
              {emergingTechProjects.length > 0 && (
                <DiscoverySection
                  title="🧠 AI & Emerging Technology"
                  subtitle="Cutting-edge machine learning, computer vision, and autonomous workflows"
                  badge="EMERGING TECH"
                  projects={emergingTechProjects}
                  selectedCompareIds={selectedCompareIds}
                  onToggleCompare={handleToggleCompare}
                  onNavigate={onNavigate}
                  onOpenFeedback={id => routerNavigate(`/projects/${id}/review`)}
                  onOpenResources={p => { setSelectedResourceProject(p); setIsResourceModalOpen(true); }}
                  onOpenExternal={handleOpenExternal}
                />
              )}

              {/* 7. 🎓 Student & Education Innovations */}
              {studentInnovations.length > 0 && (
                <DiscoverySection
                  title="🎓 Student & Education Innovations"
                  subtitle="Ideas focused on learning acceleration, campus workflows, and student career prep"
                  badge="EDUCATION"
                  projects={studentInnovations}
                  selectedCompareIds={selectedCompareIds}
                  onToggleCompare={handleToggleCompare}
                  onNavigate={onNavigate}
                  onOpenFeedback={id => routerNavigate(`/projects/${id}/review`)}
                  onOpenResources={p => { setSelectedResourceProject(p); setIsResourceModalOpen(true); }}
                  onOpenExternal={handleOpenExternal}
                />
              )}

              {/* 8. Full Community Innovations Catalog Grid */}
              <div className="space-y-6 pt-6 border-t border-neutral-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-2xl text-ink">
                      All Community Innovations ({generalFilteredProjects.length})
                    </h3>
                    <p className="text-xs text-muted font-sans">
                      Browse all published projects, filter by domain, or compare architectures.
                    </p>
                  </div>

                  <span className="font-mono text-xs text-muted">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <div key={n} className="h-96 rounded-2xl bg-white animate-pulse border border-neutral-200" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProjects.map((project, idx) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        isSelectedForCompare={selectedCompareIds.includes(project.id)}
                        onToggleCompare={e => handleToggleCompare(e, project.id)}
                        onOpenDetails={() => onNavigate('project-detail', project.id)}
                        onOpenFeedback={() => routerNavigate(`/projects/${project.id}/review`)}
                        onOpenResources={e => {
                          e.stopPropagation();
                          setSelectedResourceProject(project);
                          setIsResourceModalOpen(true);
                        }}
                        onOpenExternal={handleOpenExternal}
                        delay={0.03 * (idx % 6)}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-200">
              <div className="font-mono text-xs text-muted">
                Showing {displayProjects.length} total innovation{displayProjects.length !== 1 ? 's' : ''}
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(p => Math.max(p - 1, 1)); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  className="font-mono font-semibold text-xs transition-all disabled:opacity-40 px-3.5 py-2 rounded-lg bg-white text-ink border border-neutral-200 hover:border-neutral-300"
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => { setCurrentPage(n); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                    className="font-mono font-bold transition-all w-8 h-8 rounded-lg text-xs"
                    style={{
                      background: currentPage === n ? 'var(--color-ink, #181924)' : 'var(--color-surface, #FFFFFF)',
                      color: currentPage === n ? 'white' : 'var(--color-muted, #8E90A2)',
                      border: `1px solid ${currentPage === n ? 'var(--color-ink, #181924)' : 'var(--color-border, #EAE4D9)'}`,
                    }}
                  >
                    {n}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(p => Math.min(p + 1, totalPages)); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  className="font-mono font-semibold text-xs transition-all disabled:opacity-40 px-3.5 py-2 rounded-lg bg-white text-ink border border-neutral-200 hover:border-neutral-300"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── Fixed Floating Comparison Tray (Appears when >= 1 project is selected) ── */}
      {selectedCompareIds.length > 0 && (
        <div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-slideUp backdrop-blur-md"
          style={{
            background: 'var(--color-ink, #181924)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.35)'
          }}
        >
          <div className="space-y-1.5 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#E66F82]" />
              <span className="font-mono text-xs font-bold text-white">
                COMPARE INNOVATIONS ({selectedCompareIds.length}/4)
              </span>
              <span className="font-mono text-[10px] text-white/60">
                (Min: 2, Max: 4)
              </span>
            </div>

            {/* Selected Project Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedCompareIds.map(id => {
                const proj = publicProjects.find(p => p.id === id);
                return (
                  <span 
                    key={id}
                    className="font-mono text-[10px] px-2.5 py-1 rounded-md bg-white/10 text-white/90 border border-white/15 flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="truncate max-w-[120px] font-semibold">{proj?.title || id}</span>
                    <button
                      onClick={() => handleRemoveFromCompare(id)}
                      className="text-white/60 hover:text-white font-bold ml-1"
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedCompareIds([])}
              className="px-3 py-2 rounded-xl font-mono text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              Clear
            </button>

            <button
              onClick={handleOpenCompareModal}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                selectedCompareIds.length >= 2 
                  ? 'bg-[#E66F82] hover:bg-[#d65e71] text-white cursor-pointer shadow-red-900/40'
                  : 'bg-white/20 text-white/60 cursor-not-allowed'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>COMPARE NOW</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Quick Resource Hub Modal ── */}
      <ProjectResourceModal
        project={selectedResourceProject}
        isOpen={isResourceModalOpen}
        onClose={() => {
          setIsResourceModalOpen(false);
          setSelectedResourceProject(null);
        }}
        onNavigateToProject={id => onNavigate('project-detail', id)}
        onNavigateToRoadmap={id => onNavigate('roadmap', id)}
      />

      {/* ── Multi-Project Side-by-Side Comparison Modal ── */}
      <ProjectComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        projectIds={selectedCompareIds}
        onRemoveProject={handleRemoveFromCompare}
        onNavigateToProject={id => {
          setIsCompareModalOpen(false);
          onNavigate('project-detail', id);
        }}
        contextProjects={projects}
        contextReviews={reviews}
      />

    </div>
  );
};

// ====================================================
// DISCOVERY SECTION COMPONENT
// ====================================================
interface DiscoverySectionProps {
  title: string;
  subtitle: string;
  badge: string;
  projects: Project[];
  selectedCompareIds: string[];
  onToggleCompare: (e: React.MouseEvent, id: string) => void;
  onNavigate: (view: string, id?: string) => void;
  onOpenFeedback: (id: string) => void;
  onOpenResources: (p: Project) => void;
  onOpenExternal: (e: React.MouseEvent, url: string) => void;
}

const DiscoverySection: React.FC<DiscoverySectionProps> = ({
  title,
  subtitle,
  badge,
  projects,
  selectedCompareIds,
  onToggleCompare,
  onNavigate,
  onOpenFeedback,
  onOpenResources,
  onOpenExternal
}) => {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-2xl text-ink">
              {title}
            </h3>
            <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-neutral-200 text-neutral-700 uppercase">
              {badge}
            </span>
          </div>
          <p className="text-xs text-muted font-sans">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, idx) => (
          <ProjectCard
            key={project.id}
            project={project}
            isSelectedForCompare={selectedCompareIds.includes(project.id)}
            onToggleCompare={e => onToggleCompare(e, project.id)}
            onOpenDetails={() => onNavigate('project-detail', project.id)}
            onOpenFeedback={() => onOpenFeedback(project.id)}
            onOpenResources={e => {
              e.stopPropagation();
              onOpenResources(project);
            }}
            onOpenExternal={onOpenExternal}
            delay={0.03 * idx}
          />
        ))}
      </div>
    </div>
  );
};

// ====================================================
// REDESIGNED PROJECT CARD COMPONENT
// ====================================================
interface ProjectCardProps {
  project: Project;
  relevanceInfo?: RankedProjectResult;
  isSelectedForCompare: boolean;
  onToggleCompare: (e: React.MouseEvent) => void;
  onOpenDetails: () => void;
  onOpenFeedback: () => void;
  onOpenResources: (e: React.MouseEvent) => void;
  onOpenExternal: (e: React.MouseEvent, url: string) => void;
  delay?: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  relevanceInfo,
  isSelectedForCompare,
  onToggleCompare,
  onOpenDetails,
  onOpenFeedback,
  onOpenResources,
  onOpenExternal,
  delay = 0.05
}) => {
  return (
    <SlideUp delay={delay}>
      <div
        onClick={onOpenDetails}
        className={`flex flex-col rounded-[16px] overflow-hidden transition-all h-full cursor-pointer group select-none relative shadow-sm ${
          isSelectedForCompare ? 'ring-2 ring-[#E66F82] shadow-md' : 'hover:border-[#E66F82] hover:-translate-y-1 hover:shadow-lg'
        }`}
        style={{
          background: 'var(--color-surface, #FFFFFF)',
          border: isSelectedForCompare ? '1px solid #E66F82' : '1px solid var(--color-border, #EAE4D9)',
        }}
      >
        {/* Selected Banner */}
        {isSelectedForCompare && (
          <div 
            className="px-3 py-1 font-mono text-[10px] font-bold text-white flex items-center justify-between z-10"
            style={{ background: '#E66F82' }}
          >
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Selected for comparison</span>
            </span>
            <button
              onClick={onToggleCompare}
              className="text-white hover:text-white/80 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Relevance Rating Pill (When searching) */}
        {relevanceInfo && (
          <div 
            className={`px-3 py-1 font-mono text-[10px] font-bold flex items-center justify-between border-b ${
              relevanceInfo.matchGroup === 'very_relevant'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : relevanceInfo.matchGroup === 'related'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span className="uppercase">
                {relevanceInfo.matchGroup === 'very_relevant' 
                  ? 'Highly Related' 
                  : relevanceInfo.matchGroup === 'related' 
                  ? 'Related' 
                  : 'Possibly Related'}
              </span>
            </div>
            <span className="font-semibold text-[9px]">
              {relevanceInfo.relevanceScore}% Match
            </span>
          </div>
        )}

        {/* Cover Visual */}
        <div className="relative h-44 overflow-hidden bg-[#FAF8F5]">
          <img
            src={project.cover_image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181924]/85 via-[#181924]/20 to-transparent" />

          {/* Badges overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <TypeBadge type={project.project_type} />
            <CategoryBadge category={project.category} />
          </div>

          {/* Quick Launch Buttons (Live / GitHub) */}
          <div className="absolute top-11 right-3 flex flex-col gap-1.5 items-end">
            {project.live_url && (
              <button
                onClick={e => onOpenExternal(e, project.live_url!)}
                title="Open Live App"
                className="px-2 py-1 rounded-md bg-emerald-600/90 hover:bg-emerald-600 text-white font-mono text-[9px] font-bold flex items-center gap-1 shadow-md backdrop-blur-sm transition-all"
              >
                <Globe className="w-3 h-3" />
                <span>Live ↗</span>
              </button>
            )}
            {project.github_url && (
              <button
                onClick={e => onOpenExternal(e, project.github_url!)}
                title="Open GitHub Code"
                className="px-2 py-1 rounded-md bg-black/85 hover:bg-black text-white font-mono text-[9px] font-bold flex items-center gap-1 shadow-md backdrop-blur-sm transition-all"
              >
                <GitBranch className="w-3 h-3" />
                <span>Repo ↗</span>
              </button>
            )}
          </div>

          {/* Creator & Title overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="font-mono text-[10px] text-white/80 uppercase mb-0.5 flex items-center gap-1.5">
              <span>by {project.owner_name || 'Innovator'}</span>
            </div>
            <h3 
              className="text-white font-display font-semibold text-2xl leading-tight line-clamp-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {project.title}
            </h3>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex-1 p-4 sm:p-5 space-y-3.5">
          
          {/* Problem statement snippet */}
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold text-muted uppercase block">
              Problem Statement:
            </span>
            <p className="text-xs text-ink/90 font-medium line-clamp-2 leading-relaxed">
              {project.problem_title || project.problem_description}
            </p>
          </div>

          {/* Solution description snippet */}
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold text-[#6875E8] uppercase block">
              Proposed Solution:
            </span>
            <p className="text-xs text-muted line-clamp-2 leading-relaxed font-sans">
              {project.solution_description || project.value_proposition}
            </p>
          </div>

          {/* Why Related Reasons (when searching) */}
          {relevanceInfo && relevanceInfo.whyRelated.length > 0 && (
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-neutral-200 font-mono text-[10px] text-muted space-y-0.5">
              {relevanceInfo.whyRelated.slice(0, 2).map((reason, ri) => (
                <div key={ri} className="flex items-center gap-1 text-ink/80 truncate">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {project.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="font-mono text-[9px] px-2 py-0.5 rounded-md bg-[#FAF8F5] text-muted border border-neutral-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer: Metrics & Actions */}
        <div
          className="p-3.5 sm:p-4 pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 bg-[#FAF8F5]/50"
        >
          {/* Readiness & Reviews */}
          <div>
            <div className="font-mono font-bold text-xs text-emerald-700 flex items-center gap-1">
              <span>{project.readiness_score || 50}% READINESS</span>
            </div>
            <div className="font-mono text-[10px] text-muted flex items-center gap-1 mt-0.5">
              <MessageSquare className="w-3 h-3" />
              <span>{project.reviews_count || 0} reviews</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Compare Button */}
            <button
              onClick={onToggleCompare}
              title={isSelectedForCompare ? "Remove from comparison" : "Add to side-by-side comparison tray"}
              className={`font-mono font-bold transition-all flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg border ${
                isSelectedForCompare 
                  ? 'bg-[#E66F82] text-white border-[#E66F82] shadow-sm' 
                  : 'bg-white text-ink border-neutral-300 hover:border-[#E66F82] hover:text-[#E66F82]'
              }`}
            >
              <Scale className="w-3 h-3" />
              <span>{isSelectedForCompare ? 'SELECTED' : 'COMPARE'}</span>
            </button>

            {/* Voting Component */}
            <div onClick={e => e.stopPropagation()}>
              <ProjectVoteButtons projectId={project.id} size="sm" />
            </div>

            {/* Give Feedback Button */}
            <button
              onClick={e => {
                e.stopPropagation();
                onOpenFeedback();
              }}
              title="Give peer feedback for this innovation"
              className="font-mono font-bold text-white transition-all flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg shadow-sm"
              style={{ background: '#4FA89B' }}
            >
              <Sparkles className="w-3 h-3" />
              <span>FEEDBACK</span>
            </button>

            {/* View Project Button */}
            <button
              onClick={e => {
                e.stopPropagation();
                onOpenDetails();
              }}
              className="font-mono font-bold transition-all flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg bg-white text-ink border border-neutral-300 hover:border-ink"
            >
              <span>VIEW</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </SlideUp>
  );
};
