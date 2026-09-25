import React, { useEffect, useState } from 'react';
import { 
  X, 
  Scale, 
  Sparkles, 
  Check, 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  ExternalLink, 
  GitBranch, 
  Globe, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Layers,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { Project, Review } from '../../types/database';
import { 
  fetchAndBuildComparison, 
  ProjectComparisonReport, 
  ProjectComparisonItem 
} from '../../services/projectComparisonService';
import { CategoryBadge, TypeBadge } from '../common/Badge';

interface ProjectComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectIds: string[];
  onRemoveProject: (id: string) => void;
  onNavigateToProject?: (id: string) => void;
  contextProjects?: Project[];
  contextReviews?: Review[];
}

export const ProjectComparisonModal: React.FC<ProjectComparisonModalProps> = ({
  isOpen,
  onClose,
  projectIds,
  onRemoveProject,
  onNavigateToProject,
  contextProjects = [],
  contextReviews = []
}) => {
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Loading project data...');
  const [report, setReport] = useState<ProjectComparisonReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'validation' | 'features' | 'ai_insights'>('matrix');

  useEffect(() => {
    if (!isOpen || !projectIds || projectIds.length < 2) return;

    let isMounted = true;
    const runComparison = async () => {
      setLoading(true);
      setError(null);
      setLoadingStep('Fetching verified project specifications...');

      // Step 1: Loading
      const stepTimer1 = setTimeout(() => {
        if (isMounted) setLoadingStep('Analyzing community validation & review sentiment...');
      }, 400);

      const stepTimer2 = setTimeout(() => {
        if (isMounted) setLoadingStep('Generating side-by-side comparison matrix...');
      }, 800);

      const res = await fetchAndBuildComparison(projectIds, contextProjects, contextReviews);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!isMounted) return;

      if (res.error) {
        setError(res.error);
        setReport(null);
      } else {
        setReport(res.report);
      }
      setLoading(false);
    };

    runComparison();

    return () => {
      isMounted = false;
    };
  }, [isOpen, projectIds.join(','), contextProjects, contextReviews]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      style={{ background: 'rgba(24, 25, 36, 0.75)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-full max-w-6xl rounded-[20px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-all animate-fadeIn"
        style={{
          background: 'var(--color-surface, #FFFFFF)',
          border: '1px solid var(--color-border, #EAE4D9)'
        }}
      >
        {/* ── Modal Header ── */}
        <div 
          className="p-5 sm:p-6 border-b flex items-start justify-between gap-4 shrink-0"
          style={{ 
            borderColor: 'var(--color-border, #EAE4D9)',
            background: 'linear-gradient(180deg, var(--color-bg-subtle, #FAF8F5) 0%, var(--color-surface, #FFFFFF) 100%)'
          }}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-sm"
                style={{ background: 'var(--color-ink, #181924)' }}
              >
                <Scale className="w-4 h-4 text-[#E66F82]" />
              </div>
              <h2 
                className="font-display font-normal text-2xl sm:text-3xl leading-tight"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink, #181924)' }}
              >
                Compare Innovations
              </h2>
            </div>
            <p 
              className="text-xs sm:text-sm font-sans"
              style={{ color: 'var(--color-muted, #8E90A2)' }}
            >
              Compare selected innovations based on their actual project information, community validation and available insights.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-ink hover:bg-neutral-100 transition-all"
              style={{ border: '1px solid var(--color-border, #EAE4D9)' }}
              title="Close comparison"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Tab Switcher ── */}
        <div 
          className="px-6 py-2.5 border-b flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 bg-[#FAF8F5]/60"
          style={{ borderColor: 'var(--color-border-sub, #F0EAE1)' }}
        >
          <button
            onClick={() => setActiveTab('matrix')}
            className="px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all"
            style={{
              background: activeTab === 'matrix' ? 'var(--color-ink, #181924)' : 'transparent',
              color: activeTab === 'matrix' ? '#FFFFFF' : 'var(--color-muted, #8E90A2)',
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>CRITERIA MATRIX</span>
          </button>

          <button
            onClick={() => setActiveTab('validation')}
            className="px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all"
            style={{
              background: activeTab === 'validation' ? 'var(--color-ink, #181924)' : 'transparent',
              color: activeTab === 'validation' ? '#FFFFFF' : 'var(--color-muted, #8E90A2)',
            }}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>COMMUNITY VALIDATION</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className="px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all"
            style={{
              background: activeTab === 'features' ? 'var(--color-ink, #181924)' : 'transparent',
              color: activeTab === 'features' ? '#FFFFFF' : 'var(--color-muted, #8E90A2)',
            }}
          >
            <Check className="w-3.5 h-3.5 text-blue-400" />
            <span>FEATURE OVERLAPS</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_insights')}
            className="px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all"
            style={{
              background: activeTab === 'ai_insights' ? '#E66F82' : 'transparent',
              color: activeTab === 'ai_insights' ? '#FFFFFF' : 'var(--color-muted, #8E90A2)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI COMPARISON OBSERVATIONS</span>
          </button>
        </div>

        {/* ── Modal Body Content ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#E66F82] border-t-transparent animate-spin" />
              <div className="space-y-1">
                <div className="font-mono text-sm font-semibold text-ink">
                  {loadingStep}
                </div>
                <div className="font-mono text-xs text-muted">
                  Retrieving actual Supabase records and community signals...
                </div>
              </div>
            </div>
          ) : error ? (
            <div 
              className="p-8 text-center rounded-2xl space-y-4 max-w-lg mx-auto my-8"
              style={{ background: '#FFF5F5', border: '1px solid #FED7D7' }}
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-xl text-red-900">
                  Comparison Notice
                </h3>
                <p className="text-xs text-red-700 leading-relaxed font-sans">
                  {error}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-mono text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all"
              >
                RETURN TO EXPLORE
              </button>
            </div>
          ) : report ? (
            <>
              {/* ── PROJECT HEADER CARDS (2-4 Columns) ── */}
              <div 
                className={`grid gap-4 ${
                  report.projects.length === 2 
                    ? 'grid-cols-1 md:grid-cols-2' 
                    : report.projects.length === 3 
                    ? 'grid-cols-1 md:grid-cols-3' 
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                }`}
              >
                {report.projects.map((item, idx) => (
                  <div
                    key={item.project.id}
                    className="p-4 rounded-xl border flex flex-col justify-between transition-all relative group"
                    style={{
                      background: 'var(--color-bg-subtle, #FAF8F5)',
                      borderColor: 'var(--color-border, #EAE4D9)'
                    }}
                  >
                    {/* Project Remove Badge if > 2 */}
                    {report.projects.length > 2 && (
                      <button
                        onClick={() => onRemoveProject(item.project.id)}
                        title="Remove from comparison"
                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white text-muted hover:text-red-600 border border-neutral-200 flex items-center justify-center text-xs transition-all shadow-sm z-10"
                      >
                        ×
                      </button>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--color-ink, #181924)', color: 'white' }}
                        >
                          PROJECT {String.fromCharCode(65 + idx)}
                        </span>
                        <TypeBadge type={item.project.project_type} />
                      </div>

                      <div>
                        <h3 
                          className="font-display font-normal text-xl text-ink line-clamp-1 cursor-pointer hover:text-[#E66F82] transition-colors"
                          onClick={() => onNavigateToProject && onNavigateToProject(item.project.id)}
                        >
                          {item.project.title}
                        </h3>
                        <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-ink/80">{item.project.category}</span>
                          <span>•</span>
                          <span>by {item.project.owner_name || 'Innovator'}</span>
                        </div>
                      </div>

                      {/* Cover Preview */}
                      <div className="h-24 rounded-lg overflow-hidden relative">
                        <img 
                          src={item.project.cover_image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'} 
                          alt={item.project.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white font-mono text-[10px]">
                          <span className="font-bold">{item.project.readiness_score || 50}% Readiness</span>
                          <span>★ {item.votes.upvotes} upvotes</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-neutral-200/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onNavigateToProject && onNavigateToProject(item.project.id)}
                        className="text-xs font-mono font-bold text-[#E66F82] hover:underline flex items-center gap-1"
                      >
                        <span>View Project</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <div className="flex items-center gap-1">
                        {item.project.live_url && (
                          <a
                            href={item.project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-white text-muted hover:text-ink border"
                            title="Live App"
                          >
                            <Globe className="w-3 h-3" />
                          </a>
                        )}
                        {item.project.github_url && (
                          <a
                            href={item.project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-white text-muted hover:text-ink border"
                            title="GitHub"
                          >
                            <GitBranch className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── TAB 1: CRITERIA COMPARISON MATRIX ── */}
              {activeTab === 'matrix' && (
                <div 
                  className="rounded-2xl border overflow-hidden"
                  style={{ 
                    borderColor: 'var(--color-border, #EAE4D9)',
                    background: 'var(--color-surface, #FFFFFF)'
                  }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr 
                          className="font-mono text-[11px] border-b"
                          style={{ 
                            background: 'var(--color-bg-subtle, #FAF8F5)',
                            borderColor: 'var(--color-border, #EAE4D9)',
                            color: 'var(--color-muted, #8E90A2)'
                          }}
                        >
                          <th className="p-4 w-48 font-bold text-ink">CRITERIA</th>
                          {report.projects.map((item, idx) => (
                            <th key={item.project.id} className="p-4 font-bold text-ink">
                              PROJECT {String.fromCharCode(65 + idx)}: {item.project.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-sans">
                        {/* Problem */}
                        <tr>
                          <td className="p-4 font-mono font-bold text-ink bg-[#FAF8F5]/30">Problem Addressed</td>
                          {report.projects.map(item => (
                            <td key={item.project.id} className="p-4 align-top leading-relaxed text-ink/90">
                              <div className="font-semibold text-ink mb-1">{item.project.problem_title}</div>
                              <p className="text-muted">{item.project.problem_description || 'No detailed problem description provided.'}</p>
                            </td>
                          ))}
                        </tr>

                        {/* Proposed Solution */}
                        <tr>
                          <td className="p-4 font-mono font-bold text-ink bg-[#FAF8F5]/30">Proposed Solution</td>
                          {report.projects.map(item => (
                            <td key={item.project.id} className="p-4 align-top leading-relaxed text-ink/90">
                              <p>{item.project.solution_description || 'No detailed solution description provided.'}</p>
                            </td>
                          ))}
                        </tr>

                        {/* Target Users */}
                        <tr>
                          <td className="p-4 font-mono font-bold text-ink bg-[#FAF8F5]/30">Target Audience</td>
                          {report.projects.map(item => (
                            <td key={item.project.id} className="p-4 align-top leading-relaxed font-semibold text-ink">
                              {item.project.target_audience || 'General public / Unspecified'}
                            </td>
                          ))}
                        </tr>

                        {/* Value Proposition */}
                        <tr>
                          <td className="p-4 font-mono font-bold text-ink bg-[#FAF8F5]/30">Value Proposition</td>
                          {report.projects.map(item => (
                            <td key={item.project.id} className="p-4 align-top leading-relaxed text-ink/90">
                              {item.project.value_proposition || 'Not specified'}
                            </td>
                          ))}
                        </tr>

                        {/* Category & Project Type */}
                        <tr>
                          <td className="p-4 font-mono font-bold text-ink bg-[#FAF8F5]/30">Category & Stage</td>
                          {report.projects.map(item => (
                            <td key={item.project.id} className="p-4 align-top">
                              <div className="flex items-center gap-2">
                                <CategoryBadge category={item.project.category} />
                                <TypeBadge type={item.project.project_type} />
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Unique Differentiation */}
                        <tr>
                          <td className="p-4 font-mono font-bold text-ink bg-[#FAF8F5]/30">Differentiation</td>
                          {report.projects.map(item => (
                            <td key={item.project.id} className="p-4 align-top leading-relaxed text-ink/90">
                              {item.project.differentiation || 'Standard approach'}
                            </td>
                          ))}
                        </tr>

                        {/* Tags & Tech */}
                        <tr>
                          <td className="p-4 font-mono font-bold text-ink bg-[#FAF8F5]/30">Tags & Capabilities</td>
                          {report.projects.map(item => (
                            <td key={item.project.id} className="p-4 align-top">
                              <div className="flex flex-wrap gap-1.5">
                                {item.project.tags.map(tag => (
                                  <span 
                                    key={tag} 
                                    className="px-2 py-0.5 rounded font-mono text-[10px] bg-neutral-100 text-neutral-700"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Live URLs & Assets */}
                        <tr>
                          <td className="p-4 font-mono font-bold text-ink bg-[#FAF8F5]/30">Live Assets</td>
                          {report.projects.map(item => (
                            <td key={item.project.id} className="p-4 align-top font-mono text-[11px]">
                              {item.project.live_url || item.project.github_url ? (
                                <div className="space-y-1">
                                  {item.project.live_url && (
                                    <div className="text-emerald-600 truncate">
                                      ✓ Live App: {item.project.live_url}
                                    </div>
                                  )}
                                  {item.project.github_url && (
                                    <div className="text-blue-600 truncate">
                                      ✓ Repo: {item.project.github_url}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted italic">Concept / Specification stage</span>
                              )}
                            </td>
                          ))}
                        </tr>

                        {/* Upvotes & Reviews count */}
                        <tr>
                          <td className="p-4 font-mono font-bold text-ink bg-[#FAF8F5]/30">Community Metrics</td>
                          {report.projects.map(item => (
                            <td key={item.project.id} className="p-4 align-top font-mono text-[11px]">
                              <div className="space-y-0.5">
                                <div>★ {item.votes.upvotes} Upvotes / {item.votes.downvotes} Downvotes</div>
                                <div>💬 {item.reviewsCount} Verified Reviews</div>
                                <div>🚀 {item.project.readiness_score || 50}% Readiness Score</div>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── TAB 2: COMMUNITY VALIDATION & SENTIMENT ── */}
              {activeTab === 'validation' && (
                <div className="space-y-6">
                  <div 
                    className="p-5 rounded-xl border bg-[#FAF8F5]"
                    style={{ borderColor: 'var(--color-border, #EAE4D9)' }}
                  >
                    <h3 className="font-display font-normal text-xl text-ink mb-1">
                      Community Validation & Sentiment Analysis
                    </h3>
                    <p className="text-xs text-muted font-sans">
                      Calculated directly from verified reviews ({report.projects.reduce((acc, p) => acc + p.reviewsCount, 0)} total) and community voting signals.
                    </p>
                  </div>

                  <div 
                    className={`grid gap-4 ${
                      report.projects.length === 2 
                        ? 'grid-cols-1 md:grid-cols-2' 
                        : report.projects.length === 3 
                        ? 'grid-cols-1 md:grid-cols-3' 
                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                    }`}
                  >
                    {report.projects.map((item, idx) => (
                      <div
                        key={item.project.id}
                        className="p-5 rounded-xl border bg-white space-y-4"
                        style={{ borderColor: 'var(--color-border, #EAE4D9)' }}
                      >
                        <div className="border-b pb-3">
                          <span className="font-mono text-[10px] font-bold text-muted uppercase">
                            PROJECT {String.fromCharCode(65 + idx)}
                          </span>
                          <h4 className="font-display font-semibold text-lg text-ink line-clamp-1">
                            {item.project.title}
                          </h4>
                        </div>

                        {/* Metric Tiles */}
                        <div className="grid grid-cols-2 gap-2 font-mono text-center">
                          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                            <div className="text-xs text-emerald-800 font-bold">{item.votes.upvotes}</div>
                            <div className="text-[9px] text-emerald-600 uppercase">Upvotes</div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                            <div className="text-xs text-ink font-bold">{item.reviewsCount}</div>
                            <div className="text-[9px] text-muted uppercase">Reviews</div>
                          </div>
                        </div>

                        {/* Sentiment Breakdown */}
                        <div className="space-y-2 pt-2">
                          <div className="text-xs font-mono font-bold text-ink flex items-center justify-between">
                            <span>Review Sentiment</span>
                            {item.hasEnoughReviewData && (
                              <span className="text-emerald-600 font-bold">{item.positivePercentage}% Positive</span>
                            )}
                          </div>

                          {item.hasEnoughReviewData ? (
                            <div className="space-y-1.5 font-mono text-[10px]">
                              {/* Progress bar */}
                              <div className="h-2 rounded-full bg-neutral-100 flex overflow-hidden">
                                <div 
                                  style={{ width: `${item.positivePercentage || 0}%` }} 
                                  className="bg-emerald-500 h-full"
                                  title={`Positive: ${item.positivePercentage}%`}
                                />
                                <div 
                                  style={{ width: `${item.neutralPercentage || 0}%` }} 
                                  className="bg-amber-400 h-full"
                                  title={`Neutral: ${item.neutralPercentage}%`}
                                />
                                <div 
                                  style={{ width: `${item.negativePercentage || 0}%` }} 
                                  className="bg-rose-400 h-full"
                                  title={`Constructive/Critical: ${item.negativePercentage}%`}
                                />
                              </div>

                              <div className="flex items-center justify-between text-muted pt-1">
                                <span className="text-emerald-600">✓ Positive: {item.positivePercentage}%</span>
                                <span className="text-amber-600">~ Neutral: {item.neutralPercentage}%</span>
                                <span className="text-rose-600">! Critical: {item.negativePercentage}%</span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-neutral-50 text-center font-mono text-xs text-muted border border-dashed">
                              Not enough community data.
                            </div>
                          )}
                        </div>

                        {/* Recent Review Snippets */}
                        {item.reviews.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t text-xs">
                            <div className="font-mono text-[10px] text-muted uppercase">Latest Review Feedback:</div>
                            <p className="text-xs text-ink/80 italic line-clamp-2 bg-[#FAF8F5] p-2 rounded">
                              "{item.reviews[0].suggestion || 'Promising architecture with good usability clarity.'}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB 3: FEATURE COMPARISON & OVERLAPS ── */}
              {activeTab === 'features' && (
                <div className="space-y-6">
                  {/* Common Features */}
                  <div 
                    className="p-5 rounded-xl border bg-emerald-50/50"
                    style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-display font-semibold text-lg text-emerald-950">
                        Common Features & Shared Focus
                      </h3>
                    </div>
                    {report.commonFeatures.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                        {report.commonFeatures.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-mono text-emerald-900 bg-white p-2.5 rounded-lg border border-emerald-100">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-800 font-sans">
                        These projects target distinctly different feature domains with minimal direct overlapping capabilities.
                      </p>
                    )}
                  </div>

                  {/* Project Specific Features */}
                  <div className="space-y-3">
                    <h3 className="font-display font-semibold text-lg text-ink">
                      Project-Specific Capabilities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.uniqueFeatures.map(u => (
                        <div 
                          key={u.projectId}
                          className="p-4 rounded-xl border bg-white space-y-2.5"
                          style={{ borderColor: 'var(--color-border, #EAE4D9)' }}
                        >
                          <div className="font-display font-semibold text-ink text-base">
                            {u.projectTitle}
                          </div>
                          <ul className="space-y-1.5 font-mono text-xs text-neutral-700">
                            {u.features.map((feat, fi) => (
                              <li key={fi} className="flex items-start gap-2">
                                <span className="text-[#E66F82] font-bold">•</span>
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 4: GROUNDED AI COMPARISON OBSERVATIONS ── */}
              {activeTab === 'ai_insights' && (
                <div className="space-y-6">
                  {report.aiError && (
                    <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-xs font-mono border border-amber-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{report.aiError}</span>
                    </div>
                  )}

                  {/* Executive Summary */}
                  {report.aiAnalysis?.comparison_summary && (
                    <div 
                      className="p-5 rounded-xl border"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(230,111,130,0.06) 0%, rgba(104,117,232,0.06) 100%)',
                        borderColor: 'var(--color-border, #EAE4D9)'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-[#E66F82]" />
                        <h3 className="font-display font-semibold text-lg text-ink">
                          Comparative Synthesis
                        </h3>
                      </div>
                      <p className="text-sm font-sans text-ink/90 leading-relaxed">
                        {report.aiAnalysis.comparison_summary}
                      </p>
                    </div>
                  )}

                  {/* Criteria Analysis */}
                  {report.aiAnalysis?.criteria && (
                    <div className="space-y-4">
                      <h4 className="font-mono text-xs font-bold text-muted uppercase">
                        Grounded Dimension Breakdown
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.aiAnalysis.criteria.map((crit, ci) => (
                          <div 
                            key={ci}
                            className="p-4 rounded-xl border bg-white space-y-3"
                            style={{ borderColor: 'var(--color-border, #EAE4D9)' }}
                          >
                            <div className="font-display font-semibold text-base text-ink flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#E66F82]" />
                              <span>{crit.name}</span>
                            </div>
                            <div className="space-y-2 text-xs font-sans">
                              {crit.projects.map(pAnalysis => {
                                const projectTitle = report.projects.find(p => p.project.id === pAnalysis.project_id)?.project.title || 'Project';
                                return (
                                  <div key={pAnalysis.project_id} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-neutral-100">
                                    <div className="font-mono font-bold text-[10px] text-ink/70 mb-0.5">
                                      {projectTitle}:
                                    </div>
                                    <div className="text-neutral-800 leading-relaxed">
                                      {pAnalysis.analysis}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Commonalities & Differences */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Common Points */}
                    <div className="p-4 rounded-xl border bg-white space-y-2" style={{ borderColor: 'var(--color-border, #EAE4D9)' }}>
                      <div className="font-mono text-xs font-bold text-ink uppercase">
                        Potential Overlaps & Commonalities
                      </div>
                      <ul className="space-y-1.5 text-xs text-neutral-700 font-sans">
                        {report.aiAnalysis?.common_points.map((cp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{cp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Gaps & Observations */}
                    <div className="p-4 rounded-xl border bg-white space-y-2" style={{ borderColor: 'var(--color-border, #EAE4D9)' }}>
                      <div className="font-mono text-xs font-bold text-ink uppercase">
                        Whitespace & Execution Gaps
                      </div>
                      <ul className="space-y-1.5 text-xs text-neutral-700 font-sans">
                        {report.aiAnalysis?.potential_gaps.map((gap, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 border text-center font-mono text-xs text-muted">
                    ℹ️ INNOVEXA AI provides objective comparative observations without declaring arbitrary winners.
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* ── Modal Footer ── */}
        <div 
          className="p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-[#FAF8F5]"
          style={{ borderColor: 'var(--color-border, #EAE4D9)' }}
        >
          <div className="font-mono text-xs text-muted">
            Comparing {projectIds.length} verified projects ({report?.projects.map(p => p.project.title).join(' vs ')})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-mono text-xs font-semibold text-ink bg-white border border-neutral-300 hover:bg-neutral-50 transition-all"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
