import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  MessageSquare, 
  Layers, 
  Lightbulb, 
  History, 
  ChevronRight, 
  Check, 
  Bookmark, 
  X, 
  HelpCircle,
  BarChart3,
  ThumbsUp,
  Flame,
  ShieldAlert,
  ArrowUpRight,
  GitBranch,
  User
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { validationService } from '../services/validationService';
import { 
  SmartReview, 
  ProjectValidationInsights, 
  ProjectImprovementSuggestion,
  ValidationCycleHistory,
  ImprovementStatusType
} from '../types/validation';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';
import { Badge, CategoryBadge, TypeBadge } from '../components/common/Badge';

export const ValidationInsightsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById, refreshProjects } = useProjects();
  const { user } = useAuth();

  const projectId = id || '';
  const project = getProjectById(projectId);

  const [activeTab, setActiveTab] = useState<'overview' | 'feedback' | 'clusters' | 'improvements' | 'history'>('overview');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [reviews, setReviews] = useState<SmartReview[]>([]);
  const [insights, setInsights] = useState<ProjectValidationInsights | null>(null);
  const [suggestions, setSuggestions] = useState<ProjectImprovementSuggestion[]>([]);
  const [history, setHistory] = useState<ValidationCycleHistory[]>([]);
  const [suggestionFilter, setSuggestionFilter] = useState<'all' | 'pending' | 'accepted' | 'saved' | 'dismissed'>('all');

  const isOwner = user && project && project.owner_id === user.id;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const loadValidationData = async (forceAI = false) => {
    if (!project) return;
    try {
      if (forceAI) setAnalyzing(true);
      else setLoading(true);

      const [revs, res, hist] = await Promise.all([
        validationService.getProjectReviewsWithAnalysis(project.id),
        validationService.getAggregatedValidationInsights(project, forceAI),
        validationService.getValidationHistory(project.id)
      ]);

      setReviews(revs);
      setInsights(res.insights);
      setSuggestions(res.suggestions);
      setHistory(hist);
    } catch (e) {
      console.error('Failed to load validation insights:', e);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    loadValidationData(false);
  }, [projectId]);

  const handleUpdateSuggestion = async (sugId: string, status: ImprovementStatusType) => {
    if (!project) return;
    await validationService.updateSuggestionStatus(project.id, sugId, status);
    setSuggestions(prev => prev.map(s => s.id === sugId ? { ...s, status } : s));
    showToast(`Suggestion marked as ${status}`);
  };

  const handleRequestRevalidation = async () => {
    if (!project) return;
    setRevalidating(true);
    try {
      const updatedHist = await validationService.requestNewValidationCycle(project);
      setHistory(updatedHist);
      await loadValidationData(true);
      showToast(`New validation cycle initialized for Version ${(project.current_version || 1) + 1}!`);
    } finally {
      setRevalidating(false);
    }
  };

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="bg-white rounded-3xl p-8 border border-[#EAE4D9] space-y-4 shadow-subtle">
          <AlertTriangle className="w-10 h-10 text-[#E66F82] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#181924]">Project Not Found</h2>
          <p className="text-xs text-[#555768]">The requested project could not be located.</p>
          <button onClick={() => navigate('/explore')} className="px-6 py-2.5 rounded-full bg-[#181924] text-white font-mono text-xs font-bold">
            ← Explore Innovations
          </button>
        </div>
      </div>
    );
  }

  // Non-owner permission check banner
  if (!isOwner && user) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="bg-white rounded-3xl p-8 border border-[#EAE4D9] space-y-4 shadow-subtle max-w-md mx-auto">
          <ShieldAlert className="w-10 h-10 text-[#E8B653] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#181924]">Creator-Only Insights</h2>
          <p className="text-xs text-[#555768] leading-relaxed">
            Validation & Improvement Insights are exclusively accessible to the creator of <strong>{project.title}</strong>.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button onClick={() => navigate(`/projects/${project.id}`)} className="px-6 py-2.5 rounded-full bg-[#181924] text-white font-mono text-xs font-bold">
              View Project
            </button>
            <button onClick={() => navigate(`/projects/${project.id}/review`)} className="px-6 py-2.5 rounded-full bg-[#6875E8] text-white font-mono text-xs font-bold">
              Give Feedback
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredSuggestions = suggestions.filter(s => {
    if (suggestionFilter === 'all') return true;
    return s.status === suggestionFilter;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181924] text-white px-5 py-3 rounded-2xl shadow-card flex items-center gap-2.5 text-xs font-mono border border-white/10 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#4FA89B]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="flex items-center gap-2 text-xs font-mono font-semibold text-[#555768] hover:text-[#181924] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {project.title}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadValidationData(true)}
            disabled={analyzing || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EAE4D9] text-[#181924] text-xs font-mono font-bold transition-all border border-[#EAE4D9] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'ANALYZING FEEDBACK...' : 'REFRESH AI INSIGHTS'}</span>
          </button>

          <button
            onClick={handleRequestRevalidation}
            disabled={revalidating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#6875E8] hover:bg-[#5563D6] text-white text-xs font-mono font-bold transition-all shadow-subtle disabled:opacity-50"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>REQUEST NEW VALIDATION</span>
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[#6875E8]/10 text-[#6875E8] border border-[#6875E8]/20">
            VALIDATION & IMPROVEMENT ENGINE
          </span>
          <span className="text-[10px] font-mono text-[#8E90A2]">
            VERSION {project.current_version || 1}.0
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181924]">
          Validation Insights
        </h1>
        <p className="text-sm text-[#555768]">
          Understand what your community is saying, identify feedback patterns, and decide what to improve next.
        </p>
      </div>

      {/* Top Metrics Cards Banner */}
      <SlideUp delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-5 bg-white rounded-3xl border border-[#EAE4D9] shadow-subtle space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#8E90A2]">TOTAL REVIEWS</span>
            <div className="font-serif text-3xl font-bold text-[#181924]">{reviews.length}</div>
            <span className="text-[10px] text-[#555768] block">Community peers</span>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-[#EAE4D9] shadow-subtle space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#4FA89B]">POSITIVE RATIO</span>
            <div className="font-serif text-3xl font-bold text-[#4FA89B]">{insights?.positive_percentage || 0}%</div>
            <span className="text-[10px] text-[#555768] block">Initial impression</span>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-[#EAE4D9] shadow-subtle space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#E8B653]">NEUTRAL / UNSURE</span>
            <div className="font-serif text-3xl font-bold text-[#E8B653]">{insights?.neutral_percentage || 0}%</div>
            <span className="text-[10px] text-[#555768] block">Seeking clarity</span>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-[#EAE4D9] shadow-subtle space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#E66F82]">NEEDS WORK</span>
            <div className="font-serif text-3xl font-bold text-[#E66F82]">{insights?.negative_percentage || 0}%</div>
            <span className="text-[10px] text-[#555768] block">Identified friction</span>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-[#EAE4D9] shadow-subtle space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#6875E8]">PROBLEM RELEVANCE</span>
            <div className="font-serif text-3xl font-bold text-[#6875E8]">{insights?.problem_relevance_rate || 0}%</div>
            <span className="text-[10px] text-[#555768] block">Target audience need</span>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-[#EAE4D9] shadow-subtle space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#181924]">ACTIONABLE TASKS</span>
            <div className="font-serif text-3xl font-bold text-[#181924]">{suggestions.length}</div>
            <span className="text-[10px] text-[#555768] block">AI Recommendations</span>
          </div>
        </div>
      </SlideUp>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#EAE4D9]">
        {[
          { id: 'overview', label: 'Overview & Summary', icon: BarChart3 },
          { id: 'feedback', label: `Individual Feedback (${reviews.length})`, icon: MessageSquare },
          { id: 'clusters', label: `Feedback Themes (${insights?.feedback_clusters?.length || 0})`, icon: Layers },
          { id: 'improvements', label: `Improvement Recommendations (${suggestions.length})`, icon: Lightbulb },
          { id: 'history', label: `Validation History (${history.length})`, icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-white text-[#181924] border border-[#EAE4D9] shadow-sm' 
                  : 'text-[#555768] hover:text-[#181924] hover:bg-white/50'
              }`}
              style={isActive ? { borderColor: '#6875E8' } : {}}
            >
              <Icon className="w-3.5 h-3.5" style={isActive ? { color: '#6875E8' } : {}} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW & FINAL VALIDATION RESULT ── */}
      {activeTab === 'overview' && (
        <SlideUp delay={0.05}>
          <div className="space-y-6">
            
            {/* Final Validation Result Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE4D9] shadow-subtle space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE4D9] pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#6875E8]">
                    EXECUTIVE SYNTHESIS
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#181924]">
                    Final Validation Result
                  </h3>
                </div>
                <Badge variant={insights && insights.positive_percentage >= 70 ? 'mint' : 'purple'}>
                  {insights && insights.positive_percentage >= 70 ? 'VALIDATED TRACTION' : 'CONSTRUCTIVE ITERATION'}
                </Badge>
              </div>

              {/* Summary Text */}
              <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#EAE4D9] text-sm text-[#181924] leading-relaxed">
                {insights?.validation_summary || 'No validation summary available yet.'}
              </div>

              {/* Positive Signals vs Main Concerns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Positive Signals */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4FA89B]" />
                    <h4 className="font-serif text-base font-bold text-[#181924]">
                      What Users Like (Positive Signals)
                    </h4>
                  </div>
                  {insights?.top_positive_signals && insights.top_positive_signals.length > 0 ? (
                    <div className="space-y-2">
                      {insights.top_positive_signals.map((sig, idx) => (
                        <div key={idx} className="p-3 bg-[#4FA89B]/5 rounded-xl border border-[#4FA89B]/20 text-xs text-[#181924] flex items-start gap-2.5">
                          <span className="text-[#4FA89B] font-bold">✓</span>
                          <span>{sig}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#8E90A2]">No strong positive signals recorded yet.</p>
                  )}
                </div>

                {/* Main Concerns */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#E66F82]" />
                    <h4 className="font-serif text-base font-bold text-[#181924]">
                      What Users Are Concerned About
                    </h4>
                  </div>
                  {insights?.top_concerns && insights.top_concerns.length > 0 ? (
                    <div className="space-y-2">
                      {insights.top_concerns.map((con, idx) => (
                        <div key={idx} className="p-3 bg-[#E66F82]/5 rounded-xl border border-[#E66F82]/20 text-xs text-[#181924] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[#E66F82] font-bold">⚠</span>
                            <span>{con.concern}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-[#E66F82] bg-[#E66F82]/10 px-2 py-0.5 rounded-full shrink-0">
                            {con.mention_count} mention{con.mention_count > 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#8E90A2]">No major concerns flagged by reviewers.</p>
                  )}
                </div>

              </div>

              {/* Recommended Next Actions */}
              <div className="pt-4 border-t border-[#EAE4D9] space-y-3">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6875E8]">
                  RECOMMENDED NEXT ACTIONS FOR CREATOR
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {insights?.next_steps?.map((step, idx) => (
                    <div key={idx} className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EAE4D9] text-xs text-[#181924] space-y-1">
                      <span className="font-mono text-[10px] text-[#6875E8] font-bold block">STEP 0{idx + 1}</span>
                      <p className="leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </SlideUp>
      )}

      {/* ── TAB 2: INDIVIDUAL USER FEEDBACK ── */}
      {activeTab === 'feedback' && (
        <SlideUp delay={0.05}>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE4D9] space-y-3">
                <MessageSquare className="w-8 h-8 text-[#8E90A2] mx-auto" />
                <h3 className="font-serif text-lg font-bold text-[#181924]">No Reviews Yet</h3>
                <p className="text-xs text-[#555768]">Share your project on the explore feed to receive your first community validation.</p>
              </div>
            ) : (
              reviews.map((r) => {
                const analysis = r.ai_analysis;
                const sentimentColor = 
                  analysis?.sentiment === 'positive' ? '#4FA89B' :
                  analysis?.sentiment === 'negative' ? '#E66F82' :
                  analysis?.sentiment === 'mixed' ? '#E8B653' : '#6875E8';

                return (
                  <div key={r.id} className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE4D9] shadow-subtle space-y-4 hover:border-[#181924]/30 transition-all">
                    
                    {/* Review Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE4D9] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#181924] text-white flex items-center justify-center font-mono text-xs font-bold">
                          {r.reviewer_name?.slice(0, 2).toUpperCase() || 'CR'}
                        </div>
                        <div>
                          <div className="font-serif font-bold text-sm text-[#181924]">{r.reviewer_name || 'Community Peer'}</div>
                          <div className="text-[10px] font-mono text-[#8E90A2]">{r.reviewer_role || 'Innovator'} • {new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {/* Ratings Summary Pills */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EAE4D9] text-[#181924]">
                          {r.first_reaction === 'interesting' ? '🙂 Interesting' : r.first_reaction === 'not_sure' ? '😐 Unsure' : '🙁 Needs Work'}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EAE4D9] text-[#181924]">
                          Relevance: {r.problem_relevance === 'yes' ? '👍 Yes' : r.problem_relevance === 'maybe' ? '🤔 Maybe' : '👎 No'}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EAE4D9] text-[#181924]">
                          Value: {r.solution_value === 'very_useful' ? '🔥 High' : r.solution_value === 'useful' ? '👍 Useful' : '😐 Low'}
                        </span>
                      </div>
                    </div>

                    {/* Improvements Selected */}
                    {r.selected_improvements && r.selected_improvements.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#8E90A2] mr-1">Improvements:</span>
                        {r.selected_improvements.map((imp, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EAE4D9] text-[#555768]">
                            {imp}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Original Written Comment */}
                    {r.comment && (
                      <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EAE4D9] text-xs text-[#181924] leading-relaxed italic">
                        "{r.comment}"
                      </div>
                    )}

                    {/* AI Individual Review Analysis Insight */}
                    {analysis && (
                      <div className="p-4 bg-white rounded-2xl border border-[#EAE4D9] space-y-2 ring-1 ring-[#181924]/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#6875E8]" />
                            <span className="text-[10px] font-mono uppercase font-bold text-[#6875E8]">
                              AI Individual Review Insight
                            </span>
                          </div>
                          <span 
                            className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: sentimentColor }}
                          >
                            {analysis.sentiment} ({Math.round(analysis.sentiment_score * 100)}%)
                          </span>
                        </div>

                        <p className="text-xs text-[#555768] leading-relaxed">
                          {analysis.ai_summary}
                        </p>

                        {/* Topics */}
                        {analysis.topics && analysis.topics.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[9px] font-mono text-[#8E90A2]">TOPICS:</span>
                            {analysis.topics.map((t, idx) => (
                              <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#6875E8]/10 text-[#6875E8] font-bold">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </SlideUp>
      )}

      {/* ── TAB 3: FEEDBACK CLUSTERING & THEMES ── */}
      {activeTab === 'clusters' && (
        <SlideUp delay={0.05}>
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE4D9] shadow-subtle space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6875E8]">
                  PATTERN RECOGNITION
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#181924]">
                  Clustered Feedback Themes
                </h3>
                <p className="text-xs text-[#555768]">
                  Instead of reading dozens of isolated comments, AI clusters recurring feedback into high-signal problem domains.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {insights?.feedback_clusters?.map((cluster, idx) => (
                  <div key={idx} className="p-5 bg-[#FAF8F5] rounded-3xl border border-[#EAE4D9] space-y-3 hover:border-[#181924]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-lg font-bold text-[#181924]">
                        {cluster.category}
                      </h4>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#181924] text-white">
                        {cluster.mention_count} mentions
                      </span>
                    </div>

                    <p className="text-xs text-[#555768] leading-relaxed">
                      {cluster.summary}
                    </p>

                    {cluster.sample_quotes && cluster.sample_quotes.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-[#EAE4D9]">
                        <span className="text-[9px] font-mono uppercase text-[#8E90A2] font-bold block">
                          Sample Peer Quotes:
                        </span>
                        {cluster.sample_quotes.map((q, qIdx) => (
                          <div key={qIdx} className="text-[11px] text-[#181924] italic">
                            "{q}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SlideUp>
      )}

      {/* ── TAB 4: IMPROVEMENT RECOMMENDATIONS ── */}
      {activeTab === 'improvements' && (
        <SlideUp delay={0.05}>
          <div className="space-y-6">
            
            {/* Action Bar with Status Filter Pills */}
            <div className="bg-white rounded-3xl p-6 border border-[#EAE4D9] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#181924]">
                  Prioritized Improvement Opportunities
                </h3>
                <p className="text-xs text-[#555768]">
                  Review recommendations generated from actual community feedback. Accept, save, or dismiss each item.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(['all', 'pending', 'accepted', 'saved', 'dismissed'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setSuggestionFilter(filter)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold capitalize transition-all ${
                      suggestionFilter === filter
                        ? 'bg-[#181924] text-white'
                        : 'bg-[#FAF8F5] text-[#555768] hover:bg-[#EAE4D9]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestions Cards List */}
            <div className="space-y-4">
              {filteredSuggestions.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE4D9] space-y-2">
                  <Lightbulb className="w-8 h-8 text-[#8E90A2] mx-auto" />
                  <h4 className="font-serif text-base font-bold text-[#181924]">No Recommendations in this Filter</h4>
                  <p className="text-xs text-[#555768]">Switch filters or refresh AI insights to populate suggestions.</p>
                </div>
              ) : (
                filteredSuggestions.map((sug) => {
                  const priorityColor = 
                    sug.priority === 'high' ? '#E66F82' :
                    sug.priority === 'medium' ? '#E8B653' : '#4FA89B';

                  return (
                    <div key={sug.id} className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE4D9] shadow-subtle space-y-4 hover:border-[#181924]/30 transition-all">
                      
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span 
                              className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: priorityColor }}
                            >
                              {sug.priority} PRIORITY
                            </span>
                            <span className="text-xs font-mono text-[#8E90A2]">
                              {sug.cluster_category || 'Core Opportunity'}
                            </span>
                            <span className="text-[10px] font-mono text-[#6875E8] bg-[#6875E8]/10 px-2 py-0.5 rounded font-bold">
                              {sug.source_review_count} supporting review{sug.source_review_count > 1 ? 's' : ''}
                            </span>
                          </div>
                          <h4 className="font-serif text-xl font-bold text-[#181924]">
                            {sug.title}
                          </h4>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[10px] font-mono uppercase font-bold px-3 py-1 rounded-full shrink-0 ${
                          sug.status === 'accepted' ? 'bg-[#4FA89B]/10 text-[#4FA89B] border border-[#4FA89B]/30' :
                          sug.status === 'saved' ? 'bg-[#6875E8]/10 text-[#6875E8] border border-[#6875E8]/30' :
                          sug.status === 'dismissed' ? 'bg-[#8E90A2]/10 text-[#8E90A2] border border-[#8E90A2]/30' :
                          'bg-[#E8B653]/10 text-[#E8B653] border border-[#E8B653]/30'
                        }`}>
                          {sug.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Description & Reason */}
                      <p className="text-xs text-[#555768] leading-relaxed">
                        {sug.description}
                      </p>

                      <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EAE4D9] text-xs text-[#181924] space-y-1">
                        <strong className="font-mono text-[10px] text-[#6875E8] uppercase block">Why Recommended:</strong>
                        <span>{sug.reason}</span>
                      </div>

                      {/* Action Decision Buttons */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#EAE4D9]">
                        <button
                          onClick={() => handleUpdateSuggestion(sug.id, 'accepted')}
                          disabled={sug.status === 'accepted'}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                            sug.status === 'accepted'
                              ? 'bg-[#4FA89B] text-white'
                              : 'bg-[#4FA89B]/10 text-[#4FA89B] hover:bg-[#4FA89B] hover:text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{sug.status === 'accepted' ? 'ACCEPTED' : 'APPLY / ACCEPT'}</span>
                        </button>

                        <button
                          onClick={() => handleUpdateSuggestion(sug.id, 'saved')}
                          disabled={sug.status === 'saved'}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                            sug.status === 'saved'
                              ? 'bg-[#6875E8] text-white'
                              : 'bg-[#FAF8F5] text-[#555768] border border-[#EAE4D9] hover:bg-[#6875E8] hover:text-white'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>{sug.status === 'saved' ? 'SAVED' : 'SAVE FOR LATER'}</span>
                        </button>

                        <button
                          onClick={() => handleUpdateSuggestion(sug.id, 'dismissed')}
                          disabled={sug.status === 'dismissed'}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                            sug.status === 'dismissed'
                              ? 'bg-[#8E90A2] text-white'
                              : 'bg-[#FAF8F5] text-[#8E90A2] border border-[#EAE4D9] hover:bg-[#8E90A2] hover:text-white'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>{sug.status === 'dismissed' ? 'DISMISSED' : 'DISMISS'}</span>
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </SlideUp>
      )}

      {/* ── TAB 5: VALIDATION HISTORY & EVOLUTION ── */}
      {activeTab === 'history' && (
        <SlideUp delay={0.05}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE4D9] shadow-subtle space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#6875E8]">
                VALIDATION TIMELINE
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#181924]">
                Evolution Over Time
              </h3>
              <p className="text-xs text-[#555768]">
                Track how community feedback, positive signals, and problem relevance improve as you deploy project updates.
              </p>
            </div>

            <div className="space-y-4">
              {history.map((cycle, idx) => (
                <div key={idx} className="p-6 bg-[#FAF8F5] rounded-3xl border border-[#EAE4D9] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE4D9] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#181924] text-white font-mono text-xs font-bold flex items-center justify-center">
                        v{cycle.version_number}
                      </div>
                      <h4 className="font-serif text-lg font-bold text-[#181924]">
                        {cycle.cycle_label}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-[#8E90A2]">
                      Completed {cycle.date_completed}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-[#EAE4D9]">
                      <span className="text-[9px] font-mono uppercase text-[#8E90A2] block">Reviews</span>
                      <span className="font-serif text-lg font-bold text-[#181924]">{cycle.total_reviews}</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-[#EAE4D9]">
                      <span className="text-[9px] font-mono uppercase text-[#4FA89B] block">Positive Score</span>
                      <span className="font-serif text-lg font-bold text-[#4FA89B]">{cycle.positive_percentage}%</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-[#EAE4D9]">
                      <span className="text-[9px] font-mono uppercase text-[#6875E8] block">Problem Relevance</span>
                      <span className="font-serif text-lg font-bold text-[#6875E8]">{cycle.problem_relevance_rate}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#555768] leading-relaxed">
                    {cycle.validation_summary}
                  </p>

                  {cycle.top_improvements_applied && cycle.top_improvements_applied.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-mono text-[#8E90A2] uppercase font-bold mr-1">Applied:</span>
                      {cycle.top_improvements_applied.map((app, aIdx) => (
                        <span key={aIdx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#4FA89B]/10 text-[#4FA89B] font-bold">
                          ✓ {app}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </SlideUp>
      )}

    </div>
  );
};
