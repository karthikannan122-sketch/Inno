import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Lightbulb, 
  Layers, 
  Users, 
  Target, 
  Link as LinkIcon, 
  Code2, 
  Globe,
  Save,
  Check,
  Zap,
  HelpCircle,
  Eye,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProjects } from '../context/ProjectContext';
import { ProjectType } from '../types/database';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';
import { Badge, CategoryBadge, TypeBadge } from '../components/common/Badge';
import { SimilarSolutionsDifferentiator } from '../components/projects/SimilarSolutionsDifferentiator';
import { ProjectVoteButtons } from '../components/projects/ProjectVoteButtons';

interface CreateProjectPageProps {
  onSuccess?: (projectId: string) => void;
  onCancel?: () => void;
}

interface StepMeta {
  number: number;
  label: string;
  shortLabel: string;
  tagline: string;
}

const STEPS: StepMeta[] = [
  { number: 1, label: 'Problem Statement', shortLabel: 'Problem', tagline: 'Observe pain point' },
  { number: 2, label: 'Classification', shortLabel: 'Classify', tagline: 'Stage & form' },
  { number: 3, label: 'Solution Architecture', shortLabel: 'Solution', tagline: 'Name & features' },
  { number: 4, label: 'Target Audience', shortLabel: 'Audience', tagline: 'User persona' },
  { number: 5, label: 'Differentiation', shortLabel: 'UVP', tagline: 'Value proposition' },
  { number: 6, label: 'Live Artifacts', shortLabel: 'Artifacts', tagline: 'URLs & Repos' },
  { number: 7, label: 'Review & Launch', shortLabel: 'Launch', tagline: 'Verify & publish' }
];

export const CreateProjectPage: React.FC<CreateProjectPageProps> = ({ 
  onSuccess: propOnSuccess, 
  onCancel: propOnCancel 
}) => {
  const params = useParams<{ id: string }>();
  const routerNavigate = useNavigate();
  const { createProject, updateProject, getProjectById } = useProjects();

  const editId = params.id;
  const onSuccess = propOnSuccess || ((id: string) => routerNavigate(`/projects/${id}`));
  const onCancel = propOnCancel || (() => routerNavigate('/home'));

  const [step, setStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [problemTitle, setProblemTitle] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('product');
  const [title, setTitle] = useState('');
  const [solutionDescription, setSolutionDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tagsInput, setTagsInput] = useState('Tech, Innovation, SaaS');
  const [targetAudience, setTargetAudience] = useState('');
  const [valueProposition, setValueProposition] = useState('');
  const [differentiation, setDifferentiation] = useState('');
  const [hasLiveLink, setHasLiveLink] = useState<'yes' | 'no'>('no');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80');

  const categories = [
    'Technology',
    'Artificial Intelligence',
    'Education',
    'Sustainability',
    'Healthcare',
    'Finance',
    'Productivity',
    'Community',
    'Design',
    'Agriculture',
    'Innovation'
  ];

  // Load existing project if in edit mode or prefill from AI Research
  useEffect(() => {
    if (editId) {
      const existing = getProjectById(editId);
      if (existing) {
        setTitle(existing.title || '');
        setProblemTitle(existing.problem_title || '');
        setProblemDescription(existing.problem_description || '');
        setProjectType(existing.project_type || 'product');
        setCategory(existing.category || 'Technology');
        setSolutionDescription(existing.solution_description || '');
        setTargetAudience(existing.target_audience || '');
        setValueProposition(existing.value_proposition || '');
        setDifferentiation(existing.differentiation || '');
        setTagsInput(existing.tags ? existing.tags.join(', ') : '');
        if (existing.live_url) {
          setHasLiveLink('yes');
          setLiveUrl(existing.live_url);
        }
        if (existing.github_url) setGithubUrl(existing.github_url);
        if (existing.demo_url) setDemoUrl(existing.demo_url);
        if (existing.cover_image_url) setCoverImageUrl(existing.cover_image_url);
      }
    } else {
      // Check if arriving from AI Research prefill
      try {
        const rawPrefill = sessionStorage.getItem('innovexa_create_prefill');
        if (rawPrefill) {
          const prefill = JSON.parse(rawPrefill);
          if (prefill.title) setTitle(prefill.title);
          if (prefill.problem_title) setProblemTitle(prefill.problem_title);
          if (prefill.problem_description) setProblemDescription(prefill.problem_description);
          if (prefill.solution_description) setSolutionDescription(prefill.solution_description);
          if (prefill.target_audience) setTargetAudience(prefill.target_audience);
          if (prefill.value_proposition) setValueProposition(prefill.value_proposition);
          if (prefill.differentiation) setDifferentiation(prefill.differentiation);
          sessionStorage.removeItem('innovexa_create_prefill');
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }
  }, [editId, getProjectById]);

  // Update max visited step for clickable stepper
  useEffect(() => {
    if (step > maxVisitedStep) {
      setMaxVisitedStep(step);
    }
  }, [step, maxVisitedStep]);

  const loadExampleTemplate = (type: 'edtech' | 'sustainability' | 'ai') => {
    if (type === 'edtech') {
      setProblemTitle('Students struggle to organize study schedules, spaced repetition, and lecture notes.');
      setProblemDescription('University students juggling 4+ heavy STEM courses fail to retain 60% of lecture materials within 14 days due to uncoordinated deadlines and manual note revision.');
      setProjectType('product');
      setTitle('StudyFlow AI');
      setCategory('Education');
      setTagsInput('AI, EdTech, SpacedRepetition, Study');
      setSolutionDescription('An automated study companion that ingests course syllabi and slides to generate spaced-repetition schedules and active recall flashcards directly synced with calendar alerts.');
      setTargetAudience('Undergraduate & graduate students in STEM disciplines preparing for exams.');
      setValueProposition('Cuts weekly study planning time from 4 hours to 10 minutes while improving test retention by 40%.');
      setDifferentiation('Unlike generic Notion templates or Anki, StudyFlow automatically extracts high-yield exam concepts directly from course slides.');
      setHasLiveLink('yes');
      setLiveUrl('https://studyflow-preview.app');
    } else if (type === 'sustainability') {
      setProblemTitle('Neighborhood grocery stores discard edible produce daily due to lack of local discounted distribution.');
      setProblemDescription('Urban bakeries and grocers discard up to 30% of daily perishable goods before expiration because standard retail pricing cannot adapt dynamically.');
      setProjectType('startup');
      setTitle('FoodRescue Hub');
      setCategory('Sustainability');
      setTagsInput('Sustainability, CircularEconomy, FoodTech');
      setSolutionDescription('A real-time flash markdown marketplace alerting local consumers to surplus baked items within 1 km for 15-minute express pickups.');
      setTargetAudience('Budget-conscious urban foodies and sustainable living advocates.');
      setValueProposition('Saves shoppers 50% on fresh food while eliminating commercial dumpster waste.');
      setDifferentiation('Zero upfront hardware fees for merchants with instant SMS inventory alerts.');
      setHasLiveLink('yes');
      setLiveUrl('https://foodrescue-hub.org');
    } else if (type === 'ai') {
      setProblemTitle('Developers spend excessive time synthesizing unstructured user feedback into actionable Jira roadmaps.');
      setProblemDescription('Product engineering teams receive hundreds of discord messages, tweets, and support tickets with no semantic deduplication or severity rating.');
      setProjectType('idea');
      setTitle('SynthSignal Engine');
      setCategory('Artificial Intelligence');
      setTagsInput('AI, ProductManagement, DevTools, NLP');
      setSolutionDescription('An intelligent ingestion pipeline clustering user friction signals and auto-generating structured PRDs and acceptance criteria.');
      setTargetAudience('Founders, Technical Product Managers, and solo indie hackers.');
      setValueProposition('Turns messy multi-channel feedback into verified roadmap sprint items in under 60 seconds.');
      setDifferentiation('Semantic clustering with built-in confidence scoring and contradiction detection.');
      setHasLiveLink('no');
      setGithubUrl('https://github.com/innovexa/synth-signal');
    }
    setError(null);
  };

  const validateStep = (currentStepNumber: number): boolean => {
    if (currentStepNumber === 1 && !problemTitle.trim()) {
      setError('Please provide a problem summary statement.');
      return false;
    }
    if (currentStepNumber === 3 && (!title.trim() || !solutionDescription.trim())) {
      setError('Please provide an innovation title and solution description.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 7));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep <= maxVisitedStep || targetStep === step + 1) {
      if (targetStep > step && !validateStep(step)) return;
      setError(null);
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = async (status: 'under_review' | 'draft') => {
    setError(null);
    if (!title.trim() || !problemTitle.trim() || !solutionDescription.trim()) {
      setError('Please complete the title, problem statement, and solution description before submitting.');
      return;
    }

    setSubmitting(true);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const payload = {
      owner_id: 'current',
      title,
      project_type: projectType,
      category,
      problem_title: problemTitle,
      problem_description: problemDescription || problemTitle,
      solution_description: solutionDescription,
      target_audience: targetAudience || 'General Innovators & Early Adopters',
      value_proposition: valueProposition || solutionDescription,
      differentiation: differentiation || 'Community-focused approach',
      live_url: hasLiveLink === 'yes' && liveUrl.trim() ? liveUrl.trim() : undefined,
      github_url: githubUrl.trim() || undefined,
      demo_url: demoUrl.trim() || undefined,
      cover_image_url: coverImageUrl,
      status,
      visibility: 'public' as const,
      tags: tags.length > 0 ? tags : [category, projectType]
    };

    if (editId) {
      const updateRes = await updateProject(editId, payload);
      setSubmitting(false);
      if (updateRes.error) {
        setError(updateRes.error);
      } else {
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
        onSuccess(editId);
      }
      return;
    }

    const res = await createProject(payload);
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else if (res.project) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
      onSuccess(res.project.id);
    }
  };

  const progressPercent = Math.round((step / 7) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Top Wizard Navigation Header */}
      <SlideUp delay={0.05}>
        <div className="bg-white rounded-3xl border border-innovexa-border p-6 shadow-subtle space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono font-bold tracking-widest text-innovexa-coral uppercase flex items-center gap-2">
                <span>INNOVATION CREATION PIPELINE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-innovexa-coral animate-pulse"></span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-innovexa-ink mt-0.5">
                Page {step} of 7 — {STEPS[step - 1].label}
              </h1>
              <p className="text-xs text-innovexa-ink-muted mt-0.5">
                {STEPS[step - 1].tagline} • Complete each page to assemble your project sheet.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-innovexa-ink">
                  {progressPercent}% COMPLETE
                </div>
                <div className="text-[10px] font-mono text-innovexa-ink-muted">
                  STEP {step} / 7
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-mono text-innovexa-ink-muted hover:text-innovexa-ink px-3 py-1.5 rounded-xl hover:bg-innovexa-bg-subtle border border-innovexa-border-subtle transition-all"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar & Indicator Pills */}
          <div className="space-y-3">
            {/* Smooth Progress line */}
            <div className="w-full bg-innovexa-bg-subtle h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-innovexa-coral via-innovexa-purple to-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Stepper Buttons Row */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
              {STEPS.map((s) => {
                const isActive = s.number === step;
                const isCompleted = s.number < step;
                const isClickable = s.number <= maxVisitedStep || s.number === step + 1;

                return (
                  <button
                    key={s.number}
                    type="button"
                    disabled={!isClickable}
                    onClick={() => handleStepClick(s.number)}
                    className={`py-2 px-1 rounded-xl text-left transition-all flex flex-col items-center sm:items-start justify-center gap-1 border ${
                      isActive 
                        ? 'bg-innovexa-ink text-white border-innovexa-ink shadow-sm ring-2 ring-innovexa-coral/30' 
                        : isCompleted
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                        : isClickable
                        ? 'bg-white border-innovexa-border text-innovexa-ink hover:border-innovexa-ink-light'
                        : 'bg-innovexa-bg-subtle/30 border-transparent text-innovexa-ink-light opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isActive 
                          ? 'bg-innovexa-coral text-white' 
                          : isCompleted 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-innovexa-bg text-innovexa-ink-muted'
                      }`}>
                        {isCompleted ? <Check className="w-2.5 h-2.5" /> : s.number}
                      </span>
                      <span className="hidden md:inline font-mono text-[10px] font-bold uppercase truncate">
                        {s.shortLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SlideUp>

      {/* Quick Template Inserter Helper */}
      <SlideUp delay={0.08}>
        <div className="bg-innovexa-bg-subtle/60 rounded-2xl border border-innovexa-border-subtle p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-innovexa-ink">
            <Zap className="w-3.5 h-3.5 text-innovexa-amber" />
            <span className="font-mono text-[11px] font-semibold">Test with pre-filled innovation templates:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadExampleTemplate('edtech')}
              className="bg-white hover:bg-innovexa-bg px-2.5 py-1 rounded-lg border border-innovexa-border font-mono text-[10px] font-medium text-innovexa-ink transition-all"
            >
              🎓 EdTech AI
            </button>
            <button
              type="button"
              onClick={() => loadExampleTemplate('sustainability')}
              className="bg-white hover:bg-innovexa-bg px-2.5 py-1 rounded-lg border border-innovexa-border font-mono text-[10px] font-medium text-innovexa-ink transition-all"
            >
              🌱 Food Rescue
            </button>
            <button
              type="button"
              onClick={() => loadExampleTemplate('ai')}
              className="bg-white hover:bg-innovexa-bg px-2.5 py-1 rounded-lg border border-innovexa-border font-mono text-[10px] font-medium text-innovexa-ink transition-all"
            >
              ⚡ API Tool
            </button>
          </div>
        </div>
      </SlideUp>

      {/* Grid: Main Form Step on Left (or Full), Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Area (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          <SlideUp delay={0.1}>
            <div className="bg-white rounded-3xl border border-innovexa-border p-8 shadow-card space-y-8">
              
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs animate-in fade-in flex items-center justify-between">
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 text-sm font-bold">×</button>
                </div>
              )}

              {/* PAGE 1: OBSERVE PROBLEM */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-coral uppercase">
                      PAGE 01 / PROBLEM OBSERVATION
                    </span>
                    <h3 className="font-serif text-3xl font-bold text-innovexa-ink">
                      What problem are you solving?
                    </h3>
                    <p className="text-xs text-innovexa-ink-muted leading-relaxed">
                      Clear problem framing is the cornerstone of high-signal validation. Define the specific friction and severity.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-mono font-semibold text-innovexa-ink uppercase">
                          Problem Summary Statement *
                        </label>
                        <span className="text-[10px] font-mono text-innovexa-coral">Required</span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g., University students struggle to balance spaced revision and upcoming assignment deadlines."
                        value={problemTitle}
                        onChange={(e) => setProblemTitle(e.target.value)}
                        className="w-full p-3.5 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-coral rounded-2xl text-xs text-innovexa-ink outline-none transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-semibold text-innovexa-ink uppercase">
                        Detailed Problem Context (Optional)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Describe how severe the problem is, who suffers most, and why existing solutions fail..."
                        value={problemDescription}
                        onChange={(e) => setProblemDescription(e.target.value)}
                        className="w-full p-3.5 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-coral rounded-2xl text-xs text-innovexa-ink outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 2: CLASSIFICATION */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-blue uppercase">
                      PAGE 02 / CLASSIFICATION & STAGE
                    </span>
                    <h3 className="font-serif text-3xl font-bold text-innovexa-ink">
                      What stage is your innovation?
                    </h3>
                    <p className="text-xs text-innovexa-ink-muted leading-relaxed">
                      Calibrate reviewer expectations according to the readiness stage of your build.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {[
                      { 
                        id: 'idea' as ProjectType, 
                        title: 'IDEA', 
                        desc: 'Hypothesis seeking problem resonance and feasibility critiques.' 
                      },
                      { 
                        id: 'product' as ProjectType, 
                        title: 'PRODUCT', 
                        desc: 'Functional MVP seeking usability, UX, and workflow feedback.' 
                      },
                      { 
                        id: 'startup' as ProjectType, 
                        title: 'STARTUP', 
                        desc: 'Early-stage venture seeking market-fit signals and adoption.' 
                      },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setProjectType(opt.id)}
                        className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-4 ${
                          projectType === opt.id
                            ? 'border-innovexa-coral bg-innovexa-coral/5 shadow-subtle ring-1 ring-innovexa-coral'
                            : 'border-innovexa-border hover:border-innovexa-ink-light bg-white'
                        }`}
                      >
                        <div>
                          <div className="font-mono font-bold text-sm tracking-wider text-innovexa-ink flex items-center justify-between">
                            <span>{opt.title}</span>
                            {projectType === opt.id && <Check className="w-3.5 h-3.5 text-innovexa-coral" />}
                          </div>
                          <p className="text-[11px] text-innovexa-ink-muted mt-2 leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>
                        <TypeBadge type={opt.id} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PAGE 3: SOLUTION ARCHITECTURE */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-purple uppercase">
                      PAGE 03 / SOLUTION ARCHITECTURE
                    </span>
                    <h3 className="font-serif text-3xl font-bold text-innovexa-ink">
                      What is your solution?
                    </h3>
                    <p className="text-xs text-innovexa-ink-muted leading-relaxed">
                      Name your innovation and outline how it directly addresses the observed problem.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-mono font-semibold text-innovexa-ink uppercase">
                          Innovation Title *
                        </label>
                        <span className="text-[10px] font-mono text-innovexa-purple">Required</span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g., StudyFlow, FoodRescue, DocuPulse..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3.5 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-purple rounded-2xl text-xs text-innovexa-ink outline-none transition-all font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono font-semibold text-innovexa-ink uppercase">
                          Primary Category *
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full p-3.5 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-purple rounded-2xl text-xs text-innovexa-ink outline-none transition-all cursor-pointer font-mono"
                        >
                          {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono font-semibold text-innovexa-ink uppercase">
                          Tags (Comma separated)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., AI, Education, Productivity"
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                          className="w-full p-3.5 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-purple rounded-2xl text-xs text-innovexa-ink outline-none transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-mono font-semibold text-innovexa-ink uppercase">
                          Solution Description *
                        </label>
                        <span className="text-[10px] font-mono text-innovexa-purple">Required</span>
                      </div>
                      <textarea
                        rows={4}
                        required
                        placeholder="Describe how the product works in practice and how it resolves the core issue..."
                        value={solutionDescription}
                        onChange={(e) => setSolutionDescription(e.target.value)}
                        className="w-full p-3.5 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-purple rounded-2xl text-xs text-innovexa-ink outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 4: TARGET AUDIENCE */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-teal uppercase">
                      PAGE 04 / TARGET AUDIENCE & PERSONAS
                    </span>
                    <h3 className="font-serif text-3xl font-bold text-innovexa-ink">
                      Who is your core user?
                    </h3>
                    <p className="text-xs text-innovexa-ink-muted leading-relaxed">
                      Identify target demographics so our matching engine routes the project to matching reviewers.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-semibold text-innovexa-ink uppercase">
                        Target Audience Details
                      </label>
                      <textarea
                        rows={4}
                        placeholder="e.g., University students taking 4+ technical courses simultaneously who struggle with spaced repetition and deadline tracking..."
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className="w-full p-3.5 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-teal rounded-2xl text-xs text-innovexa-ink outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 5: DIFFERENTIATION & UVP */}
              {step === 5 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-amber uppercase">
                      PAGE 05 / DIFFERENTIATION & UVP
                    </span>
                    <h3 className="font-serif text-3xl font-bold text-innovexa-ink">
                      Why will users switch to this?
                    </h3>
                    <p className="text-xs text-innovexa-ink-muted leading-relaxed">
                      Highlight your unique competitive moat and value proposition against alternatives.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-semibold text-innovexa-ink uppercase">
                        Unique Value Proposition (UVP)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Reduces study schedule planning from 4 hours to 10 minutes."
                        value={valueProposition}
                        onChange={(e) => setValueProposition(e.target.value)}
                        className="w-full p-3.5 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-amber rounded-2xl text-xs text-innovexa-ink outline-none transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-semibold text-innovexa-ink uppercase">
                        Differentiation Against Alternatives
                      </label>
                      <textarea
                        rows={4}
                        placeholder="e.g., Unlike generic task managers (Notion/Todoist), StudyFlow calculates cognitive fatigue and auto-schedules spaced revision blocks..."
                        value={differentiation}
                        onChange={(e) => setDifferentiation(e.target.value)}
                        className="w-full p-3.5 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-amber rounded-2xl text-xs text-innovexa-ink outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Live Similar Solutions & Uniqueness Differentiator Panel */}
                  <div className="pt-4 border-t border-innovexa-border-subtle">
                    <SimilarSolutionsDifferentiator
                      project={{
                        title: title || 'Draft Innovation',
                        category,
                        problem_title: problemTitle,
                        problem_description: problemDescription,
                        solution_description: solutionDescription,
                        target_audience: targetAudience,
                        value_proposition: valueProposition,
                        differentiation,
                        tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean)
                      }}
                      onApplyDifferentiation={(diff, uvp) => {
                        setDifferentiation(diff);
                        if (uvp && !valueProposition) setValueProposition(uvp);
                      }}
                      isSubmissionMode={true}
                    />
                  </div>
                </div>
              )}

              {/* PAGE 6: LIVE ARTIFACTS & LINKS */}
              {step === 6 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-lavender uppercase">
                      PAGE 06 / LIVE ARTIFACTS & LINKS
                    </span>
                    <h3 className="font-serif text-3xl font-bold text-innovexa-ink">
                      Do you have a live demo or repo?
                    </h3>
                    <p className="text-xs text-innovexa-ink-muted leading-relaxed">
                      Links are optional. You can validate early-stage ideas and wireframes before writing code.
                    </p>
                  </div>

                  {/* Option Selector */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      type="button"
                      onClick={() => setHasLiveLink('yes')}
                      className={`p-4 rounded-2xl border text-center font-mono font-bold text-xs transition-all ${
                        hasLiveLink === 'yes'
                          ? 'border-innovexa-purple bg-innovexa-purple/10 text-innovexa-purple shadow-sm'
                          : 'border-innovexa-border hover:border-innovexa-ink-light bg-white text-innovexa-ink'
                      }`}
                    >
                      ✓ YES, I HAVE LINKS
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasLiveLink('no')}
                      className={`p-4 rounded-2xl border text-center font-mono font-bold text-xs transition-all ${
                        hasLiveLink === 'no'
                          ? 'border-innovexa-purple bg-innovexa-purple/10 text-innovexa-purple shadow-sm'
                          : 'border-innovexa-border hover:border-innovexa-ink-light bg-white text-innovexa-ink'
                      }`}
                    >
                      ✕ NO, CONCEPT ONLY
                    </button>
                  </div>

                  {hasLiveLink === 'yes' && (
                    <div className="space-y-3 pt-2 animate-in fade-in">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-innovexa-ink-muted uppercase">Website / Landing URL</label>
                        <div className="relative">
                          <Globe className="w-4 h-4 text-innovexa-ink-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            placeholder="https://studyflow-preview.app"
                            value={liveUrl}
                            onChange={(e) => setLiveUrl(e.target.value)}
                            className="w-full bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-purple rounded-xl pl-10 pr-4 py-2.5 text-xs text-innovexa-ink outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-innovexa-ink-muted uppercase">GitHub Repository (Optional)</label>
                        <div className="relative">
                          <Code2 className="w-4 h-4 text-innovexa-ink-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            placeholder="https://github.com/username/project"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            className="w-full bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-purple rounded-xl pl-10 pr-4 py-2.5 text-xs text-innovexa-ink outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PAGE 7: REVIEW & LAUNCH */}
              {step === 7 && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 uppercase">
                      PAGE 07 / READY FOR COMMUNITY VALIDATION
                    </span>
                    <h3 className="font-serif text-3xl font-bold text-innovexa-ink">
                      Ready to launch pipeline!
                    </h3>
                    <p className="text-xs text-innovexa-ink-muted leading-relaxed">
                      Your innovation sheet is compiled. Submit it to open review matching or save as a draft.
                    </p>
                  </div>

                  <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Pipeline Verification Check Passed</span>
                    </div>
                    <p className="text-emerald-700 leading-relaxed text-[11px]">
                      Once submitted, the project will be placed in the community review queue, matched with subject-matter reviewers, and indexed in the Explore feed.
                    </p>
                  </div>

                  {/* Market Comparison & Uniqueness Review */}
                  <div className="pt-2">
                    <SimilarSolutionsDifferentiator
                      project={{
                        title: title || 'Draft Innovation',
                        category,
                        problem_title: problemTitle,
                        problem_description: problemDescription,
                        solution_description: solutionDescription,
                        target_audience: targetAudience,
                        value_proposition: valueProposition,
                        differentiation,
                        tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean)
                      }}
                      onApplyDifferentiation={(diff, uvp) => {
                        setDifferentiation(diff);
                        if (uvp && !valueProposition) setValueProposition(uvp);
                      }}
                      isSubmissionMode={true}
                    />
                  </div>
                </div>
              )}

              {/* Page Form Actions Footer */}
              <div className="pt-6 border-t border-innovexa-border-subtle flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-xs font-mono font-semibold text-innovexa-ink-muted hover:text-innovexa-ink px-4 py-2.5 rounded-xl hover:bg-innovexa-bg-subtle border border-innovexa-border transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous Page</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  {step < 7 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2 bg-innovexa-ink hover:bg-black text-white px-7 py-3 rounded-full text-xs font-mono font-semibold tracking-wider transition-all shadow-subtle hover:scale-[1.02]"
                    >
                      <span>NEXT PAGE ({step + 1}/7)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleSave('draft')}
                        className="flex items-center gap-1.5 bg-white hover:bg-innovexa-bg-subtle text-innovexa-ink border border-innovexa-border px-5 py-3 rounded-full text-xs font-mono font-semibold transition-all disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5 text-innovexa-ink-muted" />
                        <span>SAVE DRAFT</span>
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleSave('under_review')}
                        className="flex items-center gap-2 bg-innovexa-coral hover:bg-[#DE5B6B] text-white px-8 py-3 rounded-full text-xs font-mono font-semibold tracking-wider shadow-card hover:shadow-glow-coral transition-all transform active:scale-95 disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{submitting ? 'LAUNCHING...' : 'SUBMIT INNOVATION →'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          </SlideUp>
        </div>

        {/* Right Live Sheet Preview Area (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <SlideUp delay={0.12}>
            <div className="bg-white rounded-3xl border border-innovexa-border p-6 shadow-card space-y-5">
              <div className="flex items-center justify-between border-b border-innovexa-border-subtle pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-innovexa-coral" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-innovexa-ink">
                    Live Project Card Preview
                  </span>
                </div>
                <Badge variant="purple">V1 DRAFT</Badge>
              </div>

              {/* Dynamic Mock Project Card */}
              <div className="rounded-2xl border border-innovexa-border overflow-hidden bg-innovexa-bg-subtle/30 shadow-subtle space-y-3">
                <div className="h-32 w-full bg-innovexa-bg-subtle overflow-hidden relative">
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <TypeBadge type={projectType} />
                    <CategoryBadge category={category} />
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <h4 className="font-serif text-lg font-bold text-white tracking-tight drop-shadow-sm truncate">
                      {title || 'Your Innovation Title'}
                    </h4>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-innovexa-coral font-bold uppercase block">
                      Problem Statement:
                    </span>
                    <p className="text-xs text-innovexa-ink font-medium mt-0.5 line-clamp-2">
                      {problemTitle || 'No problem statement entered yet...'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-innovexa-purple font-bold uppercase block">
                      Solution:
                    </span>
                    <p className="text-xs text-innovexa-ink-muted mt-0.5 line-clamp-3">
                      {solutionDescription || 'No solution description specified yet...'}
                    </p>
                  </div>

                  {targetAudience && (
                    <div className="pt-2 border-t border-innovexa-border-subtle">
                      <span className="text-[10px] font-mono text-innovexa-teal font-bold uppercase block">
                        Target Audience:
                      </span>
                      <p className="text-[11px] text-innovexa-ink-muted line-clamp-2">
                        {targetAudience}
                      </p>
                    </div>
                  )}

                  {valueProposition && (
                    <div className="pt-2 border-t border-innovexa-border-subtle">
                      <span className="text-[10px] font-mono text-innovexa-amber font-bold uppercase block">
                        Value Proposition:
                      </span>
                      <p className="text-[11px] text-innovexa-ink-muted line-clamp-2">
                        {valueProposition}
                      </p>
                    </div>
                  )}

                  {hasLiveLink === 'yes' && liveUrl && (
                    <div className="pt-2 border-t border-innovexa-border-subtle flex items-center gap-1.5 text-xs text-innovexa-blue font-mono truncate">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{liveUrl}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[11px] font-mono text-innovexa-ink-muted text-center">
                Updates automatically as you type each page.
              </div>
            </div>
          </SlideUp>
        </div>

      </div>

    </div>
  );
};
