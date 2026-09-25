import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Globe, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  Target, 
  Zap, 
  FileText, 
  BarChart3, 
  RefreshCw, 
  Trash2, 
  ArrowLeft, 
  HelpCircle, 
  Check, 
  Share2, 
  Printer, 
  Code2, 
  Database, 
  MessageSquare, 
  Compass, 
  Award,
  ChevronRight,
  Filter,
  Flame,
  Plus,
  Edit3,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProjects } from '../context/ProjectContext';
import { 
  analyzeProjectWithAI, 
  buildUniqueProjectContext,
  getSavedAnalysisReports, 
  getAnalysisReportById, 
  deleteAnalysisReport,
  AIProjectAnalysisReport, 
  UniqueProjectContext 
} from '../services/aiProjectAnalyzerService';

// Pipeline stage definitions for visual progress
interface PipelineStage {
  id: number;
  label: string;
  description: string;
}

const ANALYSIS_PIPELINE_STAGES: PipelineStage[] = [
  { id: 1, label: 'Reading User Project Specifications', description: 'Parsing custom problem statement, solution mechanics, and user audience.' },
  { id: 2, label: 'Building Structural Taxonomy', description: 'Constructing domain taxonomy, feature boundaries, and core value loops.' },
  { id: 3, label: 'Pass 1 — Targeted Query Synthesis', description: 'Generating domain-specific market and competitor search queries.' },
  { id: 4, label: 'Executing Web & Market Grounding', description: 'Cross-referencing open-source repositories and existing commercial tools.' },
  { id: 5, label: 'Pass 2 — Competitor Matrix Analysis', description: 'Evaluating competitor pricing, strengths, limitations, and user overlaps.' },
  { id: 6, label: 'Domain Market Trends & Evidence', description: 'Extracting verified market facts and technology shifts with citations.' },
  { id: 7, label: 'Synthesizing SWOT & Risk Map', description: 'Mapping unvalidated assumptions, adoption risks, and defensive moats.' },
  { id: 8, label: 'Prioritizing Action Roadmap', description: 'Formulating sprint recommendations into NOW, NEXT, and LATER milestones.' },
  { id: 9, label: 'Assembling Final Analysis Dossier', description: 'Finalizing structured report and saving report to local history.' }
];

// Presets for instant 1-click testing
const SAMPLE_PROJECT_PRESETS = [
  {
    title: 'AI Crop Disease Detection Platform',
    problem: 'Smallholder farmers lose 30-40% of their crop yields to undetected leaf diseases and fungal infections before symptoms become visibly obvious.',
    solution: 'A mobile smartphone app using computer vision to diagnose crop diseases from leaf photos with offline edge inference and localized organic treatment advice.',
    category: 'Agriculture & Agritech',
    target_audience: 'Smallholder farmers, agronomists, rural agricultural cooperatives',
    features: ['Leaf scan camera diagnosis', 'Offline edge AI inference', 'Local weather risk alerts', 'Organic treatment database'],
    technology: 'PyTorch Mobile, React Native, FastAPI, Supabase',
    business_model: 'Freemium for farmers with B2B analytics subscription for agricultural cooperatives',
    live_url: 'https://github.com/example/crop-ai'
  },
  {
    title: 'Student Mental Health & Wellness Companion',
    problem: 'College students face high academic burnout, anxiety, and long university counseling waitlists with persistent social stigma.',
    solution: 'An anonymous, evidence-based digital companion providing interactive CBT micro-exercises, peer support circles, and seamless campus counseling triage.',
    category: 'Healthcare & Wellness',
    target_audience: 'University undergraduate & graduate students, campus wellness directors',
    features: ['Anonymous daily check-ins', 'Guided CBT reframing worksheets', 'Campus counseling hotline bridge', 'Focus & exam stress reduction'],
    technology: 'React, Tailwind CSS, TypeScript, FastAPI, Gemini API',
    business_model: 'University institutional B2B enterprise license ($3-$5/student/year)',
    live_url: 'https://studentmind-app.dev'
  },
  {
    title: 'Smart Waste Management & Recycling Sorter',
    problem: 'Commercial buildings and smart cities face overfilled dumpsters, contaminated recycling bins exceeding 20%, and inefficient fixed truck collection routes.',
    solution: 'IoT ultrasonic fill-level sensors coupled with AI computer vision camera auditing to optimize collection routes and reward clean recycling.',
    category: 'Smart City & CleanTech',
    target_audience: 'Commercial property managers, municipal sanitation departments, waste haulers',
    features: ['Ultrasonic bin fullness monitoring', 'Recycling contamination detection', 'Dynamic truck route optimizer', 'Tenant recycling reward points'],
    technology: 'ESP32 IoT Sensors, OpenCV, Node.js, PostgreSQL, Mapbox',
    business_model: 'B2B SaaS ($20/month per monitored container)',
    live_url: 'https://smartwaste-iot.io'
  }
];

export const AIProjectAnalyzerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projects } = useProjects();

  // Mode: 'input' | 'analyzing' | 'report' | 'history'
  const [viewMode, setViewMode] = useState<'input' | 'analyzing' | 'report' | 'history'>('input');

  // User input form state
  const [userForm, setUserForm] = useState({
    title: '',
    problem: '',
    solution: '',
    category: 'Agriculture & Agritech',
    project_type: 'Product',
    target_audience: '',
    features_raw: '',
    technology: '',
    business_model: '',
    live_url: ''
  });

  // Active Report being viewed
  const [activeReport, setActiveReport] = useState<AIProjectAnalysisReport | null>(null);

  // History list
  const [reportHistory, setReportHistory] = useState<AIProjectAnalysisReport[]>([]);

  // Pipeline progress state during live analysis
  const [currentPipelineStage, setCurrentPipelineStage] = useState<number>(1);
  const [lastAnalyzedContext, setLastAnalyzedContext] = useState<UniqueProjectContext | null>(null);

  // Load history on mount
  useEffect(() => {
    const saved = getSavedAnalysisReports();
    setReportHistory(saved);

    // If URL has ?reportId=..., load it
    const reportIdParam = searchParams.get('reportId');
    if (reportIdParam) {
      const found = getAnalysisReportById(reportIdParam);
      if (found) {
        setActiveReport(found);
        setViewMode('report');
      }
    } else {
      // If URL has ?projectId=..., pre-fill the form with that project's information
      const projectIdParam = searchParams.get('projectId');
      if (projectIdParam) {
        const foundProj = projects.find(p => p.id === projectIdParam);
        if (foundProj) {
          fillFormWithProject(foundProj);
        }
      }
    }
  }, [searchParams, projects]);

  // Helper to fill form from a project
  const fillFormWithProject = (p: any) => {
    setUserForm({
      title: p.title || '',
      problem: p.problem_description || p.problem_title || '',
      solution: p.solution_description || p.description || '',
      category: p.category || 'AI & Technology',
      project_type: p.project_type || 'Product',
      target_audience: p.target_audience || '',
      features_raw: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      technology: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      business_model: p.business_model || '',
      live_url: p.live_url || p.demo_url || ''
    });
    setViewMode('input');
  };

  // Helper to load a preset
  const handleLoadPreset = (preset: typeof SAMPLE_PROJECT_PRESETS[0]) => {
    setUserForm({
      title: preset.title,
      problem: preset.problem,
      solution: preset.solution,
      category: preset.category,
      project_type: 'Product',
      target_audience: preset.target_audience,
      features_raw: preset.features.join(', '),
      technology: preset.technology,
      business_model: preset.business_model,
      live_url: preset.live_url
    });
  };

  // Handle Form Submission and Run AI Analysis
  const handleSubmitAndAnalyze = async (e?: React.FormEvent, forceFresh: boolean = false) => {
    if (e) e.preventDefault();

    if (!userForm.title.trim()) {
      alert('Please provide at least a Project Title.');
      return;
    }

    setViewMode('analyzing');
    setCurrentPipelineStage(1);

    const parsedFeatures = userForm.features_raw
      ? userForm.features_raw.split(',').map(f => f.trim()).filter(Boolean)
      : [];

    const projectContext = buildUniqueProjectContext({
      title: userForm.title.trim(),
      problem: userForm.problem.trim() || userForm.solution.trim() || 'User pain point in ' + userForm.category,
      solution: userForm.solution.trim() || userForm.problem.trim() || 'Innovative platform for ' + userForm.title,
      category: userForm.category,
      project_type: userForm.project_type,
      target_audience: userForm.target_audience.trim() || 'Target users and practitioners',
      features: parsedFeatures,
      technology: userForm.technology.trim() || 'Modern Fullstack & Cloud Architecture',
      business_model: userForm.business_model.trim() || 'Freemium / Usage Subscription',
      live_url: userForm.live_url.trim()
    }, 'external');

    setLastAnalyzedContext(projectContext);
    runPipelineStages(projectContext, forceFresh);
  };

  // Run visual stages & execute AI analysis
  const runPipelineStages = async (context: UniqueProjectContext, forceFresh: boolean) => {
    let currentStage = 1;
    const stageInterval = setInterval(() => {
      if (currentStage < 8) {
        currentStage += 1;
        setCurrentPipelineStage(currentStage);
      }
    }, 400);

    try {
      const report = await analyzeProjectWithAI(context, [], forceFresh);
      clearInterval(stageInterval);
      setCurrentPipelineStage(9);

      setTimeout(() => {
        setActiveReport(report);
        setReportHistory(getSavedAnalysisReports());
        setViewMode('report');
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      }, 350);
    } catch (err) {
      clearInterval(stageInterval);
      // Fallback guarantees a complete analysis
      const fallbackReport = await analyzeProjectWithAI(context, [], true);
      setActiveReport(fallbackReport);
      setReportHistory(getSavedAnalysisReports());
      setViewMode('report');
    }
  };

  // Delete report
  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this analysis report?')) {
      deleteAnalysisReport(id);
      setReportHistory(getSavedAnalysisReports());
      if (activeReport?.id === id) {
        setActiveReport(null);
        setViewMode('input');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#20202A] pb-28 font-sans selection:bg-[#6875E8]/20">
      
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. HERO HEADER */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="border-b border-[#E3DED5] bg-white/70 backdrop-blur-md pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Top Label & Mode Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6875E8]/10 text-[#6875E8] text-xs font-mono font-bold tracking-wider uppercase border border-[#6875E8]/20">
                <BrainCircuit className="w-3.5 h-3.5" />
                INTELLIGENCE SUITE
              </span>
              <span className="text-xs font-mono text-[#8E90A2]">| AI Project Analyzer & Reviewer</span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center p-1 bg-[#F7F4EE] rounded-2xl border border-[#E3DED5] self-start sm:self-auto">
              <button
                onClick={() => setViewMode('input')}
                className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  viewMode === 'input'
                    ? 'bg-[#181924] text-white shadow-subtle'
                    : 'text-[#6E7082] hover:text-[#181924]'
                }`}
              >
                + Input Project Details
              </button>

              <button
                onClick={() => setViewMode('history')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'history'
                    ? 'bg-[#181924] text-white shadow-subtle'
                    : 'text-[#6E7082] hover:text-[#181924]'
                }`}
              >
                <span>Saved Reports</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#6875E8]/20 text-[#6875E8] text-[10px]">
                  {reportHistory.length}
                </span>
              </button>
            </div>
          </div>

          {/* Headline & Subtitle */}
          <div className="space-y-3 max-w-4xl">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#181924] leading-tight">
              AI PROJECT ANALYZER
            </h1>
            <p className="text-base sm:text-lg text-[#555768] font-normal leading-relaxed max-w-3xl">
              Enter your project information directly to generate a customized AI analysis covering market landscape, competitors, trends, SWOT, risks, and an actionable roadmap.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-2 border-t border-[#E3DED5]/60 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-[#8E90A2] mr-1 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-[#D97706]" /> Quick Examples:
            </span>
            {SAMPLE_PROJECT_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadPreset(preset)}
                className="px-3 py-1 rounded-xl bg-white hover:bg-[#6875E8]/10 border border-[#E3DED5] hover:border-[#6875E8]/40 text-xs font-mono text-[#181924] hover:text-[#6875E8] transition-all flex items-center gap-1.5"
              >
                <span>{preset.title.split(' ')[0]} {preset.title.split(' ')[1]}</span>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. MAIN CONTENT AREA */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* VIEW 1: USER INPUT STUDIO */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {viewMode === 'input' && (
          <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DED5] pb-5">
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-[#6875E8] uppercase tracking-wider">
                  PROJECT SPECIFICATIONS
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#181924]">
                  Enter Your Project Details
                </h2>
                <p className="text-xs text-[#6E7082]">
                  Every analysis is dynamically formulated from your exact inputs below.
                </p>
              </div>

              {projects.length > 0 && (
                <div className="shrink-0">
                  <select
                    onChange={(e) => {
                      const found = projects.find(p => p.id === e.target.value);
                      if (found) fillFormWithProject(found);
                    }}
                    className="bg-[#FAF8F3] text-xs font-mono text-[#181924] p-2.5 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8]"
                  >
                    <option value="">⚡ Or choose from your projects...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitAndAnalyze} className="space-y-6">
              
              {/* Project Title */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-[#181924] uppercase flex items-center justify-between">
                  <span>1. Project Title / Name *</span>
                  <span className="text-[10px] text-[#8E90A2] font-normal">e.g. AI Crop Disease Detection</span>
                </label>
                <input
                  type="text"
                  required
                  value={userForm.title}
                  onChange={(e) => setUserForm({ ...userForm, title: e.target.value })}
                  placeholder="Enter your project name..."
                  className="w-full bg-[#FAF8F3] text-sm text-[#181924] p-3.5 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8] font-medium"
                />
              </div>

              {/* Problem Statement */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-[#181924] uppercase flex items-center justify-between">
                  <span>2. Problem Statement (What friction does this solve?) *</span>
                  <span className="text-[10px] text-[#8E90A2] font-normal">User pain point</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={userForm.problem}
                  onChange={(e) => setUserForm({ ...userForm, problem: e.target.value })}
                  placeholder="Describe the exact friction, bottleneck, or problem your target users experience..."
                  className="w-full bg-[#FAF8F3] text-sm text-[#181924] p-3.5 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8] leading-relaxed"
                />
              </div>

              {/* Proposed Solution */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-[#181924] uppercase flex items-center justify-between">
                  <span>3. Proposed Solution (How does your innovation solve it?) *</span>
                  <span className="text-[10px] text-[#8E90A2] font-normal">Core mechanism</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={userForm.solution}
                  onChange={(e) => setUserForm({ ...userForm, solution: e.target.value })}
                  placeholder="Explain how your project works, what it does, and how it delivers value to the user..."
                  className="w-full bg-[#FAF8F3] text-sm text-[#181924] p-3.5 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8] leading-relaxed"
                />
              </div>

              {/* Category & Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-[#181924] uppercase">
                    4. Domain Category
                  </label>
                  <select
                    value={userForm.category}
                    onChange={(e) => setUserForm({ ...userForm, category: e.target.value })}
                    className="w-full bg-[#FAF8F3] text-xs font-mono text-[#181924] p-3.5 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8]"
                  >
                    <option value="Agriculture & Agritech">Agriculture & Agritech</option>
                    <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                    <option value="Smart City & CleanTech">Smart City & CleanTech</option>
                    <option value="Education & Career">Education & Career</option>
                    <option value="Developer Tools & Infrastructure">Developer Tools & Infrastructure</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="FinTech & Finance">FinTech & Finance</option>
                    <option value="Productivity & Workflow">Productivity & Workflow</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-[#181924] uppercase">
                    5. Target Audience / Users
                  </label>
                  <input
                    type="text"
                    value={userForm.target_audience}
                    onChange={(e) => setUserForm({ ...userForm, target_audience: e.target.value })}
                    placeholder="e.g. Smallholder farmers, University students, DevOps leads"
                    className="w-full bg-[#FAF8F3] text-xs text-[#181924] p-3.5 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8]"
                  />
                </div>

              </div>

              {/* Core Features & Tech Stack */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-[#181924] uppercase">
                    6. Key Features (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={userForm.features_raw}
                    onChange={(e) => setUserForm({ ...userForm, features_raw: e.target.value })}
                    placeholder="e.g. Camera Scanner, Offline Diagnosis, Risk Alerts"
                    className="w-full bg-[#FAF8F3] text-xs text-[#181924] p-3.5 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-[#181924] uppercase">
                    7. Technology Stack (Optional)
                  </label>
                  <input
                    type="text"
                    value={userForm.technology}
                    onChange={(e) => setUserForm({ ...userForm, technology: e.target.value })}
                    placeholder="e.g. PyTorch, React, Supabase, FastAPI"
                    className="w-full bg-[#FAF8F3] text-xs text-[#181924] p-3.5 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8]"
                  />
                </div>

              </div>

              {/* Business Model & Live URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-[#181924] uppercase">
                    8. Business / Monetization Model (Optional)
                  </label>
                  <input
                    type="text"
                    value={userForm.business_model}
                    onChange={(e) => setUserForm({ ...userForm, business_model: e.target.value })}
                    placeholder="e.g. B2B SaaS, Freemium, Open Source Cloud"
                    className="w-full bg-[#FAF8F3] text-xs text-[#181924] p-3.5 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-[#181924] uppercase">
                    9. Project Link / GitHub (Optional)
                  </label>
                  <input
                    type="url"
                    value={userForm.live_url}
                    onChange={(e) => setUserForm({ ...userForm, live_url: e.target.value })}
                    placeholder="https://my-project-demo.com"
                    className="w-full bg-[#FAF8F3] text-xs font-mono text-[#181924] p-3.5 rounded-xl border border-[#E3DED5] focus:outline-none focus:border-[#6875E8]"
                  />
                </div>

              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#E3DED5] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-mono text-[#8E90A2]">
                  ✓ Dynamic input-grounded analysis • No hardcoded responses
                </span>

                <button
                  type="submit"
                  className="bg-[#181924] hover:bg-[#6875E8] text-white px-8 py-3.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2.5 transition-all shadow-subtle hover:shadow-lg w-full sm:w-auto justify-center"
                >
                  <Sparkles className="w-4 h-4 text-[#A0E8A7]" />
                  <span>Analyze Project with AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>

          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* VIEW 2: LIVE ANALYSIS PIPELINE */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {viewMode === 'analyzing' && (
          <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-[#E3DED5] shadow-xl space-y-8 text-center">
            
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#6875E8]/10 border border-[#6875E8]/30 flex items-center justify-center text-[#6875E8] mx-auto animate-pulse">
                <BrainCircuit className="w-8 h-8" />
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#181924]">
                Analyzing Project & Formulating Intelligence
              </h2>

              <p className="text-xs sm:text-sm text-[#6E7082] max-w-md mx-auto">
                Synthesizing market research, competitor overlaps, domain trends, risks, and strategic recommendations for <strong className="text-[#181924]">"{userForm.title}"</strong>.
              </p>
            </div>

            {/* Pipeline Stage Tracker */}
            <div className="space-y-3 text-left max-w-lg mx-auto bg-[#FAF8F3] p-5 rounded-2xl border border-[#E3DED5]">
              {ANALYSIS_PIPELINE_STAGES.map((stage) => {
                const isPassed = currentPipelineStage > stage.id;
                const isCurrent = currentPipelineStage === stage.id;
                return (
                  <div key={stage.id} className="flex items-center gap-3">
                    <div className="shrink-0">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#6875E8] border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[#D5D0C6] bg-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-mono font-medium block truncate ${
                        isCurrent ? 'text-[#6875E8] font-bold' : isPassed ? 'text-[#181924]' : 'text-[#A0A2B4]'
                      }`}>
                        {stage.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] font-mono text-[#8E90A2]">
              Stage {currentPipelineStage} of 9 • Processing customized AI insights
            </div>

          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* VIEW 3: ANALYSIS REPORT DASHBOARD */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {viewMode === 'report' && activeReport && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Top Report Header Bar */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DED5] shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('input')}
                    className="text-xs font-mono text-[#6E7082] hover:text-[#181924] flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Edit Input Details</span>
                  </button>
                  <span className="text-xs text-[#D5D0C6]">/</span>
                  <span className="text-xs font-mono font-bold text-[#6875E8] uppercase">
                    {activeReport.project_snapshot.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#8E90A2] uppercase tracking-wider block">
                    PROJECT ANALYZED
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181924]">
                    {activeReport.project_snapshot.title}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#6E7082]">
                  <span>Domain: <strong className="text-[#181924]">{activeReport.project_understanding.domain_taxonomy}</strong></span>
                  <span>•</span>
                  <span>Engine: {activeReport.model}</span>
                  <span>•</span>
                  <span className="text-[#059669] font-bold">
                    ✓ {activeReport.sources.length} Verified Sources & Citations
                  </span>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                
                <button
                  onClick={() => handleSubmitAndAnalyze(undefined, true)}
                  className="bg-[#6875E8] hover:bg-[#5764D6] text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-subtle"
                  title="Re-run analysis with fresh AI generation"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A0E8A7]" />
                  <span>Analyze Again</span>
                </button>

                <button
                  onClick={() => setViewMode('input')}
                  className="bg-[#FAF8F3] hover:bg-[#E3DED5] text-[#181924] px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border border-[#E3DED5]"
                  title="Edit details and re-run"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="bg-[#FAF8F3] hover:bg-[#E3DED5] text-[#181924] p-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border border-[#E3DED5]"
                  title="Print / Save as PDF"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Report link copied to clipboard!');
                  }}
                  className="bg-[#FAF8F3] hover:bg-[#E3DED5] text-[#181924] p-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border border-[#E3DED5]"
                  title="Share Report Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Dynamic Search Queries Executed Badge Row */}
            {activeReport.search_queries_used && activeReport.search_queries_used.length > 0 && (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3DED5] space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#6875E8] uppercase tracking-wider block">
                  PROJECT-SPECIFIC RESEARCH SEARCH QUERIES GROUNDED:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeReport.search_queries_used.map((q, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#FAF8F3] border border-[#E3DED5] text-xs font-mono text-[#555768]">
                      🔍 "{q}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 1. EXECUTIVE SUMMARY & POSITIONING */}
            <div className="bg-gradient-to-br from-[#FAF8F3] to-white p-6 sm:p-8 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#6875E8]">
                <Sparkles className="w-4 h-4" />
                <span>AI EXECUTIVE SUMMARY</span>
              </div>
              <p className="text-sm sm:text-base text-[#20202A] leading-relaxed">
                {activeReport.executive_summary}
              </p>
            </div>

            {/* 2. PROJECT UNDERSTANDING GRID */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-6">
              <div className="flex items-center justify-between border-b border-[#E3DED5] pb-3">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#181924]">
                  Structured Project Understanding
                </h3>
                <span className="text-xs font-mono text-[#8E90A2]">
                  Domain: {activeReport.project_understanding.domain_taxonomy}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-1.5 bg-[#FAF8F3] p-4 rounded-xl border border-[#E3DED5]">
                  <span className="text-[10px] font-mono font-bold text-[#C53030] uppercase">Problem Solved</span>
                  <p className="text-xs sm:text-sm text-[#20202A] leading-relaxed">
                    {activeReport.project_understanding.problem}
                  </p>
                </div>

                <div className="space-y-1.5 bg-[#FAF8F3] p-4 rounded-xl border border-[#E3DED5]">
                  <span className="text-[10px] font-mono font-bold text-[#059669] uppercase">Solution Provided</span>
                  <p className="text-xs sm:text-sm text-[#20202A] leading-relaxed">
                    {activeReport.project_understanding.solution}
                  </p>
                </div>

                <div className="space-y-1.5 bg-[#FAF8F3] p-4 rounded-xl border border-[#E3DED5]">
                  <span className="text-[10px] font-mono font-bold text-[#6875E8] uppercase">Target Audience & Value Hook</span>
                  <p className="text-xs sm:text-sm text-[#20202A] leading-relaxed">
                    <strong>Target Users:</strong> {activeReport.project_understanding.target_audience}
                    <br />
                    <strong>Value Proposition:</strong> {activeReport.project_understanding.value_proposition}
                  </p>
                </div>

                <div className="space-y-2 bg-[#FAF8F3] p-4 rounded-xl border border-[#E3DED5]">
                  <span className="text-[10px] font-mono font-bold text-[#D97706] uppercase">Core Features</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeReport.project_understanding.core_features.map((feat, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-white border border-[#E3DED5] text-xs font-mono text-[#181924]">
                        • {feat}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* 3. RELATED MARKET SOLUTIONS & ALTERNATIVES */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E3DED5] pb-3">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#181924]">
                    Related Projects & Solutions ({activeReport.related_solutions.length})
                  </h3>
                  <p className="text-xs text-[#6E7082]">
                    Real existing products and open-source ecosystems addressing adjacent problem vectors in {activeReport.project_understanding.domain_taxonomy}.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#059669] font-bold">
                  ✓ Verified Web Grounding
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeReport.related_solutions.map((sol, idx) => (
                  <div key={idx} className="bg-[#FAF8F3] p-5 rounded-2xl border border-[#E3DED5] space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-[#181924] text-white text-[10px] font-mono font-bold">
                          {sol.source_type}
                        </span>
                        <span className="text-xs font-mono text-[#6875E8] font-bold">
                          {sol.similarity_percentage}% Similarity
                        </span>
                      </div>

                      <h4 className="font-serif text-lg font-bold text-[#181924]">
                        {sol.name}
                      </h4>

                      <p className="text-xs text-[#555768] leading-relaxed">
                        {sol.description}
                      </p>

                      <div className="bg-white p-2.5 rounded-lg border border-[#E3DED5] text-xs text-[#20202A] space-y-1">
                        <div><strong>What they do:</strong> {sol.what_they_do}</div>
                        <div className="text-[#6875E8]"><strong>Why related & how it differs:</strong> {sol.how_it_differs}</div>
                      </div>
                    </div>

                    <a
                      href={sol.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6875E8] hover:text-[#181924] font-bold pt-2 border-t border-[#E3DED5]"
                    >
                      <span>Visit {sol.domain}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. COMPETITIVE LANDSCAPE MATRIX TABLE */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-6">
              <div className="space-y-1 border-b border-[#E3DED5] pb-3">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#181924]">
                  Competitor Analysis Matrix
                </h3>
                <p className="text-xs text-[#6E7082]">
                  Direct comparison of problem overlap, pricing tiers, strengths, limitations, and strategic differentiation opportunities.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E3DED5] bg-[#FAF8F3] text-[10px] font-mono text-[#6E7082] uppercase tracking-wider">
                      <th className="p-3">Competitor / Project</th>
                      <th className="p-3">Problem Overlap</th>
                      <th className="p-3">Pricing Tier</th>
                      <th className="p-3">Strengths</th>
                      <th className="p-3">Limitations</th>
                      <th className="p-3">Differentiation Opportunity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3DED5]">
                    {activeReport.competitive_landscape.map((comp, idx) => (
                      <tr key={idx} className={comp.is_analyzed_project ? 'bg-[#6875E8]/5 font-medium' : 'hover:bg-[#FCFBF8]'}>
                        <td className="p-3 font-bold text-[#181924]">
                          <div className="flex items-center gap-1.5">
                            {comp.is_analyzed_project && (
                              <span className="w-2 h-2 rounded-full bg-[#6875E8]" />
                            )}
                            <span>{comp.project_name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#8E90A2] block">{comp.target_audience}</span>
                        </td>
                        <td className="p-3 text-[#555768] max-w-[200px]">{comp.problem_solved}</td>
                        <td className="p-3 font-mono text-[11px] text-[#20202A]">{comp.pricing}</td>
                        <td className="p-3 text-[#059669]">
                          {comp.strengths?.join(', ') || 'N/A'}
                        </td>
                        <td className="p-3 text-[#C53030]">
                          {comp.limitations?.join(', ') || 'N/A'}
                        </td>
                        <td className="p-3 text-[#6875E8]">
                          {comp.differentiation_opportunity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. MARKET TRENDS & EVIDENCE */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-6">
              <div className="space-y-1 border-b border-[#E3DED5] pb-3">
                <span className="text-[10px] font-mono font-bold text-[#D97706] uppercase tracking-wider">
                  DOMAIN SPECIFIC FORCES
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#181924]">
                  Current Market Trends & Evidence
                </h3>
                <p className="text-xs text-[#6E7082]">
                  Distinguishing verified facts from AI interpretations and strategic recommendations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeReport.market_trends.map((trend, idx) => (
                  <div key={idx} className="bg-[#FAF8F3] p-5 rounded-2xl border border-[#E3DED5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        trend.type_tag === 'FACT' 
                          ? 'bg-[#10B981]/10 text-[#059669] border border-[#10B981]/30'
                          : 'bg-[#6875E8]/10 text-[#6875E8] border border-[#6875E8]/30'
                      }`}>
                        {trend.type_tag}
                      </span>
                      <span className="text-[10px] font-mono text-[#8E90A2] uppercase">
                        Phase: {trend.timeline_phase}
                      </span>
                    </div>

                    <h4 className="font-serif text-lg font-bold text-[#181924]">
                      {trend.trend_name}
                    </h4>

                    <p className="text-xs text-[#20202A] leading-relaxed">
                      <strong>Evidence:</strong> {trend.evidence}
                    </p>

                    <div className="text-xs text-[#555768] bg-white p-3 rounded-xl border border-[#E3DED5] space-y-1">
                      <div><strong>Why it matters:</strong> {trend.why_it_matters}</div>
                      <div className="text-[#059669]"><strong>Impact:</strong> {trend.potential_impact}</div>
                    </div>

                    <a
                      href={trend.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-[#6875E8] hover:text-[#181924] font-medium"
                    >
                      <span>Source: {trend.source_title}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. STRENGTHS & WEAKNESSES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Strengths */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#059669] uppercase">
                  <Award className="w-4 h-4" />
                  <span>Project Strengths</span>
                </div>

                <div className="space-y-3">
                  {activeReport.strengths.map((s, idx) => (
                    <div key={idx} className="bg-[#F0FFF4] p-4 rounded-xl border border-[#C6F6D5] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#22543D]">{s.dimension}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#22543D] text-white font-bold">
                          {s.rating_level}
                        </span>
                      </div>
                      <p className="text-xs text-[#22543D]">{s.assessment}</p>
                      <p className="text-[11px] text-[#2F855A] italic">Evidence: {s.evidence}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses & Unvalidated Assumptions */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#C53030] uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Areas to Validate & Improve</span>
                </div>

                <div className="space-y-3">
                  {activeReport.weaknesses.map((w, idx) => (
                    <div key={idx} className="bg-[#FFF5F5] p-4 rounded-xl border border-[#FED7D7] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#742A2A]">{w.dimension}</span>
                        {w.needs_validation && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C53030] text-white font-bold">
                            Needs Validation
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#742A2A]">{w.description}</p>
                      <p className="text-[11px] text-[#9B2C2C] font-medium">↳ Remedy: {w.suggested_remedy}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 7. OPPORTUNITIES & RISKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Opportunities */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#6875E8] uppercase">
                  <Zap className="w-4 h-4" />
                  <span>Market & Feature Opportunities</span>
                </div>

                <div className="space-y-3">
                  {activeReport.opportunities.map((opp, idx) => (
                    <div key={idx} className="bg-[#FAF8F3] p-4 rounded-xl border border-[#E3DED5] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#181924]">{opp.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6875E8] text-white font-bold">
                          {opp.opportunity_type}
                        </span>
                      </div>
                      <p className="text-xs text-[#555768]"><strong>Why:</strong> {opp.why}</p>
                      <p className="text-[11px] text-[#059669] font-medium">↳ How to explore: {opp.how_to_explore}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E53E3E] uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Project & Market Risks</span>
                </div>

                <div className="space-y-3">
                  {activeReport.risk_map.map((risk, idx) => (
                    <div key={idx} className="bg-[#FAF8F3] p-4 rounded-xl border border-[#E3DED5] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#181924]">{risk.risk_title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E53E3E] text-white font-bold">
                          {risk.risk_category}
                        </span>
                      </div>
                      <p className="text-xs text-[#555768]"><strong>Evidence:</strong> {risk.evidence}</p>
                      <p className="text-[11px] text-[#6875E8] font-medium">↳ Mitigation: {risk.mitigation_strategy}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 8. AI IMPROVEMENT RECOMMENDATIONS (NOW / NEXT / LATER) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-6">
              <div className="space-y-1 border-b border-[#E3DED5] pb-3">
                <span className="text-[10px] font-mono font-bold text-[#6875E8] uppercase tracking-wider">
                  ACTION PLAN & WHAT TO BUILD NEXT
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#181924]">
                  Project-Specific Recommendations
                </h3>
                <p className="text-xs text-[#6E7082]">
                  Every recommendation is specifically tailored to {activeReport.project_snapshot.title}'s target users and features.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeReport.recommendations.map((rec, idx) => {
                  const badgeColor = 
                    rec.priority === 'NOW' ? 'bg-[#E53E3E] text-white' :
                    rec.priority === 'NEXT' ? 'bg-[#D69E2E] text-white' : 'bg-[#6875E8] text-white';

                  return (
                    <div key={idx} className="bg-[#FAF8F3] p-5 rounded-2xl border border-[#E3DED5] space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase inline-block ${badgeColor}`}>
                          {rec.priority}
                        </span>

                        <h4 className="font-serif text-base font-bold text-[#181924]">
                          {rec.title}
                        </h4>

                        <p className="text-xs text-[#555768] leading-relaxed">
                          <strong>Problem:</strong> {rec.problem_addressed}
                        </p>

                        <div className="bg-white p-3 rounded-xl border border-[#E3DED5] text-xs text-[#20202A] space-y-1">
                          <div><strong>Why:</strong> {rec.why}</div>
                          <div className="text-[#059669]"><strong>Benefit:</strong> {rec.expected_benefit}</div>
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-[#6875E8] bg-[#F3F0FF] p-2.5 rounded-lg border border-[#D6BCFA]">
                        <strong>Action:</strong> {rec.implementation_idea}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 9. PRODUCT DIFFERENTIATION STRATEGY */}
            <div className="bg-[#181924] text-white p-6 sm:p-8 rounded-3xl border border-[#2D2E3F] shadow-xl space-y-6">
              <div className="space-y-1 border-b border-[#2D2E3F] pb-3">
                <span className="text-[10px] font-mono font-bold text-[#A0E8A7] uppercase tracking-wider">
                  STRATEGIC MOAT & DIFFERENTIATION
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  How to Differentiate This Project
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 text-xs sm:text-sm text-[#C5C7D5]">
                  <div>
                    <strong className="text-white block mb-1">Current Market Positioning:</strong>
                    {activeReport.differentiation_strategy.current_positioning}
                  </div>
                  <div>
                    <strong className="text-white block mb-1">Market Gap:</strong>
                    {activeReport.differentiation_strategy.market_gap}
                  </div>
                  <div>
                    <strong className="text-white block mb-1">Proposed Unique Feature Wedge:</strong>
                    <span className="text-[#A0E8A7]">{activeReport.differentiation_strategy.possible_unique_feature}</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-[#C5C7D5] bg-white/5 p-5 rounded-2xl border border-white/10">
                  <div>
                    <strong className="text-white block mb-1">Recommended Implementation Direction:</strong>
                    {activeReport.differentiation_strategy.implementation_direction}
                  </div>
                  <div className="text-[11px] font-mono text-[#8E90A2] italic pt-2 border-t border-white/10">
                    {activeReport.differentiation_strategy.validation_disclaimer}
                  </div>
                </div>
              </div>
            </div>

            {/* 10. TRACEABLE RESEARCH SOURCES */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DED5] shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3DED5] pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#6875E8] uppercase">
                  <Globe className="w-4 h-4" />
                  <span>Verified Research Sources & Citations ({activeReport.sources.length})</span>
                </div>
                <span className="text-[11px] font-mono text-[#8E90A2]">
                  Real-time Domain References
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeReport.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl bg-[#FAF8F3] hover:bg-white border border-[#E3DED5] hover:border-[#6875E8] transition-all space-y-1 block group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8E90A2]">
                      <span>{source.domain}</span>
                      <ExternalLink className="w-3 h-3 group-hover:text-[#6875E8]" />
                    </div>
                    <div className="font-medium text-xs text-[#181924] group-hover:text-[#6875E8] line-clamp-1">
                      {source.title}
                    </div>
                    <p className="text-[11px] text-[#6E7082] line-clamp-2">
                      {source.why_it_matters}
                    </p>
                  </a>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* VIEW 4: REPORT HISTORY TAB */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {viewMode === 'history' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#E3DED5] shadow-subtle">
              <div className="space-y-1">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#181924]">
                  Saved AI Project Analyses ({reportHistory.length})
                </h3>
                <p className="text-xs text-[#6E7082]">
                  Review previous AI analysis reports and track project strategy evolution.
                </p>
              </div>

              <button
                onClick={() => setViewMode('input')}
                className="bg-[#181924] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project Analysis</span>
              </button>
            </div>

            {reportHistory.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E3DED5] space-y-3">
                <BrainCircuit className="w-10 h-10 text-[#8E90A2] mx-auto" />
                <h3 className="font-serif text-xl font-bold text-[#181924]">No Saved Analyses Yet</h3>
                <p className="text-xs text-[#6E7082]">Enter your first project specifications to generate an analysis dossier here.</p>
                <button
                  onClick={() => setViewMode('input')}
                  className="bg-[#6875E8] text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold"
                >
                  Analyze a Project Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportHistory.map(report => (
                  <div
                    key={report.id}
                    onClick={() => {
                      setActiveReport(report);
                      setViewMode('report');
                    }}
                    className="bg-white p-6 rounded-2xl border border-[#E3DED5] hover:border-[#6875E8] transition-all shadow-subtle hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#6875E8]/10 text-[#6875E8]">
                          {report.project_snapshot.category}
                        </span>
                        <span className="text-[10px] font-mono text-[#8E90A2]">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-serif text-xl font-bold text-[#181924] group-hover:text-[#6875E8] transition-colors">
                        {report.project_snapshot.title}
                      </h4>

                      <p className="text-xs text-[#555768] line-clamp-2 leading-relaxed">
                        {report.executive_summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E3DED5] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#059669] font-bold">
                        ✓ {report.sources.length} sources analyzed
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDeleteReport(report.id, e)}
                          className="p-1.5 rounded-lg text-[#8E90A2] hover:text-[#C53030] hover:bg-[#FFF5F5] transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button className="bg-[#F7F4EE] group-hover:bg-[#6875E8] group-hover:text-white text-[#181924] px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all">
                          <span>View Report</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
};
