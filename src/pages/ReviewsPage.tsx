import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Sparkles, Filter, Clock, ArrowRight, Award, MessageSquare, Plus } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useReviewModal } from '../context/ReviewModalContext';
import { Project } from '../types/database';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';
import { Badge, CategoryBadge, TypeBadge } from '../components/common/Badge';
import { ProjectVoteButtons } from '../components/projects/ProjectVoteButtons';

interface ReviewsPageProps {
  onNavigate?: (view: string, id?: string) => void;
  onOpenReview?: (project: Project) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ 
  onNavigate: propOnNavigate, 
  onOpenReview: propOnOpenReview 
}) => {
  const routerNavigate = useNavigate();
  const { openReviewModal } = useReviewModal();

  const onNavigate = propOnNavigate || ((view: string, id?: string) => {
    if (id) routerNavigate(`/projects/${id}`);
    else routerNavigate(`/${view}`);
  });
  const onOpenReview = propOnOpenReview || ((p: Project) => openReviewModal(p));
  const { user } = useAuth();
  const { projects, reviews, calculateMatchScore } = useProjects();
  const [activeTab, setActiveTab] = useState<'for_you' | 'constructive' | 'suggestions' | 'questions' | 'helpful'>('for_you');

  const userId = user?.id || 'current';
  
  // Projects available across community
  const availableProjects = projects;

  // Filter reviews by active perspective category
  const filteredReviews = reviews.filter(r => {
    if (activeTab === 'constructive') return r.review_type === 'constructive';
    if (activeTab === 'suggestions') return r.review_type === 'suggestion';
    if (activeTab === 'questions') return r.review_type === 'question';
    if (activeTab === 'helpful') return (r.helpful_votes || 0) > 5;
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <SlideUp delay={0.05}>
        <div className="space-y-2">
          <div className="text-[11px] font-mono tracking-widest text-innovexa-purple uppercase font-bold flex items-center gap-2">
            <span>COMMUNITY REVIEWS HUB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-innovexa-purple"></span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-innovexa-ink">
            Contribute high-signal perspectives.
          </h1>
          <p className="text-xs sm:text-sm text-innovexa-ink-muted max-w-2xl leading-relaxed">
            Review innovations matched to your domain knowledge in under 60 seconds. Each constructive perspective earns reputation points and shapes the next version.
          </p>
        </div>
      </SlideUp>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-innovexa-border pb-1">
        {[
          { id: 'for_you', label: 'MATCHED FOR YOU' },
          { id: 'constructive', label: 'CONSTRUCTIVE SIGNALS' },
          { id: 'suggestions', label: 'SUGGESTIONS' },
          { id: 'questions', label: 'QUESTIONS' },
          { id: 'helpful', label: 'MOST HELPFUL' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 text-xs font-mono transition-all rounded-t-xl ${
              activeTab === t.id
                ? 'border-b-2 border-innovexa-purple text-innovexa-purple font-bold bg-white'
                : 'text-innovexa-ink-muted hover:text-innovexa-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* MATCHED FOR YOU VIEW */}
      {activeTab === 'for_you' ? (
        <div className="space-y-6">
          <div className="text-xs font-mono text-innovexa-ink-muted">
            Innovations routed to you based on your selected interests and reviewer reputation.
          </div>

          {availableProjects.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-innovexa-border p-12 text-center space-y-4">
              <p className="text-xs text-innovexa-ink-muted font-mono">No innovations waiting for review yet.</p>
              <button
                onClick={() => routerNavigate('/create')}
                className="bg-innovexa-ink text-white px-6 py-2.5 rounded-full text-xs font-mono font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> Submit First Innovation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableProjects.map((p, idx) => {
                const match = calculateMatchScore(p);
                const isOwner = user?.id && p.owner_id === user.id;

                return (
                  <SlideUp key={p.id} delay={0.05 + idx * 0.03}>
                    <div className="bg-white rounded-3xl border border-innovexa-border p-6 shadow-subtle hover:shadow-card transition-all space-y-4 flex flex-col justify-between h-full group">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CategoryBadge category={p.category} />
                            <TypeBadge type={p.project_type} />
                          </div>
                          {isOwner ? (
                            <span className="text-[10px] font-mono font-bold text-innovexa-coral bg-innovexa-coral/10 px-2 py-0.5 rounded-full">
                              YOUR INNOVATION
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono font-bold text-innovexa-purple bg-innovexa-purple/10 px-2.5 py-0.5 rounded-full">
                              {match}% MATCH
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 
                            onClick={() => routerNavigate(`/projects/${p.id}`)}
                            className="font-serif text-2xl font-bold text-innovexa-ink group-hover:text-innovexa-coral transition-colors cursor-pointer"
                          >
                            {p.title}
                          </h3>
                          <p className="text-xs font-semibold text-innovexa-coral mt-1">
                            Problem: {p.problem_title}
                          </p>
                          <p className="text-xs text-innovexa-ink-muted mt-2 leading-relaxed line-clamp-3">
                            {p.solution_description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-innovexa-border-subtle flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ProjectVoteButtons projectId={p.id} size="sm" />
                          <div className="text-[11px] font-mono text-innovexa-ink-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>~30s</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onOpenReview(p)}
                          className="bg-[#4285F4] hover:bg-[#3367D6] text-white px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider shadow-sm transition-all transform active:scale-95 flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>REVIEW PROJECT →</span>
                        </button>
                      </div>
                    </div>
                  </SlideUp>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* OTHER REVIEW TABS (FEED OF REVIEWS) */
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-innovexa-border p-12 text-center text-xs text-innovexa-ink-muted">
              No perspectives categorized under this tab yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map(r => (
                <div key={r.id} className="bg-white rounded-3xl border border-innovexa-border p-6 shadow-subtle space-y-3">
                  <div className="flex items-center justify-between border-b border-innovexa-border-subtle pb-2.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={r.reviewer_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=e96b7a'}
                        alt={r.reviewer_name}
                        className="w-7 h-7 rounded-full border border-innovexa-border object-cover"
                      />
                      <span className="text-xs font-bold text-innovexa-ink">{r.reviewer_name}</span>
                    </div>
                    <Badge variant="purple">{r.review_type}</Badge>
                  </div>

                  <p className="text-xs text-innovexa-ink leading-relaxed italic">
                    "{r.suggestion || 'No written suggestion attached.'}"
                  </p>

                  <div className="flex items-center justify-between pt-2 text-[10px] font-mono text-innovexa-ink-muted">
                    <span>Quality Score: {r.quality_score}%</span>
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
