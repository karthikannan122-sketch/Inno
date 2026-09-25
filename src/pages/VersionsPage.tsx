import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  GitBranch, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertCircle,
  Check,
  Bookmark,
  XCircle,
  Layers,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';
import { Badge } from '../components/common/Badge';
import { RoadmapWorkflowStudio } from '../components/research/RoadmapWorkflowStudio';

interface VersionsPageProps {
  projectId?: string;
  onNavigate?: (view: string, id?: string) => void;
  onBack?: () => void;
}

export const VersionsPage: React.FC<VersionsPageProps> = ({ 
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
  const { 
    projects, 
    getProjectById, 
    getVersionsByProjectId, 
    getReviewsByProjectId,
    getDecisionsByProjectId,
    saveFeedbackDecision,
    createNewVersion 
  } = useProjects();

  const userProjects = projects.filter(p => p.owner_id === (user?.id || 'current') || p.owner_id.startsWith('demo-creator'));
  const activeProjectId = projectId || userProjects[0]?.id || projects[0]?.id;
  const project = getProjectById(activeProjectId);

  // Tab state: 'roadmap' (default) vs 'milestones'
  const [activeTab, setActiveTab] = useState<'roadmap' | 'milestones'>('roadmap');

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [changesSummary, setChangesSummary] = useState('');
  const [creating, setCreating] = useState(false);
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);

  if (!project) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-innovexa-border space-y-4">
        <h3 className="font-serif text-2xl font-bold text-innovexa-ink">No Project Selected</h3>
        <p className="text-xs text-innovexa-ink-muted">Select an innovation to manage roadmap and version milestones.</p>
        <button onClick={onBack} className="bg-innovexa-ink text-white px-6 py-2 rounded-full text-xs font-mono">
          ← Return
        </button>
      </div>
    );
  }

  const versions = getVersionsByProjectId(project.id);
  const reviews = getReviewsByProjectId(project.id);
  const decisions = getDecisionsByProjectId(project.id);

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !changesSummary.trim()) return;

    setCreating(true);
    const res = await createNewVersion(
      project.id,
      newTitle,
      newDescription || project.solution_description,
      changesSummary
    );
    setCreating(false);

    if (!res.error) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      setShowNewVersionModal(false);
      setNewTitle('');
      setChangesSummary('');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Navigation & Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono font-semibold text-innovexa-ink-muted hover:text-innovexa-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Project</span>
        </button>

        {/* Studio View Mode Switcher */}
        <div className="flex items-center p-1 bg-[#F7F4EE] rounded-2xl border border-[#E5E0D6] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'roadmap'
                ? 'bg-[#181924] text-white shadow-subtle'
                : 'text-[#555768] hover:text-[#181924]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6875E8]" />
            <span>AI ROADMAP & RESEARCH STUDIO</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'milestones'
                ? 'bg-[#181924] text-white shadow-subtle'
                : 'text-[#555768] hover:text-[#181924]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-[#E8B653]" />
            <span>MILESTONES & TRIAGE ({versions.length})</span>
          </button>
        </div>

        <button
          onClick={() => setShowNewVersionModal(true)}
          className="bg-innovexa-amber hover:bg-[#D9A33E] text-white px-5 py-2 rounded-full text-xs font-mono font-semibold flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Version {project.current_version + 1}</span>
        </button>
      </div>

      {/* Conditional Rendering Based on Active Tab */}
      {activeTab === 'roadmap' ? (
        <RoadmapWorkflowStudio
          initialProject={project}
          allProjects={projects}
          onNavigate={onNavigate}
          onVersionCreated={(title, changelog) => {
            createNewVersion(project.id, title, project.solution_description, changelog);
          }}
        />
      ) : (
        <div className="space-y-8">
          {/* Header Info */}
          <SlideUp delay={0.05}>
            <div className="bg-white rounded-3xl border border-innovexa-border p-6 lg:p-8 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="text-[10px] font-mono font-bold tracking-widest text-innovexa-amber uppercase flex items-center gap-2">
                  <span>IMPROVEMENT & VERSIONING SYSTEM</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-innovexa-amber"></span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-innovexa-ink">
                  {project.title} — Version Management
                </h1>
                <p className="text-xs text-innovexa-ink-muted">
                  Triage community feedback suggestions, make intentional product decisions, and document changelog milestones.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-innovexa-bg-subtle p-3 rounded-2xl border border-innovexa-border-subtle shrink-0">
                <div className="text-center px-2">
                  <div className="text-[10px] font-mono text-innovexa-ink-muted uppercase">Active</div>
                  <div className="font-serif text-xl font-bold text-innovexa-ink">v{project.current_version}</div>
                </div>
                <div className="border-l border-innovexa-border h-8" />
                <div className="text-center px-2">
                  <div className="text-[10px] font-mono text-innovexa-ink-muted uppercase">Milestones</div>
                  <div className="font-serif text-xl font-bold text-innovexa-amber">{versions.length}</div>
                </div>
              </div>
            </div>
          </SlideUp>

          {/* 2 Columns: Feedback Triage & Version History Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Community Suggestions Triage */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-innovexa-ink">
                    Community Feedback Triage
                  </h3>
                  <p className="text-xs text-innovexa-ink-muted">
                    Decide what to incorporate into your next version: Apply, Save for Later, or Ignore.
                  </p>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-innovexa-border p-8 text-center text-xs text-innovexa-ink-muted">
                  No reviews available to triage yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map(r => {
                    const decision = decisions.find(d => d.review_id === r.id)?.decision;
                    return (
                      <div key={r.id} className="bg-white rounded-3xl border border-innovexa-border p-5 shadow-subtle space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-innovexa-ink">{r.reviewer_name}</span>
                          <Badge variant="purple">{r.review_type}</Badge>
                        </div>

                        <p className="text-xs text-innovexa-ink-muted italic leading-relaxed">
                          "{r.suggestion || 'Recognized high problem relevance.'}"
                        </p>

                        {/* Decision Buttons */}
                        <div className="pt-2 border-t border-innovexa-border-subtle flex items-center justify-between">
                          <span className="text-[10px] font-mono text-innovexa-ink-muted uppercase">
                            Current Status: <strong className="text-innovexa-ink">{decision ? decision.replace('_', ' ') : 'Pending'}</strong>
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => saveFeedbackDecision(project.id, r.id, 'apply')}
                              className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                                decision === 'apply'
                                  ? 'bg-emerald-600 text-white font-bold'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              ✓ Apply
                            </button>
                            <button
                              onClick={() => saveFeedbackDecision(project.id, r.id, 'save_later')}
                              className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                                decision === 'save_later'
                                  ? 'bg-amber-600 text-white font-bold'
                                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                              }`}
                            >
                              Later
                            </button>
                            <button
                              onClick={() => saveFeedbackDecision(project.id, r.id, 'ignore')}
                              className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                                decision === 'ignore'
                                  ? 'bg-gray-700 text-white font-bold'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                              }`}
                            >
                              Ignore
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Version History Timeline */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-innovexa-ink">
                Version Timeline & Changelog
              </h3>

              <div className="bg-white rounded-3xl border border-innovexa-border p-6 shadow-subtle space-y-6 relative before:absolute before:left-6 before:top-6 before:bottom-6 before:w-0.5 before:bg-innovexa-border">
                {versions.map((v, idx) => (
                  <div key={v.id} className="relative pl-8 space-y-2">
                    <div className={`absolute left-4.5 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      idx === 0 ? 'bg-innovexa-coral' : 'bg-innovexa-amber'
                    }`} />

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-innovexa-amber uppercase">
                        VERSION {v.version_number} {idx === 0 && '(CURRENT)'}
                      </span>
                      <span className="text-[10px] font-mono text-innovexa-ink-muted">
                        {new Date(v.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-serif text-lg font-bold text-innovexa-ink">{v.title}</h4>
                    <p className="text-xs text-innovexa-ink leading-relaxed">{v.description}</p>
                    <div className="p-3 bg-innovexa-bg-subtle/60 rounded-xl text-xs font-mono text-innovexa-ink-muted border border-innovexa-border-subtle">
                      <span className="text-innovexa-ink font-bold block mb-0.5">Changelog Summary:</span>
                      {v.changes_summary}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Create New Version */}
      {showNewVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-innovexa-ink/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-innovexa-border max-w-lg w-full p-8 shadow-float space-y-6">
            <div className="flex items-center justify-between border-b border-innovexa-border-subtle pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-innovexa-amber uppercase">INCREMENT RELEASE</span>
                <h3 className="font-serif text-2xl font-bold text-innovexa-ink">
                  Create Version {project.current_version + 1}
                </h3>
              </div>
              <button 
                onClick={() => setShowNewVersionModal(false)}
                className="text-xs font-mono text-innovexa-ink-muted hover:text-innovexa-ink"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateVersion} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-innovexa-ink-muted uppercase">Version Milestone Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Improved Target Audience & Added Calendar Sync"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-amber rounded-xl text-xs text-innovexa-ink outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-innovexa-ink-muted uppercase">Updated Solution Description</label>
                <textarea
                  rows={3}
                  placeholder={project.solution_description}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-3 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-amber rounded-xl text-xs text-innovexa-ink outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-innovexa-ink-muted uppercase">What Changed? (Changelog Summary) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize the core improvements made based on community feedback..."
                  value={changesSummary}
                  onChange={(e) => setChangesSummary(e.target.value)}
                  className="w-full p-3 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-amber rounded-xl text-xs text-innovexa-ink outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewVersionModal(false)}
                  className="text-xs font-mono text-innovexa-ink-muted hover:text-innovexa-ink px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-innovexa-amber hover:bg-[#D9A33E] text-white px-6 py-2.5 rounded-full text-xs font-mono font-semibold shadow-sm"
                >
                  {creating ? 'PUBLISHING...' : 'CONFIRM & RELEASE →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
