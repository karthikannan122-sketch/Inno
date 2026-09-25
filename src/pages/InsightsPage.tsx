import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Lightbulb, 
  Target, 
  Cpu, 
  Bookmark, 
  ExternalLink, 
  History, 
  ChevronRight, 
  Filter, 
  ShieldCheck, 
  Flame, 
  X, 
  Clock, 
  Share2, 
  Check, 
  TrendingUp, 
  AlertCircle,
  Database,
  Code2,
  GitBranch,
  BookOpen,
  Boxes,
  Zap,
  CheckSquare,
  Workflow,
  PlusCircle,
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';
import { Badge, CategoryBadge, TypeBadge } from '../components/common/Badge';
import { 
  executeAIResearch, 
  DetailedAIResearchReport, 
  getRecentSearches, 
  getSavedResearch, 
  toggleSaveResearch, 
  isResearchSaved, 
  isValidHttpUrl 
} from '../services/aiResearchService';

interface InsightsPageProps {
  onNavigate?: (view: string, id?: string) => void;
}

const EXAMPLE_QUERIES = [
  'AI based crop disease detection',
  'Smart waste management',
  'AI interview preparation platform',
  'Blockchain supply chain tracking',
  'Student mental health platform',
  'Healthcare appointment optimization'
];

export const InsightsPage: React.FC<InsightsPageProps> = ({ onNavigate: propOnNavigate }) => {
  const routerNavigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { projects } = useProjects();

  const onNavigate = propOnNavigate || ((view: string, id?: string) => {
    if (id) routerNavigate(`/projects/${id}`);
    else routerNavigate(`/${view}`);
  });

  const [searchInput, setSearchInput] = useState<string>('');
  const [activeReport, setActiveReport] = useState<DetailedAIResearchReport | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Researching your idea...');
  const [searchError, setSearchError] = useState<string | null>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedReports, setSavedReports] = useState<DetailedAIResearchReport[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'solutions' | 'architecture' | 'implementation' | 'sources' | 'saved'>('overview');

  // Load history & bookmarks on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
    setSavedReports(getSavedResearch());
  }, []);

  // Handle URL query parameters (?q=... or ?query=...)
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('query') || searchParams.get('search');
    if (q && q.trim() && q.trim() !== activeReport?.query) {
      setSearchInput(q.trim());
      handleSearch(q.trim(), false);
    }
  }, [searchParams]);

  // Update saved status when activeReport changes
  useEffect(() => {
    if (activeReport) {
      setIsSaved(isResearchSaved(activeReport.query));
    }
  }, [activeReport]);

  const handleSearch = async (queryToSearch: string, updateUrl = true) => {
    const trimmed = queryToSearch.trim();
    if (!trimmed) return;

    setSearchInput(trimmed);
    if (updateUrl) {
      setSearchParams({ q: trimmed });
    }
    setIsSearching(true);
    setSearchError(null);
    setActiveTab('overview');

    // Progressive loading steps for smooth UX
    setLoadingStep('Understanding query & problem domain...');
    const t1 = setTimeout(() => setLoadingStep('Extracting real-world web research & citations...'), 400);
    const t2 = setTimeout(() => setLoadingStep('Searching related INNOVEXA database projects...'), 800);
    const t3 = setTimeout(() => setLoadingStep('Synthesizing technology stack & architecture...'), 1200);
    const t4 = setTimeout(() => setLoadingStep('Generating step-by-step implementation plan...'), 1600);

    try {
      const report = await executeAIResearch(trimmed, projects);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);

      setActiveReport(report);
      setRecentSearches(getRecentSearches());
    } catch (err: any) {
      console.error('Research execution error:', err);
      setSearchError('AI Research is temporarily unavailable. Please try again or refine your query.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleSave = () => {
    if (!activeReport) return;
    const nowSaved = toggleSaveResearch(activeReport);
    setIsSaved(nowSaved);
    setSavedReports(getSavedResearch());
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleStartBuildingProject = () => {
    if (activeReport) {
      // Store in session storage so CreateProjectPage can prefill fields
      sessionStorage.setItem('innovexa_create_prefill', JSON.stringify({
        title: activeReport.concept.title,
        problem_title: activeReport.concept.problem_addressed.slice(0, 80),
        problem_description: activeReport.concept.problem_addressed,
        solution_description: activeReport.proposed_solution.description,
        target_audience: activeReport.concept.target_users,
        value_proposition: activeReport.proposed_solution.core_utility,
        differentiation: activeReport.improvement_opportunities[0] || 'Domain-tailored workflow with real-time peer validation.'
      }));
    }
    onNavigate('create');
  };

  return (
    <div className="space-y-8 pb-20">

      {/* ── Page Header ── */}
      <SlideUp delay={0.05}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="section-label section-label-purple">
              <span>AI INNOVATION RESEARCH & PROJECT LAB</span>
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
                RESEARCH
              </h1>
              <div
                className="editorial-italic"
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  fontSize: 'clamp(26px, 3.5vw, 40px)',
                  color: '#6875E8',
                  lineHeight: 1.1,
                }}
              >
                FROM IDEA TO IMPLEMENTATION.
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-muted)', maxWidth: '640px', lineHeight: 1.6 }}>
              Research real-world solutions, extract verified external sources, discover related community projects, and build a practical implementation plan.
            </p>
          </div>

          {/* Action Hub (Saved Reports count) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'saved' ? 'overview' : 'saved')}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 border ${
                activeTab === 'saved' 
                  ? 'bg-[#181924] text-white border-[#181924] shadow-md' 
                  : 'bg-white text-ink border-neutral-300 hover:border-[#6875E8]'
              }`}
            >
              <Bookmark className="w-4 h-4 text-[#E8B653]" />
              <span>SAVED RESEARCH ({savedReports.length})</span>
            </button>
          </div>
        </div>
      </SlideUp>

      {/* ── Search Bar & Filter Section ── */}
      <SlideUp delay={0.1}>
        <div 
          className="p-6 rounded-[20px] shadow-sm space-y-4"
          style={{
            background: 'var(--color-surface, #FFFFFF)',
            border: '1px solid var(--color-border, #EAE4D9)'
          }}
        >
          <form 
            onSubmit={e => {
              e.preventDefault();
              handleSearch(searchInput);
            }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="What do you want to build? (e.g., AI crop disease detection, Smart waste management...)"
                className="w-full pl-12 pr-4 py-3.5 text-sm outline-none transition-all rounded-xl font-sans"
                style={{
                  background: 'var(--color-bg-subtle, #FAF8F5)',
                  border: '1px solid var(--color-border, #EAE4D9)',
                  color: 'var(--color-ink, #181924)'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#6875E8';
                  e.target.style.background = '#FFFFFF';
                  e.target.style.boxShadow = '0 0 0 3px rgba(104,117,232,0.12)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--color-border, #EAE4D9)';
                  e.target.style.background = 'var(--color-bg-subtle, #FAF8F5)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSearching || !searchInput.trim()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-mono text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-md"
              style={{
                background: 'linear-gradient(135deg, #181924 0%, #25283B 100%)'
              }}
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#6875E8]" />
                  <span>RESEARCHING...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E8B653]" />
                  <span>RESEARCH INNOVATION</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Example Queries Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
            <span className="font-mono text-[10px] font-bold text-muted shrink-0 uppercase">
              SUGGESTED TOPICS:
            </span>
            {EXAMPLE_QUERIES.map(q => (
              <button
                key={q}
                type="button"
                onClick={() => handleSearch(q)}
                className="px-3 py-1.5 rounded-lg font-mono text-[10px] transition-all shrink-0 bg-[#FAF8F5] text-ink border border-neutral-200 hover:border-[#6875E8] hover:bg-white flex items-center gap-1.5"
              >
                <Lightbulb className="w-3 h-3 text-[#E8B653]" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>
      </SlideUp>

      {/* ── Saved Reports View (if active) ── */}
      {activeTab === 'saved' && (
        <SlideUp delay={0.1}>
          <div className="p-6 rounded-2xl border bg-white space-y-4" style={{ borderColor: 'var(--color-border, #EAE4D9)' }}>
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#E8B653]" />
                <h3 className="font-display font-semibold text-xl text-ink">
                  Your Bookmarked Research Reports ({savedReports.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('overview')}
                className="font-mono text-xs text-muted hover:text-ink"
              >
                Close ×
              </button>
            </div>

            {savedReports.length === 0 ? (
              <div className="py-12 text-center text-muted font-mono text-xs">
                No research reports bookmarked yet. Search an idea and click "Save Report" to bookmark it here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedReports.map(rep => (
                  <div
                    key={rep.query}
                    onClick={() => {
                      setActiveReport(rep);
                      setActiveTab('overview');
                    }}
                    className="p-4 rounded-xl border bg-[#FAF8F5] hover:bg-white hover:border-[#6875E8] transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-[#6875E8] uppercase">
                        SAVED REPORT
                      </span>
                      <span className="font-mono text-[10px] text-muted">
                        {rep.verified_sources.length} sources verified
                      </span>
                    </div>
                    <h4 className="font-display font-semibold text-lg text-ink group-hover:text-[#6875E8]">
                      {rep.concept.title || rep.query}
                    </h4>
                    <p className="text-xs text-muted line-clamp-2">
                      {rep.overview}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SlideUp>
      )}

      {/* ── Active Loading State ── */}
      {isSearching && (
        <SlideUp delay={0.05}>
          <div 
            className="p-12 text-center rounded-2xl border bg-white space-y-4 shadow-sm max-w-xl mx-auto my-8"
            style={{ borderColor: 'var(--color-border, #EAE4D9)' }}
          >
            <div className="w-14 h-14 mx-auto rounded-full border-3 border-[#6875E8] border-t-transparent animate-spin" />
            <div className="space-y-1.5">
              <h3 className="font-display font-semibold text-2xl text-ink">
                {loadingStep}
              </h3>
              <p className="font-mono text-xs text-muted">
                Extracting grounded sources, technical architectures, and INNOVEXA database alignments...
              </p>
            </div>
          </div>
        </SlideUp>
      )}

      {/* ── Search Error State ── */}
      {searchError && (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <p className="text-xs font-mono text-red-800">{searchError}</p>
          <button
            onClick={() => handleSearch(searchInput)}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-mono text-xs font-bold"
          >
            Retry Research
          </button>
        </div>
      )}

      {/* ── ACTIVE RESEARCH REPORT WORKSPACE ── */}
      {!isSearching && activeReport && (
        <div className="space-y-8 animate-fadeIn">

          {/* ── REPORT BANNER & CONTROLS ── */}
          <div 
            className="p-6 sm:p-8 rounded-[24px] text-white shadow-xl space-y-6"
            style={{
              background: 'linear-gradient(135deg, #181924 0%, #222538 50%, #1A1D2E 100%)',
              border: '1px solid #3E4259'
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-[#E8B653]/20 text-[#E8B653] border border-[#E8B653]/30">
                    AI INNOVATION BLUEPRINT
                  </span>
                  {activeReport.hasLiveWebGrounding && (
                    <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>LIVE WEB GROUNDED</span>
                    </span>
                  )}
                </div>
                <h2 className="font-display font-normal text-3xl sm:text-4xl text-white">
                  {activeReport.concept.title}
                </h2>
                <div className="font-mono text-xs text-white/70">
                  Target Domain Query: <span className="text-[#6875E8] font-bold">"{activeReport.query}"</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleToggleSave}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 border ${
                    isSaved 
                      ? 'bg-[#E8B653] text-[#181924] border-[#E8B653] shadow-md' 
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{isSaved ? 'SAVED' : 'SAVE REPORT'}</span>
                </button>

                <button
                  onClick={handleStartBuildingProject}
                  className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-white transition-all flex items-center gap-2 shadow-lg hover:opacity-95 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #E66F82 0%, #D8566C 100%)'
                  }}
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>START BUILDING →</span>
                </button>
              </div>
            </div>

            {/* Executive Overview */}
            <div className="space-y-2">
              <span className="font-mono text-[11px] font-bold text-[#6875E8] uppercase tracking-wider block">
                RESEARCH OVERVIEW & MARKET LANDSCAPE
              </span>
              <p className="text-sm text-white/90 leading-relaxed font-sans max-w-4xl">
                {activeReport.overview}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-white/60 text-[10px] uppercase">External Solutions</div>
                <div className="text-lg font-bold text-white">{activeReport.related_solutions.length} Discovered</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-white/60 text-[10px] uppercase">INNOVEXA Projects</div>
                <div className="text-lg font-bold text-[#6875E8]">{activeReport.related_innovexa_projects.length} Aligned</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-white/60 text-[10px] uppercase">Verified Sources</div>
                <div className="text-lg font-bold text-emerald-400">{activeReport.verified_sources.length} Verified</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-white/60 text-[10px] uppercase">Implementation Plan</div>
                <div className="text-lg font-bold text-[#E8B653]">{activeReport.implementation_phases.length} Phases</div>
              </div>
            </div>
          </div>

          {/* ── SECTION 1 & 2: CONCEPT & PROPOSED SOLUTION ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Concept Card */}
            <div className="p-6 sm:p-7 rounded-[20px] border bg-white space-y-4 shadow-sm" style={{ borderColor: 'var(--color-border, #EAE4D9)' }}>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#E8B653]" />
                <h3 className="font-display font-semibold text-xl text-ink">
                  1. Innovation Concept
                </h3>
              </div>
              
              <div className="space-y-3 text-xs font-sans">
                <div>
                  <span className="font-mono text-[10px] font-bold text-muted uppercase block mb-1">What is the Concept?</span>
                  <p className="text-ink leading-relaxed font-medium bg-[#FAF8F5] p-3 rounded-xl border border-neutral-100">
                    {activeReport.concept.description}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] font-bold text-muted uppercase block mb-1">Problem Being Solved</span>
                  <p className="text-neutral-700 leading-relaxed">
                    {activeReport.concept.problem_addressed}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-neutral-100">
                    <span className="font-mono text-[10px] font-bold text-muted uppercase block">Target Users</span>
                    <p className="text-ink font-semibold mt-0.5">{activeReport.concept.target_users}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-neutral-100">
                    <span className="font-mono text-[10px] font-bold text-muted uppercase block">Why It Matters</span>
                    <p className="text-emerald-700 font-semibold mt-0.5">{activeReport.concept.why_it_matters}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposed Solution Card */}
            <div className="p-6 sm:p-7 rounded-[20px] border bg-white space-y-4 shadow-sm" style={{ borderColor: 'var(--color-border, #EAE4D9)' }}>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#6875E8]" />
                <h3 className="font-display font-semibold text-xl text-ink">
                  2. Proposed Solution & UX
                </h3>
              </div>

              <div className="space-y-3 text-xs font-sans">
                <div>
                  <span className="font-mono text-[10px] font-bold text-muted uppercase block mb-1">How It Solves the Problem</span>
                  <p className="text-ink leading-relaxed font-medium bg-[#FAF8F5] p-3 rounded-xl border border-neutral-100">
                    {activeReport.proposed_solution.description}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] font-bold text-muted uppercase block mb-1">End-to-End User Experience</span>
                  <p className="text-neutral-700 leading-relaxed">
                    {activeReport.proposed_solution.user_experience}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                  <span className="font-mono text-[10px] font-bold text-emerald-800 uppercase block mb-0.5">Core Utility & Actionability</span>
                  <p className="text-emerald-950 font-medium leading-relaxed">
                    {activeReport.proposed_solution.core_utility}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: HOW IT WORKS (VISUAL FLOW PIPELINE) ── */}
          <div className="p-6 sm:p-7 rounded-[20px] border bg-white space-y-6 shadow-sm" style={{ borderColor: 'var(--color-border, #EAE4D9)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-[#E66F82]" />
                <h3 className="font-display font-semibold text-xl text-ink">
                  3. How It Works (Pipeline Diagram)
                </h3>
              </div>
              <span className="font-mono text-xs text-muted">
                {activeReport.how_it_works.length} Execution Stages
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {activeReport.how_it_works.map((step, idx) => (
                <div 
                  key={step.step_number}
                  className="p-4 rounded-xl border bg-[#FAF8F5] flex flex-col justify-between space-y-3 relative group hover:border-[#6875E8] hover:bg-white transition-all shadow-subtle"
                  style={{ borderColor: 'var(--color-border, #EAE4D9)' }}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-[#181924] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                        {step.step_number}
                      </span>
                      <span className="font-mono text-[9px] font-bold text-[#6875E8] uppercase">
                        STEP {idx + 1}
                      </span>
                    </div>

                    <h4 className="font-display font-semibold text-sm text-ink pt-1">
                      {step.stage}
                    </h4>

                    <p className="text-[11px] text-neutral-700 leading-relaxed font-sans">
                      {step.action}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-200/60 font-mono text-[10px] text-muted">
                    <strong className="text-ink/80 block">Spec:</strong>
                    {step.technical_detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION 4: RELATED EXISTING SOLUTIONS (EXTERNAL WEB) ── */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#6875E8] uppercase tracking-wider block">
                  REAL-WORLD MARKET BENCHMARKS
                </span>
                <h3 className="font-display font-semibold text-2xl text-ink">
                  4. Discovered Existing Solutions ({activeReport.related_solutions.length})
                </h3>
              </div>
              <span className="font-mono text-xs text-muted">
                Extracted via web search grounding & verified documentation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeReport.related_solutions.map((sol, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl border bg-white space-y-4 shadow-sm hover:border-[#6875E8] transition-all flex flex-col justify-between"
                  style={{ borderColor: 'var(--color-border, #EAE4D9)' }}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-[#6875E8]/10 text-[#6875E8] border border-[#6875E8]/20">
                        {sol.source_type}
                      </span>
                      <span className="font-mono text-[10px] text-muted">
                        Relevance: {sol.relevance}%
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-semibold text-xl text-ink">
                        {sol.name}
                      </h4>
                      <div className="font-mono text-[11px] text-muted mt-0.5">
                        Domain: <span className="font-bold text-ink">{sol.domain}</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-700 leading-relaxed font-sans">
                      {sol.description}
                    </p>

                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-neutral-100 text-xs font-sans space-y-1">
                      <div>
                        <strong className="font-mono text-[10px] text-muted uppercase block">What It Does:</strong>
                        <span className="text-neutral-800">{sol.what_it_does}</span>
                      </div>
                      <div className="pt-1">
                        <strong className="font-mono text-[10px] text-[#6875E8] uppercase block">Why Related:</strong>
                        <span className="text-neutral-800">{sol.why_related}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-muted truncate max-w-[220px]">
                      {sol.url}
                    </span>

                    {isValidHttpUrl(sol.url) ? (
                      <a
                        href={sol.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#181924] hover:bg-[#6875E8] text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
                      >
                        <span>Open Source</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="font-mono text-[10px] text-muted italic">
                        Source link unavailable
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION 5: RELATED INNOVEXA PROJECTS (DATABASE) ── */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#E66F82] uppercase tracking-wider block">
                  INNOVEXA COMMUNITY ECOSYSTEM
                </span>
                <h3 className="font-display font-semibold text-2xl text-ink">
                  5. Related INNOVEXA Projects ({activeReport.related_innovexa_projects.length})
                </h3>
              </div>
              <span className="font-mono text-xs text-muted">
                Searched across Supabase database specifications
              </span>
            </div>

            {activeReport.related_innovexa_projects.length === 0 ? (
              <div 
                className="p-8 rounded-2xl border text-center space-y-3 bg-[#FAF8F5]"
                style={{ borderColor: 'var(--color-border, #EAE4D9)' }}
              >
                <Boxes className="w-8 h-8 text-[#6875E8] mx-auto" />
                <h4 className="font-display font-semibold text-lg text-ink">
                  No Strongly Related INNOVEXA Projects Found
                </h4>
                <p className="text-xs text-muted font-sans max-w-md mx-auto">
                  Be the pioneer in the community to build and publish this innovation in the {activeReport.concept.title} domain!
                </p>
                <button
                  onClick={handleStartBuildingProject}
                  className="px-4 py-2 rounded-xl bg-[#181924] hover:bg-[#6875E8] text-white font-mono text-xs font-bold transition-all inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>CREATE THIS PROJECT NOW</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeReport.related_innovexa_projects.map(proj => (
                  <div
                    key={proj.id}
                    className="p-5 rounded-2xl border bg-white space-y-3 shadow-sm hover:border-[#E66F82] transition-all flex flex-col justify-between"
                    style={{ borderColor: 'var(--color-border, #EAE4D9)' }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <CategoryBadge category={proj.category} />
                          <TypeBadge type={proj.project_type as any} />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {proj.similarityScore}% Match
                        </span>
                      </div>

                      <h4 
                        onClick={() => onNavigate('project-detail', proj.id)}
                        className="font-display font-semibold text-xl text-ink cursor-pointer hover:text-[#E66F82] transition-colors"
                      >
                        {proj.title}
                      </h4>

                      <p className="text-xs text-neutral-700 line-clamp-2 font-sans">
                        {proj.problem_description || proj.problem_title}
                      </p>

                      {proj.whyRelated.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-[#FAF8F5] font-mono text-[10px] text-muted space-y-0.5">
                          {proj.whyRelated.map((reason, ri) => (
                            <div key={ri} className="flex items-center gap-1 text-ink/80">
                              <span className="text-[#6875E8] font-bold">•</span>
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-muted">
                        ★ {proj.upvotesCount} Upvotes • {proj.readinessScore}% Readiness
                      </span>

                      <button
                        onClick={() => onNavigate('project-detail', proj.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#E66F82] text-ink hover:text-white border border-neutral-200 hover:border-[#E66F82] font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <span>View Project</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── SECTION 6 & 7: SOLUTION COMPARISON MATRIX & DIFFERENTIATION ── */}
          <div className="p-6 sm:p-8 rounded-[24px] border bg-white space-y-6 shadow-sm" style={{ borderColor: 'var(--color-border, #EAE4D9)' }}>
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold text-[#6875E8] uppercase tracking-wider block">
                BENCHMARK COMPARISON
              </span>
              <h3 className="font-display font-semibold text-2xl text-ink">
                6. Solution Comparison Matrix
              </h3>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-neutral-200 font-mono text-[10px] font-bold text-muted">
                    <th className="p-3.5 text-ink">SOLUTION</th>
                    <th className="p-3.5 text-ink">PROBLEM FOCUS</th>
                    <th className="p-3.5 text-ink">TECHNICAL APPROACH</th>
                    <th className="p-3.5 text-ink">TECH STACK</th>
                    <th className="p-3.5 text-ink">TARGET USERS</th>
                    <th className="p-3.5 text-ink">SOURCE LINK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-sans">
                  {activeReport.solution_comparison.map((row, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="p-3.5 font-display font-semibold text-sm text-ink">{row.solution_name}</td>
                      <td className="p-3.5 text-neutral-700">{row.problem_addressed}</td>
                      <td className="p-3.5 text-neutral-700">{row.technical_approach}</td>
                      <td className="p-3.5 font-mono text-[11px] text-[#6875E8]">{row.technology_stack}</td>
                      <td className="p-3.5 text-neutral-700">{row.target_users}</td>
                      <td className="p-3.5 font-mono text-[11px]">
                        {isValidHttpUrl(row.source_url) ? (
                          <a
                            href={row.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#6875E8] font-bold hover:underline flex items-center gap-1"
                          >
                            <span>Visit ↗</span>
                          </a>
                        ) : (
                          <span className="text-muted italic">Verified Profile</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 7. What Makes the Solutions Different? */}
            <div className="pt-4 border-t space-y-4">
              <h4 className="font-display font-semibold text-xl text-ink">
                7. What Makes Existing Solutions Different?
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Common Approaches */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-neutral-200 space-y-2">
                  <span className="font-mono text-[10px] font-bold text-ink uppercase block">Common Technical Approaches</span>
                  <ul className="space-y-1.5 text-xs text-neutral-700 font-sans">
                    {activeReport.comparative_insights.common_approaches.map((point, pi) => (
                      <li key={pi} className="flex items-start gap-2">
                        <span className="text-[#6875E8] font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Differences */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-neutral-200 space-y-2">
                  <span className="font-mono text-[10px] font-bold text-ink uppercase block">Key Operational Differences</span>
                  <ul className="space-y-1.5 text-xs text-neutral-700 font-sans">
                    {activeReport.comparative_insights.key_differences.map((point, pi) => (
                      <li key={pi} className="flex items-start gap-2">
                        <span className="text-[#E66F82] font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Strengths & Limitations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 space-y-2">
                  <span className="font-mono text-[10px] font-bold text-emerald-800 uppercase block">Market Strengths</span>
                  <ul className="space-y-1 text-xs text-emerald-950 font-sans">
                    {activeReport.comparative_insights.strengths.map((s, si) => (
                      <li key={si} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-2">
                  <span className="font-mono text-[10px] font-bold text-amber-800 uppercase block">Current Limitations</span>
                  <ul className="space-y-1 text-xs text-amber-950 font-sans">
                    {activeReport.comparative_insights.limitations.map((l, li) => (
                      <li key={li} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">!</span>
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/60 space-y-2">
                  <span className="font-mono text-[10px] font-bold text-blue-800 uppercase block">Whitespace & Gaps</span>
                  <ul className="space-y-1 text-xs text-blue-950 font-sans">
                    {activeReport.comparative_insights.potential_gaps.map((g, gi) => (
                      <li key={gi} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">★</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 8 & 9: TECHNOLOGY STACK & DATASETS / APIS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 8. Technology Stack */}
            <div className="p-6 sm:p-7 rounded-[20px] border bg-white space-y-4 shadow-sm" style={{ borderColor: 'var(--color-border, #EAE4D9)' }}>
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#6875E8]" />
                <h3 className="font-display font-semibold text-xl text-ink">
                  8. Recommended Technology Stack
                </h3>
              </div>

              <div className="space-y-3">
                {activeReport.technologies.map((tech, ti) => (
                  <div 
                    key={ti}
                    className="p-3.5 rounded-xl bg-[#FAF8F5] border border-neutral-100 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-neutral-200 text-neutral-700 uppercase">
                          {tech.category}
                        </span>
                        <span className="font-display font-semibold text-sm text-ink">{tech.name}</span>
                      </div>
                      <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                        {tech.purpose}
                      </p>
                    </div>

                    {isValidHttpUrl(tech.url) && (
                      <a
                        href={tech.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-white hover:bg-[#6875E8] text-ink hover:text-white border text-[10px] font-mono font-bold transition-all shrink-0 flex items-center gap-1"
                        title="Official Documentation"
                      >
                        <span>Docs</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 9. Datasets / APIs / Tools */}
            <div className="p-6 sm:p-7 rounded-[20px] border bg-white space-y-4 shadow-sm" style={{ borderColor: 'var(--color-border, #EAE4D9)' }}>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display font-semibold text-xl text-ink">
                  9. Verified Datasets, APIs & Tools
                </h3>
              </div>

              <div className="space-y-3">
                {activeReport.resources_and_tools.map((res, ri) => (
                  <div 
                    key={ri}
                    className="p-3.5 rounded-xl bg-[#FAF8F5] border border-neutral-100 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                          {res.resource_type}
                        </span>
                        <span className="font-display font-semibold text-sm text-ink">{res.name}</span>
                      </div>
                      <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                        {res.description}
                      </p>
                    </div>

                    {isValidHttpUrl(res.url) && (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-mono font-bold transition-all shrink-0 flex items-center gap-1"
                        title="Open Resource"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SECTION 10: PROJECT ARCHITECTURE DIAGRAM ── */}
          <div className="p-6 sm:p-8 rounded-[24px] border bg-white space-y-6 shadow-sm" style={{ borderColor: 'var(--color-border, #EAE4D9)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#6875E8]" />
                <h3 className="font-display font-semibold text-2xl text-ink">
                  10. System Architecture Pipeline
                </h3>
              </div>
              <span className="font-mono text-xs text-muted">
                Multi-tier production architecture
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeReport.architecture_pipeline.map((layer, li) => (
                <div 
                  key={li}
                  className="p-4 rounded-xl border bg-[#FAF8F5] space-y-3"
                  style={{ borderColor: 'var(--color-border, #EAE4D9)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#6875E8] uppercase">
                      LAYER 0{li + 1}
                    </span>
                    <Cpu className="w-4 h-4 text-muted" />
                  </div>

                  <h4 className="font-display font-semibold text-base text-ink">
                    {layer.layer}
                  </h4>

                  <div className="flex flex-wrap gap-1.5">
                    {layer.components.map((comp, ci) => (
                      <span key={ci} className="px-2 py-0.5 rounded font-mono text-[10px] bg-white border border-neutral-200 text-neutral-800">
                        {comp}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-muted font-sans pt-1 border-t border-neutral-200/60">
                    {layer.details}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION 11: HOW TO START BUILDING (8-PHASE IMPLEMENTATION ROADMAP) ── */}
          <div className="p-6 sm:p-8 rounded-[24px] border bg-white space-y-6 shadow-sm" style={{ borderColor: 'var(--color-border, #EAE4D9)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display font-semibold text-2xl text-ink">
                  11. Step-by-Step Implementation Roadmap ({activeReport.implementation_phases.length} Phases)
                </h3>
              </div>
              <span className="font-mono text-xs text-emerald-700 font-bold">
                Practical Execution Plan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeReport.implementation_phases.map(phase => (
                <div 
                  key={phase.phase_number}
                  className="p-4 rounded-xl border bg-[#FAF8F5] flex flex-col justify-between space-y-3"
                  style={{ borderColor: 'var(--color-border, #EAE4D9)' }}
                >
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100/70 px-2 py-0.5 rounded">
                      PHASE 0{phase.phase_number}
                    </span>
                    <h4 className="font-display font-semibold text-sm text-ink">
                      {phase.phase_name}
                    </h4>

                    <ul className="space-y-1.5 text-xs text-neutral-700 font-sans">
                      {phase.steps.map((st, si) => (
                        <li key={si} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">›</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION 12 & 13: MVP PLAN & IMPROVEMENT OPPORTUNITIES ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 12. MVP Plan */}
            <div className="p-6 sm:p-7 rounded-[20px] border bg-white space-y-4 shadow-sm" style={{ borderColor: 'var(--color-border, #EAE4D9)' }}>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#E8B653]" />
                <h3 className="font-display font-semibold text-xl text-ink">
                  12. Phased MVP Scope Plan
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-emerald-800 uppercase block">MVP (Minimum Viable Product)</span>
                  <ul className="space-y-1 text-xs text-emerald-950 font-sans">
                    {activeReport.mvp_roadmap.mvp_features.map((feat, fi) => (
                      <li key={fi} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-blue-800 uppercase block">Version 2.0 Expansion</span>
                  <ul className="space-y-1 text-xs text-blue-950 font-sans">
                    {activeReport.mvp_roadmap.version_2_features.map((feat, fi) => (
                      <li key={fi} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">›</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-purple-800 uppercase block">Advanced & Scale Version</span>
                  <ul className="space-y-1 text-xs text-purple-950 font-sans">
                    {activeReport.mvp_roadmap.advanced_features.map((feat, fi) => (
                      <li key={fi} className="flex items-start gap-1.5">
                        <span className="text-purple-600 font-bold">★</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 13. Improvement Opportunities & Differentiation */}
            <div className="p-6 sm:p-7 rounded-[20px] border bg-white space-y-4 shadow-sm" style={{ borderColor: 'var(--color-border, #EAE4D9)' }}>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#E66F82]" />
                <h3 className="font-display font-semibold text-xl text-ink">
                  13. Differentiation & Improvement Wedges
                </h3>
              </div>

              <div className="space-y-3">
                {activeReport.improvement_opportunities.map((opp, oi) => (
                  <div key={oi} className="p-4 rounded-xl bg-[#FAF8F5] border border-neutral-200 space-y-1">
                    <span className="font-mono text-[10px] font-bold text-[#E66F82] uppercase">
                      OPPORTUNITY 0{oi + 1}
                    </span>
                    <p className="text-xs text-neutral-800 font-sans leading-relaxed">
                      {opp}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SECTION 14 & 15: FINAL ACTION PLAN & CREATOR CTA ── */}
          <div 
            className="p-8 sm:p-10 rounded-[28px] text-white space-y-6 shadow-xl text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #181924 0%, #25283B 100%)',
              border: '1px solid #3E4259'
            }}
          >
            <div className="max-w-2xl mx-auto space-y-3">
              <span className="px-3 py-1 rounded-full font-mono text-[10px] font-bold bg-[#6875E8]/20 text-[#6875E8] border border-[#6875E8]/40 uppercase tracking-widest inline-block">
                YOUR NEXT ACTIONABLE STEPS
              </span>
              <h3 className="font-display font-normal text-3xl sm:text-4xl text-white">
                Ready to Turn This Research Into a Validated Project?
              </h3>
              <p className="text-xs sm:text-sm text-white/80 font-sans leading-relaxed">
                Initialize your project specifications on INNOVEXA with one click. Solicit peer perspectives from matched domain reviewers and track milestone readiness.
              </p>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto text-left font-sans text-xs">
              {activeReport.next_steps.slice(0, 6).map((step, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2">
                  <span className="font-mono font-bold text-[#E8B653]">0{idx + 1}.</span>
                  <span className="text-white/90">{step}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleStartBuildingProject}
                className="px-8 py-4 rounded-xl font-mono text-sm font-bold text-white transition-all shadow-xl hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #E66F82 0%, #D8566C 100%)'
                }}
              >
                <FolderPlus className="w-5 h-5" />
                <span>START CREATING THIS PROJECT →</span>
              </button>
            </div>
          </div>

          {/* ── SECTION 16: VERIFIED CITATION & SOURCES DIRECTORY ── */}
          <div className="p-6 sm:p-7 rounded-[20px] border bg-[#FAF8F5] space-y-4" style={{ borderColor: 'var(--color-border, #EAE4D9)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-ink" />
                <h4 className="font-display font-semibold text-lg text-ink">
                  14. Verified Real-World Citations & Source Links ({activeReport.verified_sources.length})
                </h4>
              </div>
              <span className="font-mono text-xs text-muted">
                All external URLs are strictly verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeReport.verified_sources.map((src, si) => (
                <div 
                  key={si}
                  className="p-3.5 rounded-xl bg-white border border-neutral-200 flex flex-col justify-between space-y-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] font-bold text-muted uppercase">
                        {src.sourceType}
                      </span>
                      <span className="font-mono text-[9px] text-[#6875E8]">
                        {src.domain}
                      </span>
                    </div>
                    <div className="font-display font-semibold text-sm text-ink truncate">
                      {src.title}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted truncate max-w-[160px]">
                      {src.url}
                    </span>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6875E8] hover:underline font-mono text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      <span>Open ↗</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── Initial Empty State (When no search has been performed yet) ── */}
      {!isSearching && !activeReport && (
        <SlideUp delay={0.15}>
          <div 
            className="p-12 text-center rounded-[24px] border space-y-6 bg-white shadow-sm"
            style={{ borderColor: 'var(--color-border, #EAE4D9)' }}
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#6875E8]/10 text-[#6875E8] flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="font-display font-normal text-3xl text-ink">
                Enter an Innovation or Problem to Begin
              </h3>
              <p className="text-xs sm:text-sm text-muted font-sans leading-relaxed">
                INNOVEXA's AI Research Engine performs web search grounding, analyzes domain problem spaces, discovers related open-source solutions, and generates complete engineering roadmaps.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left font-sans pt-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-neutral-200/80 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-[#E8B653]/20 text-[#E8B653] flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <h4 className="font-display font-semibold text-base text-ink">Grounded Real Sources</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Extracts verified research papers, datasets, GitHub repositories, and existing market competitors with clickable external links.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-neutral-200/80 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-[#6875E8]/20 text-[#6875E8] flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h4 className="font-display font-semibold text-base text-ink">INNOVEXA Database Alignment</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Cross-references internal community innovations to prevent duplicate efforts and connect you with aligned creators.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-neutral-200/80 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-[#E66F82]/20 text-[#E66F82] flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <h4 className="font-display font-semibold text-base text-ink">8-Phase Implementation Plan</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Generates technical architecture pipelines, MVP scope roadmaps, and 1-click project initialization.
                </p>
              </div>
            </div>
          </div>
        </SlideUp>
      )}

    </div>
  );
};
