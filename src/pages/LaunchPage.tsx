import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  ArrowLeft, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  Globe, 
  Layers, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';
import { Badge, CategoryBadge, TypeBadge } from '../components/common/Badge';

interface LaunchPageProps {
  projectId?: string;
  onNavigate?: (view: string, id?: string) => void;
  onBack?: () => void;
}

export const LaunchPage: React.FC<LaunchPageProps> = ({ 
  projectId: propProjectId, 
  onNavigate: propOnNavigate, 
  onBack: propOnBack 
}) => {
  const params = useParams<{ id: string }>();
  const routerNavigate = useNavigate();

  const projectId = propProjectId || params.id;
  const onBack = propOnBack || (() => routerNavigate(projectId ? `/projects/${projectId}` : '/explore'));
  const onNavigate = propOnNavigate || ((view: string, id?: string) => {
    if (id) routerNavigate(`/projects/${id}`);
    else routerNavigate(`/${view}`);
  });
  const { user } = useAuth();
  const { projects, getProjectById, getReviewsByProjectId, getVersionsByProjectId, publishProject, updateProject } = useProjects();

  const userProjects = projects.filter(p => p.owner_id === (user?.id || 'current') || p.owner_id.startsWith('demo-creator'));
  const activeProjectId = projectId || userProjects[0]?.id || projects[0]?.id;
  const project = getProjectById(activeProjectId);

  const [liveUrlInput, setLiveUrlInput] = useState(project?.live_url || '');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(project?.status === 'published');

  if (!project) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-innovexa-border space-y-4">
        <h3 className="font-serif text-2xl font-bold text-innovexa-ink">Project Not Found</h3>
        <p className="text-xs text-innovexa-ink-muted">Select an innovation to proceed with launch.</p>
        <button onClick={onBack} className="bg-innovexa-ink text-white px-6 py-2 rounded-full text-xs font-mono">
          ← Return
        </button>
      </div>
    );
  }

  const reviews = getReviewsByProjectId(project.id);
  const versions = getVersionsByProjectId(project.id);

  const handlePublish = async () => {
    setPublishing(true);
    if (liveUrlInput.trim() && liveUrlInput !== project.live_url) {
      await updateProject(project.id, { live_url: liveUrlInput.trim() });
    }
    const res = await publishProject(project.id);
    setPublishing(false);

    if (!res.error) {
      setPublished(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#E96B7A', '#7C5CE6', '#5AAFA3', '#E8B653']
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono font-semibold text-innovexa-ink-muted hover:text-innovexa-ink"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Project</span>
        </button>
        <Badge variant="coral">LAUNCH GATEWAY</Badge>
      </div>

      {/* Main Header */}
      <SlideUp delay={0.05}>
        <div className="text-center space-y-3">
          <div className="text-[10px] font-mono font-bold tracking-widest text-innovexa-coral uppercase">
            COMMUNITY DEPLOYMENT
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-innovexa-ink">
            READY TO MAKE IT REAL?
          </h1>
          <p className="text-xs sm:text-sm text-innovexa-ink-muted max-w-xl mx-auto leading-relaxed">
            Validate your milestones, confirm optional live URLs, and publish {project.title} to the global INNOVEXA ecosystem.
          </p>
        </div>
      </SlideUp>

      {/* Published State Showcase */}
      {published ? (
        <SlideUp delay={0.1}>
          <div className="bg-white rounded-3xl border border-innovexa-border p-10 shadow-card text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-subtle">
              <Rocket className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 uppercase">
                PUBLISHED TO INNOVEXA
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-innovexa-ink">
                YOUR IDEA IS NOW PART OF THE COMMUNITY.
              </h2>
              <p className="text-xs text-innovexa-ink-muted max-w-md mx-auto leading-relaxed">
                "{project.title}" is now visible to all creators, builders, and community reviewers across the platform.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('project-detail', project.id)}
                className="bg-innovexa-ink hover:bg-black text-white px-7 py-3 rounded-full text-xs font-mono font-semibold tracking-wider transition-all"
              >
                VIEW LIVE PROJECT PAGE →
              </button>
              <button
                onClick={() => onNavigate('explore')}
                className="bg-white hover:bg-innovexa-bg-subtle text-innovexa-ink border border-innovexa-border px-6 py-3 rounded-full text-xs font-mono font-semibold transition-all"
              >
                EXPLORE COMMUNITY FEED
              </button>
            </div>
          </div>
        </SlideUp>
      ) : (
        /* Pre-launch Checklist & Confirmation */
        <SlideUp delay={0.1}>
          <div className="bg-white rounded-3xl border border-innovexa-border p-8 lg:p-10 shadow-card space-y-8">
            
            {/* Validation Health Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-innovexa-bg-subtle/60 border border-innovexa-border-subtle text-center">
                <div className="text-[10px] font-mono text-innovexa-ink-muted uppercase">Readiness Score</div>
                <div className="font-serif text-3xl font-bold text-emerald-600 mt-1">
                  {project.readiness_score || 50}%
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-innovexa-bg-subtle/60 border border-innovexa-border-subtle text-center">
                <div className="text-[10px] font-mono text-innovexa-ink-muted uppercase">Perspectives Gathered</div>
                <div className="font-serif text-3xl font-bold text-innovexa-purple mt-1">
                  {reviews.length}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-innovexa-bg-subtle/60 border border-innovexa-border-subtle text-center">
                <div className="text-[10px] font-mono text-innovexa-ink-muted uppercase">Version Milestones</div>
                <div className="font-serif text-3xl font-bold text-innovexa-amber mt-1">
                  v{project.current_version}
                </div>
              </div>
            </div>

            {/* Optional Live Link Input */}
            <div className="p-6 rounded-2xl bg-innovexa-bg-subtle/40 border border-innovexa-border space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-innovexa-ink uppercase">
                  Attach Live Demo or Website Link (Optional)
                </label>
                <span className="text-[10px] font-mono text-innovexa-ink-muted">Not required to publish</span>
              </div>
              <div className="relative">
                <Globe className="w-4 h-4 text-innovexa-ink-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://yourproduct.com"
                  value={liveUrlInput}
                  onChange={(e) => setLiveUrlInput(e.target.value)}
                  className="w-full bg-white border border-innovexa-border focus:border-innovexa-coral rounded-xl pl-10 pr-4 py-2.5 text-xs text-innovexa-ink outline-none"
                />
              </div>
            </div>

            {/* Ready Checklist */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono font-bold text-innovexa-ink-muted uppercase tracking-wider block">
                VALIDATION CHECKLIST
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-innovexa-ink">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Problem statement and solution hypothesis documented</span>
                </div>
                <div className="flex items-center gap-2.5 text-innovexa-ink">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Target audience and differentiation clarified</span>
                </div>
                <div className="flex items-center gap-2.5 text-innovexa-ink">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Initial community perspective feedback incorporated</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-innovexa-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => onNavigate('project-detail', project.id)}
                className="text-xs font-mono font-bold text-innovexa-ink-muted hover:text-innovexa-ink"
              >
                ← Continue Collecting Perspectives
              </button>

              <button
                onClick={handlePublish}
                disabled={publishing}
                className="w-full sm:w-auto bg-innovexa-coral hover:bg-[#DE5B6B] text-white px-8 py-3.5 rounded-full text-xs font-mono font-semibold tracking-wider shadow-card hover:shadow-glow-coral transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                <span>{publishing ? 'PUBLISHING TO INNOVEXA...' : 'PUBLISH TO INNOVEXA →'}</span>
              </button>
            </div>

          </div>
        </SlideUp>
      )}

    </div>
  );
};
