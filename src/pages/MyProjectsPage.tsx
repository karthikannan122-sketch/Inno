import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, GitBranch, Eye, Pencil, Trash2, Rocket } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { SlideUp } from '../components/common/MotionWrapper';
import { CategoryBadge, TypeBadge, StatusBadge } from '../components/common/Badge';

interface MyProjectsPageProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const MyProjectsPage: React.FC<MyProjectsPageProps> = ({ onNavigate: propOnNavigate }) => {
  const routerNavigate = useNavigate();
  const onNavigate = propOnNavigate || ((view: string, id?: string) => {
    if (id) routerNavigate(`/projects/${id}`);
    else routerNavigate(`/${view}`);
  });
  const { user } = useAuth();
  const { projects, deleteProject } = useProjects();

  const userId = user?.id || 'current';
  const myProjects = projects.filter(
    p => p.owner_id === userId || p.owner_id === 'current' || (p.owner_id.startsWith('demo-creator-01') && !user)
  );

  const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'under_review' | 'published' | 'archived'>('all');
  const [projectToDelete, setProjectToDelete] = useState<typeof projects[0] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);

  const filters = [
    { id: 'all',          label: 'ALL',           count: myProjects.length },
    { id: 'draft',        label: 'DRAFTS',        count: myProjects.filter(p => p.status === 'draft').length },
    { id: 'under_review', label: 'VALIDATING',    count: myProjects.filter(p => p.status === 'under_review').length },
    { id: 'published',    label: 'PUBLISHED',     count: myProjects.filter(p => p.status === 'published').length },
    { id: 'archived',     label: 'ARCHIVED',      count: myProjects.filter(p => p.status === 'archived').length },
  ];

  const filteredProjects = activeFilter === 'all'
    ? myProjects
    : myProjects.filter(p => p.status === activeFilter);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    const title = projectToDelete.title;
    if (deleteProject) {
      await deleteProject(projectToDelete.id);
    }
    setIsDeleting(false);
    setProjectToDelete(null);
    setDeleteToast(`"${title}" was permanently removed.`);
    setTimeout(() => setDeleteToast(null), 3500);
  };

  return (
    <div className="space-y-8 pb-14">

      {/* Delete Success Toast */}
      {deleteToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#181924] text-white border border-[#E66F82]/40 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-mono animate-in slide-in-from-top duration-200">
          <Trash2 className="w-4 h-4 text-[#E66F82]" />
          <span>{deleteToast}</span>
        </div>
      )}

      {/* ── Header ── */}
      <SlideUp delay={0.05}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-2">
            <div className="section-label" style={{ color: 'var(--color-peach)' }}>
              <span>MY PORTFOLIO PIPELINE</span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-peach)' }} />
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5vw, 52px)',
                color: 'var(--color-ink)',
                lineHeight: 1.0,
                letterSpacing: '-0.02em',
              }}
            >
              MY INNOVATIONS.
            </h1>
            <div
              className="editorial-italic"
              style={{
                fontFamily: 'var(--font-editorial)',
                fontStyle: 'italic',
                fontWeight: 600,
                fontSize: '22px',
                color: '#E66F82',
              }}
            >
              {myProjects.length} active specimen{myProjects.length !== 1 ? 's' : ''}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', maxWidth: '520px', lineHeight: 1.7 }}>
              Manage your ideas, track validation readiness, release new version milestones, and deploy to the ecosystem.
            </p>
          </div>

          <button
            onClick={() => onNavigate('create')}
            className="btn-primary self-start md:self-auto shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEW INNOVATION</span>
          </button>
        </div>
      </SlideUp>

      {/* ── Filter Tabs ── */}
      <div
        className="flex items-center gap-0.5 p-0.5 self-start overflow-x-auto"
        style={{
          background: 'var(--color-bg-subtle)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
        }}
      >
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id as any)}
            className="flex items-center gap-1.5 font-mono whitespace-nowrap transition-all"
            style={{
              fontSize: '10px',
              letterSpacing: '0.1em',
              padding: '6px 14px',
              borderRadius: '10px',
              background: activeFilter === f.id ? 'var(--color-surface)' : 'transparent',
              color: activeFilter === f.id ? 'var(--color-ink)' : 'var(--color-muted)',
              fontWeight: activeFilter === f.id ? 600 : 400,
              boxShadow: activeFilter === f.id ? '0 1px 4px rgba(32,32,42,0.08)' : 'none',
            }}
          >
            <span>{f.label}</span>
            <span
              className="font-bold"
              style={{
                fontSize: '9px',
                padding: '1px 5px',
                borderRadius: '5px',
                background: activeFilter === f.id ? 'var(--color-coral)' : 'rgba(98,97,106,0.12)',
                color: activeFilter === f.id ? 'white' : 'var(--color-muted)',
              }}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Empty State ── */}
      {filteredProjects.length === 0 ? (
        <div
          className="p-14 text-center rounded-[12px] space-y-5"
          style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border)' }}
        >
          <div
            className="w-14 h-14 rounded-[12px] flex items-center justify-center mx-auto"
            style={{ background: 'rgba(230,111,130,0.08)' }}
          >
            <FolderKanban className="w-7 h-7" style={{ color: 'var(--color-coral)' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-ink)' }}>
              NOTHING HERE YET.
            </h3>
            <p className="text-xs mt-1.5" style={{ color: 'var(--color-muted)', maxWidth: '380px', margin: '6px auto 0' }}>
              {activeFilter === 'all'
                ? "You haven't submitted any projects yet. Start by submitting your problem statement."
                : `No ${activeFilter.replace('_', ' ')} projects to show.`}
            </p>
          </div>
          {activeFilter === 'all' && (
            <button onClick={() => onNavigate('create')} className="btn-primary mx-auto">
              SUBMIT FIRST INNOVATION →
            </button>
          )}
        </div>
      ) : (
        /* ── Project Grid ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((p, idx) => (
            <SlideUp key={p.id} delay={0.04 + idx * 0.04}>
              <div
                className="rounded-[12px] flex flex-col transition-all h-full"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-peach)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px -6px rgba(32,32,42,0.1)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {/* Readiness bar */}
                <div
                  className="h-0.5 w-full"
                  style={{
                    background: 'var(--color-border)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${p.readiness_score ?? 50}%`,
                      background: (p.readiness_score ?? 0) >= 70 ? 'var(--color-mint)' : (p.readiness_score ?? 0) >= 40 ? 'var(--color-peach)' : 'var(--color-coral)',
                      borderRadius: '0 2px 2px 0',
                    }}
                  />
                </div>

                <div className="p-6 flex flex-col gap-4 flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <TypeBadge type={p.project_type} />
                      <CategoryBadge category={p.category} />
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <h3
                      onClick={() => onNavigate('project-detail', p.id)}
                      className="cursor-pointer transition-colors"
                      style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)', letterSpacing: '-0.01em', lineHeight: 1.2 }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--color-coral)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--color-ink)')}
                    >
                      {p.title}
                    </h3>
                    <p className="font-mono font-bold" style={{ fontSize: '10px', color: 'var(--color-coral)', letterSpacing: '0.04em' }}>
                      {p.problem_title}
                    </p>
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--color-muted)', lineHeight: 1.65 }}>
                      {p.solution_description}
                    </p>
                  </div>

                  {/* Metrics row */}
                  <div className="flex items-center gap-5 font-mono" style={{ fontSize: '10px', color: 'var(--color-light)' }}>
                    <span>
                      <span className="font-bold" style={{ color: 'var(--color-mint)' }}>{p.readiness_score || 50}%</span>
                      {' '}READINESS
                    </span>
                    <span>{p.reviews_count || 0} PERSPECTIVES</span>
                    <span style={{ color: 'var(--color-lavender)', fontWeight: 600 }}>v{p.current_version}</span>
                  </div>

                  {/* Actions */}
                  <div
                    className="pt-3 flex flex-wrap items-center justify-between gap-2"
                    style={{ borderTop: '1px solid var(--color-border-sub)', marginTop: 'auto' }}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => onNavigate('project-detail', p.id)}
                        className="flex items-center gap-1.5 font-mono font-bold text-white transition-all"
                        style={{
                          fontSize: '10px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'var(--color-ink)',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#3a3a4a')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-ink)')}
                      >
                        <Eye className="w-3 h-3" />
                        <span>VIEW →</span>
                      </button>

                      <button
                        onClick={() => onNavigate('project-edit', p.id)}
                        className="flex items-center gap-1.5 font-mono font-semibold transition-all"
                        style={{
                          fontSize: '10px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          color: 'var(--color-muted)',
                          border: '1px solid var(--color-border)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-subtle)';
                          (e.currentTarget as HTMLElement).style.color = 'var(--color-ink)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)';
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                        <span>EDIT</span>
                      </button>

                      <button
                        onClick={() => onNavigate('versions', p.id)}
                        className="flex items-center gap-1.5 font-mono font-semibold transition-all"
                        style={{
                          fontSize: '10px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          color: 'var(--color-peach)',
                          border: `1px solid rgba(231,180,124,0.28)`,
                          background: 'rgba(231,180,124,0.06)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        <GitBranch className="w-3 h-3" />
                        <span>v{p.current_version + 1}</span>
                      </button>
                    </div>

                    {/* Prominent Delete Option */}
                    <button
                      onClick={() => setProjectToDelete(p)}
                      title="Delete this project"
                      className="flex items-center gap-1 font-mono font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-red-200/80 bg-red-50/60 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">DELETE</span>
                    </button>
                  </div>
                </div>
              </div>
            </SlideUp>
          ))}
        </div>
      )}

      {/* ── Enhanced Delete Confirmation Modal ── */}
      {projectToDelete && (
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
                {projectToDelete.title}
              </div>
              <p className="text-xs text-[#6E7082] leading-relaxed">
                Are you sure you want to permanently delete this project? All associated review feedback, roadmap progress, versions, and validation records will be erased.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold border border-[#E3DED5] text-[#555768] hover:bg-[#F7F4EE] transition-colors"
              >
                CANCEL
              </button>
              
              <button
                type="button"
                onClick={handleDelete}
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
