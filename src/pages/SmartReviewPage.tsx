import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  MessageSquare,
  ThumbsUp, 
  Flame, 
  AlertCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  Layers,
  Tag,
  Smile,
  Frown,
  Meh,
  Check,
  Shield,
  Palette,
  Zap,
  DollarSign,
  Smartphone,
  Compass,
  ArrowRight,
  Award,
  Lock,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { validationService } from '../services/validationService';
import { FirstReactionType, ProblemRelevanceType, SolutionValueType, SmartReview } from '../types/validation';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';
import { Badge, CategoryBadge, TypeBadge } from '../components/common/Badge';

const IMPROVEMENT_OPTIONS = [
  { id: 'usability', label: 'Easier to use', icon: '✨', desc: 'Streamline interface & workflows' },
  { id: 'design', label: 'Better design', icon: '🎨', desc: 'Modern typography & aesthetics' },
  { id: 'performance', label: 'Better performance', icon: '⚡', desc: 'Faster load times & responsiveness' },
  { id: 'features', label: 'More features', icon: '🧩', desc: 'Expand core capabilities' },
  { id: 'pricing', label: 'Better pricing', icon: '💰', desc: 'More accessible pricing model' },
  { id: 'security', label: 'Better security', icon: '🔐', desc: 'Enterprise trust & privacy' },
  { id: 'mobile', label: 'Better mobile experience', icon: '📱', desc: 'Responsive mobile app layout' },
  { id: 'clarity', label: 'Clearer idea', icon: '💡', desc: 'Sharper value proposition' },
  { id: 'targeting', label: 'Better suited to users', icon: '🎯', desc: 'Target niche audience needs' },
  { id: 'apis', label: 'Open source APIs', icon: '🛠️', desc: 'Developer integration hooks' }
];

const PROBLEM_NO_REASONS = [
  "I don't experience this problem",
  "I already use another solution",
  "The problem isn't clear to me",
  "Other"
];

const SOLUTION_NEEDS_WORK_AREAS = [
  "Core Concept",
  "Features",
  "Usability & UX",
  "Visual Design",
  "Performance",
  "Pricing & Cost"
];

export const SmartReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById, getReviewsByProjectId, refreshProjects } = useProjects();
  const { user } = useAuth();

  const projectId = id || '';
  const project = getProjectById(projectId);
  const projectReviews = projectId ? getReviewsByProjectId(projectId) : [];

  // Step state (1: First Impression, 2: Problem Relevance, 3: Solution Value, 4: Improvement Focus, 5: Summary & Comment, 6: Submitted)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Review Form State
  const [firstReaction, setFirstReaction] = useState<FirstReactionType | null>(null);
  const [problemRelevance, setProblemRelevance] = useState<ProblemRelevanceType | null>(null);
  const [solutionValue, setSolutionValue] = useState<SolutionValueType | null>(null);
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [followUpReason, setFollowUpReason] = useState<string>('');

  // Status state
  const [existingReview, setExistingReview] = useState<SmartReview | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Load existing review if user already reviewed
  useEffect(() => {
    if (projectId && user?.id) {
      validationService.getUserExistingReview(projectId, user.id).then(rev => {
        if (rev) {
          setExistingReview(rev);
          setFirstReaction(rev.first_reaction || null);
          setProblemRelevance((rev.problem_relevance as ProblemRelevanceType) || null);
          setSolutionValue(rev.solution_value || null);
          setSelectedImprovements(rev.selected_improvements || []);
          setComment(rev.comment || rev.suggestion || '');
          if (rev.follow_up_reason) setFollowUpReason(rev.follow_up_reason);
        }
      });
    }
  }, [projectId, user?.id]);

  if (!project) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white border border-[#E3DED5] rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#20202A]">Innovation Project Not Found</h2>
          <p className="text-xs text-[#62616A] leading-relaxed">
            This project may have been moved or is currently in draft mode.
          </p>
          <button 
            onClick={() => navigate('/explore')}
            className="w-full py-2.5 rounded-xl bg-[#20202A] hover:bg-[#2e2e3a] text-white text-xs font-semibold transition-colors"
          >
            ← Explore Other Innovations
          </button>
        </div>
      </div>
    );
  }

  // Auto-advance helper for one-tap selection
  const handleSelectFirstReaction = (val: FirstReactionType) => {
    setFirstReaction(val);
    setTimeout(() => {
      setCurrentStep(2);
    }, 280);
  };

  const handleSelectProblemRelevance = (val: ProblemRelevanceType) => {
    setProblemRelevance(val);
    if (val !== 'no') {
      setTimeout(() => {
        setCurrentStep(3);
      }, 280);
    }
  };

  const handleSelectSolutionValue = (val: SolutionValueType) => {
    setSolutionValue(val);
    if (val !== 'needs_improvement') {
      setTimeout(() => {
        setCurrentStep(4);
      }, 280);
    }
  };

  const toggleImprovement = (label: string) => {
    setSelectedImprovements(prev => 
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  // Submit Review Handler
  const handleSubmitReview = async () => {
    if (!firstReaction || !problemRelevance || !solutionValue) {
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const result = await validationService.submitSmartReview({
        projectId: project.id,
        firstReaction,
        problemRelevance,
        solutionValue,
        selectedImprovements,
        comment: comment.trim() || undefined,
        followUpReason: followUpReason || undefined,
        reviewerId: user?.id || 'anon_' + Math.random().toString(36).slice(2, 7),
        reviewerName: user?.full_name || user?.username || 'Community Innovator',
        reviewerAvatar: user?.avatar_url || undefined,
        reviewerRole: (user as any)?.role || user?.roles?.[0] || 'Peer Reviewer'
      }, project);

      if (result.error) {
        setSubmissionError(result.error);
        setIsSubmitting(false);
      } else {
        await refreshProjects();
        setIsSubmitting(false);
        setCurrentStep(6); // Success screen
      }
    } catch (err: any) {
      console.error('Review submission error:', err);
      setSubmissionError('Your feedback could not be saved to the database. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Humanized community review count
  const reviewsCount = projectReviews.length;
  const reviewCountText = reviewsCount === 0
    ? 'Be the first person to share feedback.'
    : reviewsCount === 1
    ? '1 innovator has shared their perspective.'
    : `${reviewsCount} innovators have shared their perspective.`;

  const validationScore = project.validation_score || project.readiness_score || 55;

  return (
    <div className="space-y-6 pb-20 text-[#20202A]">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#62616A] hover:text-[#20202A] transition-colors p-1 -ml-1 rounded-lg hover:bg-[#F7F4EE]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {project.title}</span>
        </button>
      </div>

      {/* Hero Header Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3 mb-6">
        <SlideUp>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8875E8]/10 border border-[#8875E8]/20 text-[#8875E8] text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Innovation Validation</span>
          </div>
          <h1 
            style={{
              fontFamily: 'var(--font-display, "DM Serif Display", serif)',
              fontWeight: 400,
              fontSize: 'clamp(28px, 4vw, 40px)',
              color: 'var(--color-ink, #20202A)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            HELP SHAPE THIS INNOVATION
          </h1>
          <p className="text-xs sm:text-sm text-[#62616A] max-w-xl mx-auto leading-relaxed">
            Your quick perspective helps the creator validate real demand and build a significantly better product.
          </p>
        </SlideUp>

        {/* Compact Project Summary Card */}
        <SlideUp delay={0.1}>
          <div className="mt-4 bg-white border border-[#E3DED5] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <img
                src={project.cover_image_url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80'}
                alt={project.title}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-[#E3DED5] flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-[#F7F4EE] text-[#62616A] font-semibold border border-[#E3DED5]">
                    {project.category}
                  </span>
                  <span className="text-[11px] text-[#8C8990] capitalize">
                    {project.project_type || 'Product'} • by {project.owner_name || 'Innovator'}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#20202A] truncate">
                  {project.title}
                </h3>
                <p className="text-xs text-[#62616A] line-clamp-1 mt-0.5">
                  {project.problem_description || project.solution_description}
                </p>
              </div>
            </div>

            {/* Validation Score & Count Badges */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E3DED5] gap-1 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <Flame className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono">{validationScore}% Validation</span>
              </div>
              <span className="text-[11px] text-[#62616A] font-mono">
                {reviewCountText}
              </span>
            </div>
          </div>
        </SlideUp>

        {/* Existing Review Banner */}
        {existingReview && currentStep !== 6 && !isEditingExisting && (
          <SlideUp delay={0.15}>
            <div className="mt-3 p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-purple-900">You have already shared feedback on this project.</div>
                  <div className="text-[11px] text-purple-700">You can update your perspective at any time as the project evolves.</div>
                </div>
              </div>
              <button
                onClick={() => setIsEditingExisting(true)}
                className="px-3 py-1.5 bg-[#8875E8] hover:bg-[#7863df] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 flex-shrink-0 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update Feedback</span>
              </button>
            </div>
          </SlideUp>
        )}
      </section>

      {/* Main Review Wizard Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6">
        
        {/* Step Progress Indicator (Hidden on Success Step 6) */}
        {currentStep <= 5 && (
          <div className="mb-6 bg-white border border-[#E3DED5] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-[#20202A] mb-2.5">
              <span className="text-[#8875E8] font-mono uppercase tracking-wider">
                STEP {currentStep} OF 4
              </span>
              <span className="text-[#62616A] font-medium">
                {currentStep === 1 && 'First Impression'}
                {currentStep === 2 && 'Problem Relevance'}
                {currentStep === 3 && 'Solution Value'}
                {currentStep === 4 && 'Improvement Focus'}
                {currentStep === 5 && 'Summary & Perspective'}
              </span>
            </div>

            {/* Smooth Progress Indicator Dots & Lines */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((stepNum) => {
                const isCompleted = currentStep > stepNum;
                const isCurrent = currentStep === stepNum;
                return (
                  <React.Fragment key={stepNum}>
                    <button
                      onClick={() => {
                        if (stepNum < currentStep) setCurrentStep(stepNum);
                      }}
                      disabled={stepNum > currentStep}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-[#8875E8] text-white'
                          : isCurrent
                          ? 'bg-[#8875E8]/15 text-[#8875E8] ring-2 ring-[#8875E8]'
                          : 'bg-[#F7F4EE] text-[#8C8990]'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                    </button>
                    {stepNum < 4 && (
                      <div className="flex-1 h-1 rounded-full bg-[#E3DED5] overflow-hidden">
                        <div 
                          className="h-full bg-[#8875E8] transition-all duration-500"
                          style={{ width: currentStep > stepNum ? '100%' : '0%' }}
                        ></div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {submissionError && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{submissionError}</span>
          </div>
        )}

        {/* Dynamic Question Card with Animated Transitions */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1: FIRST IMPRESSION */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-[#E3DED5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div className="text-center space-y-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8875E8]">Step 1 of 4</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#20202A]">
                  What&apos;s your first reaction?
                </h2>
                <p className="text-xs sm:text-sm text-[#62616A]">
                  Select your immediate gut reaction to this concept.
                </p>
              </div>

              {/* Three Large Visual Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                {[
                  {
                    id: 'interesting' as FirstReactionType,
                    emoji: '😊',
                    title: 'INTERESTING',
                    subtitle: 'Shows high promise and solid potential',
                    color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900',
                    selectedRing: 'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-400'
                  },
                  {
                    id: 'not_sure' as FirstReactionType,
                    emoji: '🤔',
                    title: 'NOT SURE',
                    subtitle: 'Needs more clarity or evidence to convince',
                    color: 'border-amber-200 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-50 text-amber-900',
                    selectedRing: 'ring-2 ring-amber-500 bg-amber-50 border-amber-400'
                  },
                  {
                    id: 'needs_improvement' as FirstReactionType,
                    emoji: '😕',
                    title: 'NEEDS WORK',
                    subtitle: 'Core execution or positioning needs rethinking',
                    color: 'border-rose-200 hover:border-rose-400 bg-rose-50/50 hover:bg-rose-50 text-rose-900',
                    selectedRing: 'ring-2 ring-rose-500 bg-rose-50 border-rose-400'
                  }
                ].map((opt) => {
                  const isSelected = firstReaction === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectFirstReaction(opt.id)}
                      className={`p-5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-3 group hover:scale-[1.02] active:scale-[0.98] shadow-sm ${
                        isSelected ? opt.selectedRing : opt.color
                      }`}
                    >
                      <span className="text-4xl group-hover:scale-125 transition-transform duration-200">
                        {opt.emoji}
                      </span>
                      <div>
                        <div className="text-sm font-extrabold text-[#20202A] tracking-wide">
                          {opt.title}
                        </div>
                        <div className="text-[11px] text-[#62616A] mt-1 leading-snug">
                          {opt.subtitle}
                        </div>
                      </div>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-[#8875E8] border-[#8875E8] text-white' : 'border-[#E3DED5] bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: PROBLEM RELEVANCE */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-[#E3DED5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div className="text-center space-y-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8875E8]">Step 2 of 4</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#20202A]">
                  Does this solve a problem that matters?
                </h2>
                <p className="text-xs sm:text-sm text-[#62616A]">
                  Is the target problem real, urgent, and worth solving?
                </p>
              </div>

              {/* Problem Statement Reference Box */}
              <div className="p-3.5 rounded-xl bg-[#F7F4EE] border border-[#E3DED5] text-xs text-[#40404C] leading-relaxed">
                <strong className="text-[#8875E8]">Target Problem:</strong> {project.problem_description || project.problem_title}
              </div>

              {/* Three Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  {
                    id: 'yes' as ProblemRelevanceType,
                    icon: '🎯',
                    title: 'YES',
                    subtitle: 'This problem matters to me or my peers',
                    color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/50 text-emerald-900',
                    selectedRing: 'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-400'
                  },
                  {
                    id: 'maybe' as ProblemRelevanceType,
                    icon: '⚖️',
                    title: 'MAYBE',
                    subtitle: 'I can see the need in specific contexts',
                    color: 'border-amber-200 hover:border-amber-400 bg-amber-50/50 text-amber-900',
                    selectedRing: 'ring-2 ring-amber-500 bg-amber-50 border-amber-400'
                  },
                  {
                    id: 'no' as ProblemRelevanceType,
                    icon: '🚫',
                    title: 'NO',
                    subtitle: "I don't experience this problem",
                    color: 'border-[#E3DED5] hover:border-[#8C8990] bg-[#F7F4EE] text-[#62616A]',
                    selectedRing: 'ring-2 ring-slate-400 bg-[#EFEAE2]'
                  }
                ].map((opt) => {
                  const isSelected = problemRelevance === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectProblemRelevance(opt.id)}
                      className={`p-5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-3 group hover:scale-[1.02] active:scale-[0.98] shadow-sm ${
                        isSelected ? opt.selectedRing : opt.color
                      }`}
                    >
                      <span className="text-3xl">{opt.icon}</span>
                      <div>
                        <div className="text-sm font-extrabold text-[#20202A] tracking-wide">{opt.title}</div>
                        <div className="text-[11px] text-[#62616A] mt-1 leading-snug">{opt.subtitle}</div>
                      </div>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-[#8875E8] border-[#8875E8] text-white' : 'border-[#E3DED5] bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Adaptive Follow-up for 'NO' */}
              {problemRelevance === 'no' && (
                <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E3DED5] space-y-2.5 animate-fade-in">
                  <span className="text-xs font-semibold text-[#20202A] block">
                    What&apos;s the main reason? (Optional)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PROBLEM_NO_REASONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFollowUpReason(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          followUpReason === r
                            ? 'bg-[#8875E8] text-white border border-[#8875E8]'
                            : 'bg-white text-[#62616A] hover:text-[#20202A] border border-[#E3DED5]'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2 bg-[#8875E8] hover:bg-[#7863df] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: SOLUTION VALUE */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-[#E3DED5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div className="text-center space-y-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8875E8]">Step 3 of 4</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#20202A]">
                  Would this solution be useful to you?
                </h2>
                <p className="text-xs sm:text-sm text-[#62616A]">
                  How compelling is the proposed product approach?
                </p>
              </div>

              {/* Solution Summary Box */}
              <div className="p-3.5 rounded-xl bg-[#F7F4EE] border border-[#E3DED5] text-xs text-[#40404C] leading-relaxed">
                <strong className="text-[#8875E8]">Proposed Solution:</strong> {project.solution_description || project.value_proposition}
              </div>

              {/* Three Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  {
                    id: 'very_useful' as SolutionValueType,
                    icon: '🔥',
                    title: 'VERY USEFUL',
                    subtitle: 'High utility, would test or adopt early',
                    color: 'border-purple-200 hover:border-purple-400 bg-purple-50/50 text-purple-900',
                    selectedRing: 'ring-2 ring-purple-500 bg-purple-50 border-purple-400'
                  },
                  {
                    id: 'useful' as SolutionValueType,
                    icon: '👍',
                    title: 'USEFUL',
                    subtitle: 'Solves the workflow adequately',
                    color: 'border-blue-200 hover:border-blue-400 bg-blue-50/50 text-blue-900',
                    selectedRing: 'ring-2 ring-blue-500 bg-blue-50 border-blue-400'
                  },
                  {
                    id: 'needs_improvement' as SolutionValueType,
                    icon: '🤔',
                    title: 'NEEDS WORK',
                    subtitle: 'Unclear value or missing core capabilities',
                    color: 'border-amber-200 hover:border-amber-400 bg-amber-50/50 text-amber-900',
                    selectedRing: 'ring-2 ring-amber-500 bg-amber-50 border-amber-400'
                  }
                ].map((opt) => {
                  const isSelected = solutionValue === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectSolutionValue(opt.id)}
                      className={`p-5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-3 group hover:scale-[1.02] active:scale-[0.98] shadow-sm ${
                        isSelected ? opt.selectedRing : opt.color
                      }`}
                    >
                      <span className="text-3xl">{opt.icon}</span>
                      <div>
                        <div className="text-sm font-extrabold text-[#20202A] tracking-wide">{opt.title}</div>
                        <div className="text-[11px] text-[#62616A] mt-1 leading-snug">{opt.subtitle}</div>
                      </div>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-[#8875E8] border-[#8875E8] text-white' : 'border-[#E3DED5] bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Adaptive Follow-up for 'needs_improvement' */}
              {solutionValue === 'needs_improvement' && (
                <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E3DED5] space-y-2.5 animate-fade-in">
                  <span className="text-xs font-semibold text-[#20202A] block">
                    What needs the most improvement? (Optional)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SOLUTION_NEEDS_WORK_AREAS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setFollowUpReason(a)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          followUpReason === a
                            ? 'bg-[#8875E8] text-white border border-[#8875E8]'
                            : 'bg-white text-[#62616A] hover:text-[#20202A] border border-[#E3DED5]'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="px-4 py-2 bg-[#8875E8] hover:bg-[#7863df] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: WHAT SHOULD IMPROVE? */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-[#E3DED5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div className="text-center space-y-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8875E8]">Step 4 of 4</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#20202A]">
                  If you could improve ONE thing, what would it be?
                </h2>
                <p className="text-xs sm:text-sm text-[#62616A]">
                  Select the key areas that would create the highest value for this project.
                </p>
              </div>

              {/* Grid of Interactive Improvement Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {IMPROVEMENT_OPTIONS.map((opt) => {
                  const isSelected = selectedImprovements.includes(opt.label);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleImprovement(opt.label)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#8875E8] bg-[#8875E8]/10 ring-1 ring-[#8875E8] text-[#20202A] shadow-sm'
                          : 'border-[#E3DED5] bg-[#F7F4EE]/60 text-[#40404C] hover:border-[#8875E8]/50 hover:bg-[#F7F4EE]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{opt.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-[#20202A]">{opt.label}</div>
                          <div className="text-[11px] text-[#62616A]">{opt.desc}</div>
                        </div>
                      </div>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-[#8875E8] border-[#8875E8] text-white' : 'border-[#E3DED5] bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Continue Button */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E3DED5]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-[#62616A] hover:text-[#20202A] font-semibold transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-2.5 bg-[#8875E8] hover:bg-[#7863df] text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2"
                >
                  <span>Continue to Summary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: OPTIONAL PERSPECTIVE & LIVE FEEDBACK SUMMARY */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-[#E3DED5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div className="text-center space-y-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8875E8]">Final Step</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#20202A]">
                  Anything else you&apos;d like to tell the creator?
                </h2>
                <p className="text-xs sm:text-sm text-[#62616A]">
                  Optional — even one sentence provides valuable qualitative context.
                </p>
              </div>

              {/* Optional Textarea */}
              <div>
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder="What is one concrete change or next step you would suggest?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-[#F7F4EE] border border-[#E3DED5] rounded-2xl p-4 text-xs text-[#20202A] placeholder-[#8C8990] focus:outline-none focus:border-[#8875E8] leading-relaxed"
                />
                <div className="flex items-center justify-between text-[11px] text-[#8C8990] mt-1 px-1">
                  <span>Keep it constructive and actionable</span>
                  <span className="font-mono">{comment.length} / 300</span>
                </div>
              </div>

              {/* Live Feedback Summary Card */}
              <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#E3DED5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#20202A] flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Your Perspective Summary</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[11px] font-semibold text-[#8875E8] hover:text-[#7863df] transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Choices</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-[#E3DED5]">
                    <span className="text-[10px] text-[#8C8990] uppercase block font-semibold font-mono">Reaction</span>
                    <span className="font-bold text-[#20202A] capitalize mt-0.5 block">
                      {firstReaction === 'interesting' ? '😊 Interesting' : firstReaction === 'not_sure' ? '🤔 Not Sure' : '😕 Needs Work'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#E3DED5]">
                    <span className="text-[10px] text-[#8C8990] uppercase block font-semibold font-mono">Problem Relevance</span>
                    <span className="font-bold text-[#20202A] capitalize mt-0.5 block">
                      {problemRelevance === 'yes' ? '🎯 Yes, Matters' : problemRelevance === 'maybe' ? '⚖️ Maybe' : '🚫 No'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#E3DED5]">
                    <span className="text-[10px] text-[#8C8990] uppercase block font-semibold font-mono">Solution Value</span>
                    <span className="font-bold text-[#20202A] capitalize mt-0.5 block">
                      {solutionValue === 'very_useful' ? '🔥 Very Useful' : solutionValue === 'useful' ? '👍 Useful' : '🤔 Needs Work'}
                    </span>
                  </div>
                </div>

                {selectedImprovements.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] text-[#8C8990] uppercase block font-semibold mb-1.5 font-mono">Selected Improvements</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedImprovements.map(imp => (
                        <span key={imp} className="text-[11px] px-2 py-0.5 rounded-md bg-white text-[#20202A] border border-[#E3DED5]">
                          {imp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Privacy Notice */}
              <div className="text-[11px] text-[#62616A] bg-[#F7F4EE] p-3 rounded-xl border border-[#E3DED5] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#8875E8] flex-shrink-0" />
                <span>
                  Your feedback is analyzed securely by INNOVEXA AI to identify recurring opportunities for the creator without exposing private data.
                </span>
              </div>

              {/* Submission CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E3DED5]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-xs text-[#62616A] hover:text-[#20202A] font-semibold transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitReview}
                  className="px-6 py-3 bg-[#8875E8] hover:bg-[#7863df] text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Feedback...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{existingReview ? 'Update My Feedback' : 'Share My Feedback'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: SUBMISSION CELEBRATION & SUCCESS STATE */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-[#E3DED5] rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6"
            >
              {/* Animated Success Badge */}
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#20202A]">
                  THANK YOU!
                </h2>
                <p className="text-sm text-[#62616A] max-w-md mx-auto leading-relaxed">
                  Your feedback is now part of this innovation&apos;s journey.
                </p>
              </div>

              {/* Status Verification Checklist */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#F7F4EE] border border-[#E3DED5] text-left space-y-2.5 text-xs text-[#40404C]">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Feedback successfully recorded & verified</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>AI Sentiment & Intent analysis clustered into insights</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>The creator will use your perspective to build the next iteration</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#F7F4EE] hover:bg-[#EFEAE2] text-[#20202A] rounded-xl text-xs font-semibold transition-colors border border-[#E3DED5]"
                >
                  View Project
                </button>
                <button
                  onClick={() => navigate(`/projects/${project.id}/validation`)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#8875E8]/10 hover:bg-[#8875E8]/20 text-[#8875E8] border border-[#8875E8]/30 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>View Validation Insights</span>
                </button>
                <button
                  onClick={() => navigate('/explore')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#8875E8] hover:bg-[#7863df] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Explore More Innovations
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>
    </div>
  );
};
