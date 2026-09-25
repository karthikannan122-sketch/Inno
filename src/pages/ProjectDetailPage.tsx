import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckSquare, 
  ExternalLink, 
  Code2, 
  Layers, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Rocket,
  GitBranch,
  BarChart3,
  MessageSquare,
  BrainCircuit,
  Trash2
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useReviewModal } from '../context/ReviewModalContext';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';
import { Badge, CategoryBadge, TypeBadge } from '../components/common/Badge';
import { SimilarSolutionsDifferentiator } from '../components/projects/SimilarSolutionsDifferentiator';
import { ProjectVoteButtons } from '../components/projects/ProjectVoteButtons';
import { ProjectResourceModal } from '../components/projects/ProjectResourceModal';
import { Package } from 'lucide-react';

interface ProjectDetailPageProps {
  projectId?: string;
  initialTab?: string;
  onBack?: () => void;
  onNavigate?: (view: string, id?: string) => void;
  onOpenReview?: (project: any) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ 
  projectId: propProjectId, 
  initialTab = 'overview',
  onBack: propOnBack, 
  onNavigate: propOnNavigate, 
  onOpenReview: propOnOpenReview 
}) => {
  const params = useParams<{ id: string }>();
  const routerNavigate = useNavigate();
  const { openReviewModal } = useReviewModal();

  const projectId = propProjectId || params.id || '';
  const onBack = propOnBack || (() => routerNavigate('/explore'));
  const onNavigate = propOnNavigate || ((view: string, id?: string) => {
    if (view === 'edit' || view === 'project-edit') routerNavigate(`/projects/${id || projectId}/edit`);
    else if (view === 'versions') routerNavigate(`/projects/${id || projectId}/versions`);
    else if (view === 'launch') routerNavigate(`/projects/${id || projectId}/launch`);
    else if (id) routerNavigate(`/projects/${id}`);
    else routerNavigate(`/${view}`);
  });
  const onOpenReview = propOnOpenReview || ((p: any) => openReviewModal(p));

  const { user } = useAuth();
  const { 
    getProjectById, 
    getReviewsByProjectId, 
    getVersionsByProjectId, 
    getRelationshipsByProjectId, 
    getDecisionsByProjectId,
    saveFeedbackDecision,
    getProjectInsights,
    deleteProject
  } = useProjects();

  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'details' | 'reviews' | 'insights' | 'roadmap' | 'activity'>(initialTab as any);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const project = getProjectById(projectId);

  // Track recently viewed projects
  React.useEffect(() => {
    if (project?.id) {
      try {
        const stored = localStorage.getItem('innovexa_recently_viewed_projects');
        const list: string[] = stored ? JSON.parse(stored) : [];
        const updated = [project.id, ...list.filter(id => id !== project.id)].slice(0, 10);
        localStorage.setItem('innovexa_recently_viewed_projects', JSON.stringify(updated));
      } catch (e) {}
    }
  }, [project?.id]);

  if (!project) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-innovexa-border space-y-4">
        <h3 className="font-serif text-2xl font-bold text-innovexa-ink">Project Not Found</h3>
        <p className="text-xs text-innovexa-ink-muted">The requested innovation may have been archived or removed.</p>
        <button onClick={onBack} className="bg-innovexa-ink text-white px-6 py-2 rounded-full text-xs font-mono">
          ← Return
        </button>
      </div>
    );
  }

  const reviews = getReviewsByProjectId(projectId);
  const versions = getVersionsByProjectId(projectId);
  const relationships = getRelationshipsByProjectId(projectId);
  const decisions = getDecisionsByProjectId(projectId);
  const insights = getProjectInsights(projectId);

  const isOwner = Boolean(user && (project.owner_id === user.id || project.owner_id === 'current' || project.owner_id.startsWith('demo-creator-01')));

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    if (deleteProject) {
      await deleteProject(project.id);
    }
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    routerNavigate('/my-projects');
  };

  const tabs = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'comparison', label: 'MARKET COMPARISON & UNIQUENESS' },
    { id: 'details', label: 'DETAILS' },
    { id: 'reviews', label: `REVIEWS (${reviews.length})` },
    { id: 'insights', label: 'INSIGHTS' },
    { id: 'roadmap', label: `ROADMAP (v${project.current_version})` },
    { id: 'activity', label: 'ACTIVITY' },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Breadcrumb Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono font-semibold text-innovexa-ink-muted hover:text-innovexa-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Innovations</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <ProjectVoteButtons projectId={project.id} size="sm" layout="horizontal" showLabels={false} />
          
          <button
            onClick={() => routerNavigate(`/ai-project-analyzer?projectId=${project.id}`)}
            className="bg-white hover:bg-innovexa-bg-subtle border border-[#6875E8]/40 text-[#6875E8] px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-[#6875E8]" />
            <span>AI Analyzer</span>
          </button>

          <button
            onClick={() => onNavigate('roadmap', project.id)}
            className="bg-white hover:bg-innovexa-bg-subtle border border-innovexa-border text-innovexa-ink px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6875E8]" />
            <span>AI Roadmap & Dossier</span>
          </button>

          {isOwner ? (
            <>
              <button
                onClick={() => routerNavigate(`/projects/${project.id}/validation`)}
                className="bg-gradient-to-r from-[#6875E8] to-[#5563D6] hover:from-[#5563D6] hover:to-[#4552C0] text-white px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Validation Insights</span>
              </button>

              <button
                onClick={() => onNavigate('versions', project.id)}
                className="bg-white hover:bg-innovexa-bg-subtle border border-innovexa-border text-innovexa-ink px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
              >
                <GitBranch className="w-3.5 h-3.5 text-innovexa-amber" />
                <span>Create v{project.current_version + 1}</span>
              </button>

              {project.status !== 'published' && (
                <button
                  onClick={() => onNavigate('launch', project.id)}
                  className="bg-innovexa-coral hover:bg-[#DE5B6B] text-white px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Launch Hub</span>
                </button>
              )}

              {/* Owner Delete Button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete this project"
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => routerNavigate(`/projects/${project.id}/review`)}
              className="bg-[#4FA89B] hover:bg-[#3D8F83] text-white px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Give Feedback</span>
            </button>
          )}
        </div>
      </div>

      {/* Project Hero Header Card */}
      <SlideUp delay={0.05}>
        <div className="bg-white rounded-3xl border border-innovexa-border overflow-hidden shadow-card">
          
          {/* Cover Banner */}
          <div className="relative h-60 w-full bg-innovexa-bg-subtle">
            <img
              src={project.cover_image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TypeBadge type={project.project_type} />
                <CategoryBadge category={project.category} />
              </div>
              <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full uppercase ${
                project.status === 'published' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-innovexa-amber text-black'
              }`}>
                {project.status === 'published' ? 'PUBLISHED COMMUNITY INNOVATION' : 'VALIDATION PHASE'}
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-white/80 uppercase">
                  Created by {project.owner_name || 'Innovator'}
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  {project.title}
                </h1>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <ProjectVoteButtons projectId={project.id} size="md" />
                {isOwner ? (
                  <button
                    onClick={() => routerNavigate(`/projects/${project.id}/validation`)}
                    className="bg-[#6875E8] hover:bg-[#5563D6] text-white px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider shadow-sm transition-all transform active:scale-95 flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>VALIDATION INSIGHTS →</span>
                  </button>
                ) : (
                  <button
                    onClick={() => routerNavigate(`/projects/${project.id}/review`)}
                    className="bg-[#4FA89B] hover:bg-[#3D8F83] text-white px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider shadow-sm transition-all transform active:scale-95 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>GIVE FEEDBACK →</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="p-6 bg-innovexa-bg-subtle/40 border-t border-innovexa-border-subtle grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded-2xl border border-innovexa-border-subtle">
              <div className="text-[10px] font-mono text-innovexa-ink-muted uppercase">Readiness Score</div>
              <div className="font-serif text-2xl font-bold text-emerald-600 mt-0.5">
                {project.readiness_score || 50}%
              </div>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-innovexa-border-subtle">
              <div className="text-[10px] font-mono text-innovexa-ink-muted uppercase">Perspectives</div>
              <div className="font-serif text-2xl font-bold text-innovexa-purple mt-0.5">
                {reviews.length}
              </div>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-innovexa-border-subtle">
              <div className="text-[10px] font-mono text-innovexa-ink-muted uppercase">Active Version</div>
              <div className="font-serif text-2xl font-bold text-innovexa-amber mt-0.5">
                v{project.current_version}
              </div>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-innovexa-border-subtle">
              <div className="text-[10px] font-mono text-innovexa-ink-muted uppercase">Visibility</div>
              <div className="font-serif text-2xl font-bold text-innovexa-blue mt-0.5 uppercase">
                {project.visibility}
              </div>
            </div>
          </div>

        </div>
      </SlideUp>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-innovexa-border pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-mono transition-all rounded-t-xl ${
              activeTab === tab.id
                ? 'border-b-2 border-innovexa-coral text-innovexa-ink font-bold bg-white'
                : 'text-innovexa-ink-muted hover:text-innovexa-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: MARKET COMPARISON & UNIQUENESS */}
      {activeTab === 'comparison' && (
        <div className="animate-in fade-in space-y-6">
          <SimilarSolutionsDifferentiator project={project} />
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
          
          <div className="lg:col-span-8 space-y-6">
            {/* Market Comparison Callout Banner */}
            <div className="bg-gradient-to-r from-[#181924] to-[#25283B] text-white p-6 rounded-3xl border border-[#3E4259] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E8B653]" />
                  <span className="text-[10px] font-mono font-bold text-[#E8B653] uppercase">SIMILAR SOLUTIONS ADVISOR</span>
                </div>
                <h4 className="font-serif text-xl font-bold text-white">Compare Against Existing Market Solutions</h4>
                <p className="text-xs text-white/80">See how this innovation uniquely differentiates from open-source tools and SaaS alternatives.</p>
              </div>
              <button
                onClick={() => setActiveTab('comparison')}
                className="bg-[#6875E8] hover:bg-[#5563D6] text-white px-5 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all shadow-subtle shrink-0"
              >
                VIEW COMPARISON MATRIX →
              </button>
            </div>

            {/* Problem & Solution Cards */}
            <div className="bg-white rounded-3xl border border-innovexa-border p-6 lg:p-8 space-y-6 shadow-subtle">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-coral uppercase">
                  PROBLEM STATEMENT
                </span>
                <h3 className="font-serif text-2xl font-bold text-innovexa-ink">
                  {project.problem_title}
                </h3>
                <p className="text-xs sm:text-sm text-innovexa-ink-muted leading-relaxed">
                  {project.problem_description}
                </p>
              </div>

              <div className="pt-4 border-t border-innovexa-border-subtle space-y-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-blue uppercase">
                  PROPOSED SOLUTION
                </span>
                <p className="text-xs sm:text-sm text-innovexa-ink leading-relaxed">
                  {project.solution_description}
                </p>
              </div>
            </div>

            {/* UVP & Differentiation */}
            <div className="bg-white rounded-3xl border border-innovexa-border p-6 lg:p-8 space-y-6 shadow-subtle">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-amber uppercase">
                    VALUE PROPOSITION
                  </span>
                  <p className="text-xs text-innovexa-ink leading-relaxed">
                    {project.value_proposition}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-teal uppercase">
                    TARGET AUDIENCE
                  </span>
                  <p className="text-xs text-innovexa-ink leading-relaxed">
                    {project.target_audience}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-innovexa-border-subtle space-y-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-purple uppercase">
                  DIFFERENTIATION AGAINST ALTERNATIVES
                </span>
                <p className="text-xs text-innovexa-ink-muted leading-relaxed">
                  {project.differentiation}
                </p>
              </div>
            </div>

            {/* Connected Related Projects Cluster */}
            <div className="bg-white rounded-3xl border border-innovexa-border p-6 lg:p-8 space-y-4 shadow-subtle">
              <div className="flex items-center justify-between border-b border-innovexa-border-subtle pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-purple uppercase">
                    CONNECTED ECOSYSTEM CLUSTER
                  </span>
                  <h4 className="font-serif text-xl font-bold text-innovexa-ink">
                    Related Innovations
                  </h4>
                </div>
                <Badge variant="purple">CONNECTED CLUSTER</Badge>
              </div>

              {relationships.length === 0 ? (
                <p className="text-xs text-innovexa-ink-muted">
                  No directly linked ecosystem clusters identified yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relationships.map(rel => {
                    const related = rel.related_project;
                    if (!related) return null;
                    return (
                      <div
                        key={rel.id}
                        onClick={() => onNavigate('project-detail', related.id)}
                        className="p-4 rounded-2xl bg-innovexa-bg-subtle/50 hover:bg-innovexa-bg-subtle border border-innovexa-border-subtle cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-innovexa-ink font-serif group-hover:text-innovexa-coral">
                            {related.title}
                          </span>
                          <CategoryBadge category={related.category} />
                        </div>
                        <p className="text-[11px] text-innovexa-ink-muted line-clamp-2">
                          {rel.explanation}
                        </p>
                        <div className="text-[10px] font-mono text-innovexa-purple font-semibold pt-1">
                          Relationship: {rel.relationship_type.replace('_', ' ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar Meta */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Artifacts */}
            <div className="bg-white rounded-3xl border border-innovexa-border p-6 shadow-subtle space-y-4">
              <span className="text-[10px] font-mono font-bold text-innovexa-ink-muted uppercase tracking-wider block">
                ARTIFACTS & LINKS
              </span>

              <div className="space-y-2">
                {project.live_url ? (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/60 border border-emerald-200 text-xs font-mono text-emerald-900 font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-emerald-600" />
                      <span>Live Website / App</span>
                    </div>
                    <span className="text-emerald-700">Open ↗</span>
                  </a>
                ) : (
                  <div className="p-3 rounded-2xl bg-innovexa-bg-subtle/40 border border-innovexa-border-subtle text-xs text-innovexa-ink-muted">
                    No live website provided (Concept phase).
                  </div>
                )}

                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-innovexa-bg-subtle hover:bg-white border border-innovexa-border text-xs font-mono text-innovexa-ink font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4" />
                      <span>Source Repository</span>
                    </div>
                    <span>View ↗</span>
                  </a>
                )}

                {/* Resource Hub Launcher */}
                <button
                  onClick={() => setIsResourceModalOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#6875E8]/10 hover:bg-[#6875E8]/20 border border-[#6875E8]/30 text-xs font-mono text-[#6875E8] font-bold transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#6875E8]" />
                    <span>Open Resource Hub & Stack</span>
                  </div>
                  <span>Explore →</span>
                </button>
              </div>
            </div>

            {/* Tags Card */}
            <div className="bg-white rounded-3xl border border-innovexa-border p-6 shadow-subtle space-y-3">
              <span className="text-[10px] font-mono font-bold text-innovexa-ink-muted uppercase tracking-wider block">
                CLASSIFICATION TAGS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map(t => (
                  <span key={t} className="text-xs font-mono bg-innovexa-bg-subtle text-innovexa-ink-muted px-2.5 py-1 rounded-lg border border-innovexa-border-subtle">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: DETAILS */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-3xl border border-innovexa-border p-8 shadow-subtle space-y-6 animate-in fade-in">
          <h3 className="font-serif text-2xl font-bold text-innovexa-ink">
            Comprehensive Innovation Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
            <div className="space-y-1.5 p-4 rounded-2xl bg-innovexa-bg-subtle/50">
              <span className="font-mono text-innovexa-ink-muted uppercase block">Problem Title:</span>
              <p className="font-semibold text-innovexa-ink">{project.problem_title}</p>
            </div>
            <div className="space-y-1.5 p-4 rounded-2xl bg-innovexa-bg-subtle/50">
              <span className="font-mono text-innovexa-ink-muted uppercase block">Target Audience:</span>
              <p className="text-innovexa-ink">{project.target_audience}</p>
            </div>
            <div className="space-y-1.5 p-4 rounded-2xl bg-innovexa-bg-subtle/50">
              <span className="font-mono text-innovexa-ink-muted uppercase block">Value Proposition:</span>
              <p className="text-innovexa-ink">{project.value_proposition}</p>
            </div>
            <div className="space-y-1.5 p-4 rounded-2xl bg-innovexa-bg-subtle/50">
              <span className="font-mono text-innovexa-ink-muted uppercase block">Differentiation:</span>
              <p className="text-innovexa-ink">{project.differentiation}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REVIEWS & PERSPECTIVES */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-innovexa-ink">
                Community Perspectives ({reviews.length})
              </h3>
              <p className="text-xs text-innovexa-ink-muted">
                Structured feedback from matched reviewers.
              </p>
            </div>
            {!isOwner && (
              <button
                onClick={() => onOpenReview(project)}
                className="bg-innovexa-purple hover:bg-[#6C4CD0] text-white px-5 py-2 rounded-full text-xs font-mono font-semibold"
              >
                Add Perspective +
              </button>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-innovexa-border p-12 text-center space-y-3">
              <p className="text-sm font-serif font-bold text-innovexa-ink">No perspectives submitted yet</p>
              <p className="text-xs text-innovexa-ink-muted">
                Be the first matched domain peer to submit a 4-question review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-3xl border border-innovexa-border p-6 shadow-subtle space-y-4">
                  <div className="flex items-center justify-between border-b border-innovexa-border-subtle pb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={r.reviewer_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=e96b7a'}
                        alt={r.reviewer_name}
                        className="w-8 h-8 rounded-full border border-innovexa-border object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold text-innovexa-ink">{r.reviewer_name}</div>
                        <div className="text-[10px] font-mono text-innovexa-ink-muted">{r.reviewer_role || 'Community Reviewer'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {r.is_demo && (
                        <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                          DEMO PERSPECTIVE
                        </span>
                      )}
                      <Badge variant="purple">{r.review_type}</Badge>
                    </div>
                  </div>

                  {/* 3 Signal Responses */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2 rounded-xl bg-innovexa-bg-subtle/50">
                      <div className="text-[9px] text-innovexa-ink-muted uppercase">Problem</div>
                      <div className="font-bold text-innovexa-ink uppercase">{r.problem_relevance}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-innovexa-bg-subtle/50">
                      <div className="text-[9px] text-innovexa-ink-muted uppercase">Solution</div>
                      <div className="font-bold text-innovexa-ink uppercase">{r.solution_clarity}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-innovexa-bg-subtle/50">
                      <div className="text-[9px] text-innovexa-ink-muted uppercase">Support</div>
                      <div className="font-bold text-innovexa-ink uppercase">{r.usefulness}</div>
                    </div>
                  </div>

                  {/* Suggestion Text */}
                  {r.suggestion && (
                    <div className="p-3 bg-innovexa-bg-subtle/30 rounded-2xl border border-innovexa-border-subtle text-xs text-innovexa-ink italic">
                      "{r.suggestion}"
                    </div>
                  )}

                  {/* Creator Triage Controls (if owner) */}
                  {isOwner && (
                    <div className="pt-2 flex items-center justify-between border-t border-innovexa-border-subtle text-[11px] font-mono">
                      <span className="text-innovexa-ink-muted">Action Triage:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => saveFeedbackDecision(project.id, r.id, 'apply')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold border border-emerald-200"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => saveFeedbackDecision(project.id, r.id, 'save_later')}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold border border-amber-200"
                        >
                          Later
                        </button>
                        <button
                          onClick={() => saveFeedbackDecision(project.id, r.id, 'ignore')}
                          className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: INSIGHTS & QUANTIFIED READINESS */}
      {activeTab === 'insights' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-innovexa-border p-8 shadow-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-innovexa-border-subtle pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-lavender uppercase">
                  QUANTIFIED VALIDATION ANALYSIS
                </span>
                <h3 className="font-serif text-3xl font-bold text-innovexa-ink">
                  Project Readiness: {insights.readiness_score}%
                </h3>
              </div>
              <Badge variant="purple">AI-ASSISTED SUMMARY</Badge>
            </div>

            <p className="text-xs text-innovexa-ink-muted">
              Readiness is calculated dynamically from {insights.total_reviews} community review signals across problem resonance, solution feasibility, and user adoption intent.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">Positive Signals</span>
                <ul className="text-xs text-emerald-900 space-y-1">
                  {insights.positive_signals.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{s.label} ({s.percentage}%)</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                <span className="text-[10px] font-mono font-bold text-amber-800 uppercase">Constructive Signals</span>
                <ul className="text-xs text-amber-900 space-y-1">
                  {insights.constructive_signals.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{s.label} ({s.percentage}%)</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-2">
                <span className="text-[10px] font-mono font-bold text-blue-800 uppercase">Synthesized Recommendation</span>
                <p className="text-xs text-blue-900 leading-relaxed">
                  {insights.ai_summary?.summary_text}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ROADMAP & VERSIONS */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Interactive Innovation Building Guide Feature Card */}
          <div className="bg-gradient-to-br from-[#181924] to-[#2A2B3C] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#2D2E3F] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#6875E8]/30 text-[#A0E8A7] text-[10px] font-mono font-bold tracking-wider uppercase border border-[#6875E8]/40">
                  ✦ 20-STAGE INNOVATION LIFECYCLE
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Interactive Innovation Building Guide & Workbench
                </h3>
                <p className="text-xs sm:text-sm text-[#C5C7D5] max-w-2xl leading-relaxed">
                  Step-by-step guidance from problem statement formulation and user research to architecture, development, AI integration, and launching.
                </p>
              </div>

              <button
                onClick={() => routerNavigate(`/projects/${project.id}/roadmap`)}
                className="bg-[#6875E8] hover:bg-[#5764D6] text-white px-6 py-3 rounded-2xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-subtle shrink-0"
              >
                <Sparkles className="w-4 h-4 text-[#A0E8A7]" />
                <span>Open Interactive Roadmap & Input Workbench →</span>
              </button>
            </div>

            {/* Quick summary of the project's current problem & solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#A0A2B4] uppercase">Step 01: Problem Statement</span>
                <p className="text-xs text-white line-clamp-2">
                  {project.problem_description || project.problem_title || 'No problem statement drafted yet.'}
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#A0E8A7] uppercase">Step 03: Solution Concept</span>
                <p className="text-xs text-white line-clamp-2">
                  {project.solution_description || 'No solution concept defined yet.'}
                </p>
              </div>
            </div>
          </div>

          {/* Milestone Evolution */}
          <div className="bg-white rounded-3xl border border-innovexa-border p-8 shadow-subtle space-y-6">
            <div className="flex items-center justify-between border-b border-innovexa-border-subtle pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-amber uppercase">
                  VERSION TIMELINE
                </span>
                <h3 className="font-serif text-2xl font-bold text-innovexa-ink">
                  Milestone Evolution
                </h3>
              </div>
              {isOwner && (
                <button
                  onClick={() => onNavigate('versions', project.id)}
                  className="bg-innovexa-amber hover:bg-[#D9A33E] text-white px-4 py-2 rounded-full text-xs font-mono font-semibold"
                >
                  Manage Versions →
                </button>
              )}
            </div>

            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-innovexa-border">
              {versions.map(v => (
                <div key={v.id} className="relative pl-8 space-y-1">
                  <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-innovexa-amber border-2 border-white" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-innovexa-amber uppercase">Version {v.version_number}</span>
                    <span className="text-[11px] font-mono text-innovexa-ink-light">
                      {new Date(v.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-innovexa-ink">{v.title}</h4>
                  <p className="text-xs text-innovexa-ink-muted">{v.changes_summary}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-3xl border border-innovexa-border p-8 shadow-subtle space-y-4 animate-in fade-in">
          <h3 className="font-serif text-2xl font-bold text-innovexa-ink">Project History & Log</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3 p-3 bg-innovexa-bg-subtle/50 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Project created on {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-innovexa-bg-subtle/50 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-innovexa-purple" />
              <span>{reviews.length} community perspectives gathered to date</span>
            </div>
          </div>
        </div>
      )}

      {/* Project Resource Hub Modal */}
      <ProjectResourceModal
        project={project}
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        onNavigateToRoadmap={id => onNavigate('roadmap', id)}
      />

      {/* Delete Confirmation Modal for Owner */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white border border-[#E3DED5] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center gap-3 text-red-600 border-b border-[#E3DED5] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#181924]">
                  Delete Innovation?
                </h3>
                <span className="text-[10px] font-mono text-red-600 uppercase font-bold tracking-wider">
                  Permanent Removal Action
                </span>
              </div>
            </div>

            <div className="bg-[#FAF8F3] p-4 rounded-2xl border border-[#E3DED5] space-y-2">
              <div className="text-xs font-mono font-bold text-[#181924] truncate">
                {project.title}
              </div>
              <p className="text-xs text-[#6E7082] leading-relaxed">
                Are you sure you want to permanently delete this project? All associated review feedback, roadmap progress, versions, and validation records will be erased.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold border border-[#E3DED5] text-[#555768] hover:bg-[#F7F4EE] transition-colors"
              >
                CANCEL
              </button>
              
              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                {isDeleting ? (
                  <span>DELETING...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>YES, DELETE INNOVATION</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
