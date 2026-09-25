import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, ArrowLeft, Sparkles, MessageSquare, AlertCircle, ThumbsUp, ThumbsDown, Star, HelpCircle, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project, ProblemRelevance, SolutionClarity, Usefulness, ReviewCategoryType } from '../../types/database';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { CategoryBadge, TypeBadge } from '../common/Badge';

interface ReviewModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ 
  project, 
  isOpen, 
  onClose,
  onSuccess 
}) => {
  const { submitReview, reviews } = useProjects();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'write' | 'view'>('write');
  const [step, setStep] = useState(1);
  const [problemRelevance, setProblemRelevance] = useState<ProblemRelevance>('yes');
  const [solutionClarity, setSolutionClarity] = useState<SolutionClarity>('yes');
  const [usefulness, setUsefulness] = useState<Usefulness>('yes');
  const [suggestion, setSuggestion] = useState('');
  const [reviewType, setReviewType] = useState<ReviewCategoryType>('constructive');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const isOwnProject = user && project.owner_id === user.id;
  const projectReviews = reviews.filter(r => r.project_id === project.id);
  const alreadyReviewed = reviews.some(r => r.project_id === project.id && r.reviewer_id === (user?.id || 'reviewer-guest'));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const res = await submitReview({
      projectId: project.id,
      problemRelevance,
      solutionClarity,
      usefulness,
      suggestion: suggestion.trim() || undefined,
      reviewType
    });

    setSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSubmitted(true);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#34A853', '#4285F4', '#FBBC05', '#EA4335']
      });
      if (onSuccess) onSuccess();
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSubmitted(false);
    setError(null);
    setSuggestion('');
    setActiveTab('write');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181924]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E0D6] rounded-3xl w-full max-w-lg shadow-float overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#E5E0D6] flex items-center justify-between bg-[#FAF8F5]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#4285F4] uppercase font-bold bg-[#4285F4]/10 px-2 py-0.5 rounded-md">
                COMMUNITY REVIEW
              </span>
              <span className="text-xs text-[#8E90A2]">
                • {projectReviews.length} reviews
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-[#181924] line-clamp-1">
              {project.title}
            </h3>
          </div>

          <button 
            onClick={resetAndClose}
            className="p-2 rounded-full hover:bg-white text-[#8E90A2] hover:text-[#181924] transition-colors border border-transparent hover:border-[#E5E0D6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Write Review vs View All Reviews) */}
        <div className="flex items-center border-b border-[#E5E0D6] px-6 bg-[#FAF8F5]/50">
          <button
            onClick={() => setActiveTab('write')}
            className={`py-2.5 px-4 font-mono text-xs font-bold border-b-2 transition-all ${
              activeTab === 'write'
                ? 'border-[#4285F4] text-[#4285F4]'
                : 'border-transparent text-[#8E90A2] hover:text-[#181924]'
            }`}
          >
            ✍️ Write Review
          </button>

          <button
            onClick={() => setActiveTab('view')}
            className={`py-2.5 px-4 font-mono text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'view'
                ? 'border-[#4285F4] text-[#4285F4]'
                : 'border-transparent text-[#8E90A2] hover:text-[#181924]'
            }`}
          >
            <span>💬 All Reviews</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#E5E0D6] text-[10px] text-[#555768]">
              {projectReviews.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'view' ? (
            /* View All Reviews Tab */
            <div className="space-y-3">
              {projectReviews.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center mx-auto text-xl">
                    💡
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#181924]">No reviews yet</h4>
                  <p className="text-xs text-[#8E90A2] max-w-xs mx-auto">
                    Be the first innovator to leave a quick perspective on this project!
                  </p>
                  <button
                    onClick={() => setActiveTab('write')}
                    className="px-4 py-2 rounded-xl bg-[#4285F4] text-white font-mono text-xs font-bold shadow-sm"
                  >
                    Write First Review →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D6] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#4285F4]/20 text-[#4285F4] font-bold text-xs flex items-center justify-center font-mono">
                            {rev.reviewer_name?.slice(0, 1) || 'U'}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#181924] block">{rev.reviewer_name}</span>
                            <span className="text-[10px] font-mono text-[#8E90A2]">{new Date(rev.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-[#E5E0D6] text-[#555768] uppercase">
                          {rev.review_type}
                        </span>
                      </div>

                      {/* Signal pill answers */}
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-white border border-[#E5E0D6] text-[#555768]">
                          Problem: <strong className={rev.problem_relevance === 'yes' ? 'text-[#34A853]' : 'text-[#8E90A2]'}>{rev.problem_relevance.toUpperCase()}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-[#E5E0D6] text-[#555768]">
                          Solution: <strong className={rev.solution_clarity === 'yes' || rev.solution_value === 'very_useful' ? 'text-[#34A853]' : 'text-[#8E90A2]'}>{(rev.solution_clarity || rev.solution_value || 'N/A').toUpperCase()}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-[#E5E0D6] text-[#555768]">
                          Would Use: <strong className={rev.usefulness === 'yes' || rev.solution_value === 'very_useful' ? 'text-[#34A853]' : 'text-[#8E90A2]'}>{(rev.usefulness || rev.solution_value || 'N/A').toUpperCase()}</strong>
                        </span>
                      </div>

                      {rev.suggestion && (
                        <p className="text-xs text-[#555768] bg-white p-2.5 rounded-xl border border-[#E5E0D6] italic">
                          "{rev.suggestion}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Write Review Tab */
            <>
              {/* Validation Warnings */}
              {isOwnProject && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold">You are the creator of this project</p>
                    <p className="text-amber-800/90 mt-0.5">Creators cannot review their own project to keep community validation objective.</p>
                  </div>
                </div>
              )}

              {alreadyReviewed && !submitted && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-blue-900">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold">You already reviewed this project</p>
                    <p className="text-blue-800/90 mt-0.5">Your perspective has been recorded. Check the "All Reviews" tab to see community feedback!</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {error}
                </div>
              )}

              {submitted ? (
                /* Success State */
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-serif text-2xl font-bold text-[#181924]">
                      THANK YOU FOR REVIEWING!
                    </h4>
                    <p className="text-xs text-[#555768] max-w-sm mx-auto mt-2 leading-relaxed">
                      Your answers have helped validate <strong>{project.title}</strong>. You've earned <strong>+20 Reputation Points</strong>.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setActiveTab('view')}
                      className="bg-white border border-[#E5E0D6] hover:bg-[#FAF8F5] text-[#181924] px-5 py-2.5 rounded-full text-xs font-mono font-bold transition-all"
                    >
                      View All Reviews
                    </button>
                    <button
                      onClick={resetAndClose}
                      className="bg-[#181924] hover:bg-black text-white px-6 py-2.5 rounded-full text-xs font-mono font-bold transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* 4 Simple Questions Flow */
                <div className="space-y-5">
                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8E90A2]">
                      <span>SIMPLE QUESTION {step} OF 4</span>
                      <span className="font-bold text-[#4285F4]">{Math.round((step / 4) * 100)}%</span>
                    </div>
                    <div className="w-full bg-[#E5E0D6] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#4285F4] h-full transition-all duration-300 rounded-full"
                        style={{ width: `${(step / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question 1: Problem */}
                  {step === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D6]">
                        <span className="text-[10px] font-mono text-[#8E90A2] uppercase block font-bold">The Problem:</span>
                        <p className="text-xs text-[#181924] mt-1 leading-relaxed">
                          "{project.problem_description || project.problem_title}"
                        </p>
                      </div>

                      <h4 className="font-serif text-base sm:text-lg font-bold text-[#181924]">
                        1. Is this a real problem people face?
                      </h4>

                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { value: 'yes', emoji: '🔥', label: 'YES', desc: 'Real & painful' },
                          { value: 'sometimes', emoji: '⚡', label: 'SOMETIMES', desc: 'Occasional' },
                          { value: 'no', emoji: '🤷', label: 'NO', desc: 'Rare or minor' }
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setProblemRelevance(opt.value as ProblemRelevance);
                              setStep(2);
                            }}
                            className={`p-4 rounded-2xl border text-center transition-all ${
                              problemRelevance === opt.value
                                ? 'border-[#4285F4] bg-[#4285F4]/10 text-[#4285F4] font-bold shadow-sm'
                                : 'border-[#E5E0D6] hover:border-[#4285F4]/40 bg-white text-[#181924]'
                            }`}
                          >
                            <span className="text-2xl block mb-1">{opt.emoji}</span>
                            <div className="text-xs font-bold font-mono">{opt.label}</div>
                            <div className="text-[10px] text-[#8E90A2] mt-0.5">{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Question 2: Solution */}
                  {step === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D6]">
                        <span className="text-[10px] font-mono text-[#8E90A2] uppercase block font-bold">The Solution:</span>
                        <p className="text-xs text-[#181924] mt-1 leading-relaxed">
                          "{project.solution_description}"
                        </p>
                      </div>

                      <h4 className="font-serif text-base sm:text-lg font-bold text-[#181924]">
                        2. Is this solution clear and achievable?
                      </h4>

                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { value: 'yes', emoji: '🚀', label: 'YES', desc: 'Clear & realistic' },
                          { value: 'partially', emoji: '💡', label: 'PARTIALLY', desc: 'Needs detail' },
                          { value: 'no', emoji: '❓', label: 'NO', desc: 'Unclear approach' }
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSolutionClarity(opt.value as SolutionClarity);
                              setStep(3);
                            }}
                            className={`p-4 rounded-2xl border text-center transition-all ${
                              solutionClarity === opt.value
                                ? 'border-[#4285F4] bg-[#4285F4]/10 text-[#4285F4] font-bold shadow-sm'
                                : 'border-[#E5E0D6] hover:border-[#4285F4]/40 bg-white text-[#181924]'
                            }`}
                          >
                            <span className="text-2xl block mb-1">{opt.emoji}</span>
                            <div className="text-xs font-bold font-mono">{opt.label}</div>
                            <div className="text-[10px] text-[#8E90A2] mt-0.5">{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Question 3: Adoption / Interest */}
                  {step === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D6]">
                        <span className="text-[10px] font-mono text-[#8E90A2] uppercase block font-bold">Value Proposition:</span>
                        <p className="text-xs text-[#181924] mt-1 leading-relaxed">
                          "{project.value_proposition || project.differentiation}"
                        </p>
                      </div>

                      <h4 className="font-serif text-base sm:text-lg font-bold text-[#181924]">
                        3. Would you use or recommend this?
                      </h4>

                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { value: 'yes', emoji: '⭐', label: 'YES', desc: 'High interest' },
                          { value: 'maybe', emoji: '🤔', label: 'MAYBE', desc: 'Depends on MVP' },
                          { value: 'no', emoji: '❌', label: 'NO', desc: 'Not for me' }
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setUsefulness(opt.value as Usefulness);
                              setStep(4);
                            }}
                            className={`p-4 rounded-2xl border text-center transition-all ${
                              usefulness === opt.value
                                ? 'border-[#4285F4] bg-[#4285F4]/10 text-[#4285F4] font-bold shadow-sm'
                                : 'border-[#E5E0D6] hover:border-[#4285F4]/40 bg-white text-[#181924]'
                            }`}
                          >
                            <span className="text-2xl block mb-1">{opt.emoji}</span>
                            <div className="text-xs font-bold font-mono">{opt.label}</div>
                            <div className="text-[10px] text-[#8E90A2] mt-0.5">{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Question 4: Quick Feedback & Suggestions */}
                  {step === 4 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <h4 className="font-serif text-base sm:text-lg font-bold text-[#181924]">
                        4. Any quick suggestions or thoughts?
                      </h4>
                      <p className="text-xs text-[#8E90A2]">
                        Optional. Help the creator refine their next version with 1 actionable idea.
                      </p>

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-[#8E90A2] block uppercase font-bold">Feedback Type</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { id: 'constructive', label: '💡 Suggestion' },
                            { id: 'suggestion', label: '✨ Feature' },
                            { id: 'question', label: '❓ Question' },
                            { id: 'praise', label: '👏 Praise' },
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setReviewType(t.id as ReviewCategoryType)}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold border transition-colors ${
                                reviewType === t.id
                                  ? 'bg-[#4285F4] text-white border-[#4285F4]'
                                  : 'bg-white text-[#555768] border-[#E5E0D6] hover:border-[#4285F4]/40'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        placeholder="e.g. Consider adding one-click export to Notion or support for local offline storage..."
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        className="w-full p-3.5 bg-[#FAF8F5] focus:bg-white border border-[#E5E0D6] focus:border-[#4285F4] rounded-2xl text-xs text-[#181924] placeholder:text-[#8E90A2] outline-none transition-all resize-none"
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {activeTab === 'write' && !submitted && (
          <div className="p-4 px-6 border-t border-[#E5E0D6] bg-[#FAF8F5] flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#555768] hover:text-[#181924] px-3 py-1.5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 bg-[#4285F4] hover:bg-[#3367D6] text-white px-5 py-2 rounded-full text-xs font-mono font-bold tracking-wide transition-all shadow-sm"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-[#34A853] hover:bg-[#2E8B46] text-white px-6 py-2.5 rounded-full text-xs font-mono font-bold tracking-wide transition-all shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Review (+20 pts)'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

