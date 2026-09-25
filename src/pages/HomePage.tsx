import React from 'react';
import {
  Plus,
  FolderKanban,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Award,
  Eye,
  Compass,
  ThumbsUp,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { SlideUp, StaggerContainer, StaggerItem } from '../components/common/MotionWrapper';
import { Badge, CategoryBadge, TypeBadge, StatusBadge } from '../components/common/Badge';
import { useNavigate } from 'react-router-dom';
import { useReviewModal } from '../context/ReviewModalContext';
import { Interactive3DEcosystem } from '../components/home/Interactive3DEcosystem';
import { ProjectVoteButtons } from '../components/projects/ProjectVoteButtons';

interface HomePageProps {
  onNavigate?: (view: string, id?: string) => void;
  onOpenReview?: (project: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate: propOnNavigate,
  onOpenReview: propOnOpenReview
}) => {
  const routerNavigate = useNavigate();
  const { openReviewModal } = useReviewModal();

  const onNavigate = propOnNavigate || ((view: string, id?: string) => {
    if (id) routerNavigate(`/projects/${id}`);
    else routerNavigate(`/${view}`);
  });
  const onOpenReview = propOnOpenReview || ((p: any) => openReviewModal(p));

  const { user } = useAuth();
  const { projects, reviews, calculateMatchScore } = useProjects();

  const userId = user?.id || 'current';
  const myProjects         = projects.filter(p => p.owner_id === userId);
  const reviewsGiven       = reviews.filter(r => r.reviewer_id === userId);
  const myProjectIds       = new Set(myProjects.map(p => p.id));
  const perspectivesReceived = reviews.filter(r => myProjectIds.has(r.project_id));
  const reputationScore    = user?.reputation_score || 100;
  const userInterests      = user?.interests || ['Technology', 'Sustainability', 'Education'];

  const recommendedProjects = projects
    .filter(p => p.owner_id !== userId)
    .sort((a, b) => calculateMatchScore(b) - calculateMatchScore(a))
    .slice(0, 4);

  const needingAttention = projects
    .filter(p => p.owner_id !== userId && p.status === 'under_review')
    .slice(0, 3);

  const displayName = user?.full_name
    ? user.full_name.split(' ')[0].toUpperCase()
    : 'INNOVATOR';

  const stats = [
    {
      label: 'MY PROJECTS',
      value: myProjects.length,
      desc: myProjects.length > 0
        ? `${myProjects.filter(p => p.status === 'published').length} published`
        : 'No projects yet',
      icon: FolderKanban,
      accentColor: 'var(--color-coral)',
    },
    {
      label: 'REVIEWS GIVEN',
      value: reviewsGiven.length,
      desc: reviewsGiven.length > 0 ? 'Active community peer' : '0 reviews submitted',
      icon: CheckSquare,
      accentColor: 'var(--color-lavender)',
    },
    {
      label: 'PERSPECTIVES',
      value: perspectivesReceived.length,
      desc: perspectivesReceived.length > 0 ? 'Feedback received' : 'No feedback yet',
      icon: Sparkles,
      accentColor: 'var(--color-mint)',
    },
    {
      label: 'REPUTATION',
      value: reputationScore,
      desc: 'Platform trust rating',
      icon: Award,
      accentColor: 'var(--color-peach)',
    },
  ];

  return (
    <div className="space-y-10 pb-14">

      {/* ─────────────────────────────────
          01 / PERSONALIZED WORKSPACE — Hero
      ───────────────────────────────── */}
      <SlideUp delay={0.05}>
        <div
          className="rounded-[14px] overflow-hidden"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

            {/* Text side */}
            <div className="lg:col-span-6 p-8 lg:p-12 space-y-6">
              <div className="section-label">
                <span>01 / PERSONALIZED WORKSPACE</span>
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: 'var(--color-coral)' }}
                />
              </div>

              <div className="space-y-1">
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(38px, 5vw, 56px)',
                    color: 'var(--color-ink)',
                    lineHeight: 1.0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  WELCOME,
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(38px, 5vw, 56px)',
                    color: 'var(--color-ink)',
                    lineHeight: 1.0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {displayName}.
                </div>
                <div
                  className="editorial-italic"
                  style={{
                    fontFamily: 'var(--font-editorial)',
                    fontStyle: 'italic',
                    fontWeight: 600,
                    fontSize: 'clamp(22px, 2.8vw, 32px)',
                    color: '#E66F82',
                    lineHeight: 1.3,
                    marginTop: '4px',
                  }}
                >
                  stay curious.
                </div>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  color: 'var(--color-muted)',
                  lineHeight: 1.6,
                  maxWidth: '440px'
                }}
              >
                Your journey through the innovation ecosystem starts today.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => onNavigate('create')}
                  className="btn-primary"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>NEW IDEA →</span>
                </button>
                <button
                  onClick={() => onNavigate('explore')}
                  className="btn-secondary"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>EXPLORE</span>
                </button>
              </div>

              {/* Ecosystem metrics */}
              <div
                className="pt-5 grid grid-cols-3 gap-5"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '32px', color: 'var(--color-ink)', lineHeight: 1 }}>
                    {projects.length}
                  </div>
                  <div className="mono-label mt-1.5" style={{ fontSize: '10px', color: 'var(--color-light)' }}>
                    ACTIVE INNOVATIONS
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '32px', color: 'var(--color-blue)', lineHeight: 1 }}>
                    {reviews.length}
                  </div>
                  <div className="mono-label mt-1.5" style={{ fontSize: '10px', color: 'var(--color-light)' }}>
                    PEER REVIEWS
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '32px', color: 'var(--color-mint)', lineHeight: 1 }}>
                    100%
                  </div>
                  <div className="mono-label mt-1.5" style={{ fontSize: '10px', color: 'var(--color-light)' }}>
                    INTEGRITY
                  </div>
                </div>
              </div>
            </div>

            {/* 3D Visualization */}
            <div
              className="lg:col-span-6 min-h-[300px] lg:min-h-0"
              style={{ borderLeft: '1px solid var(--color-border)' }}
            >
              <Interactive3DEcosystem />
            </div>
          </div>
        </div>
      </SlideUp>

      {/* ─────────────────────────────────
          02 / TELEMETRY & PORTFOLIO METRICS
      ───────────────────────────────── */}
      <div className="space-y-4">
        <div className="section-label section-label-muted">
          <span>02 / TELEMETRY & PORTFOLIO METRICS</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <SlideUp key={stat.label} delay={0.05 + idx * 0.06}>
                <div
                  className="p-5 rounded-[12px] relative overflow-hidden transition-all hover:shadow-card cursor-default"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderTop: `3px solid ${stat.accentColor}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="font-mono uppercase tracking-wider"
                      style={{ fontSize: '9px', color: 'var(--color-muted)', letterSpacing: '0.14em' }}
                    >
                      {stat.label}
                    </span>
                    <div
                      className="w-7 h-7 rounded-[8px] flex items-center justify-center"
                      style={{ background: `${stat.accentColor}18` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: stat.accentColor }} />
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: stat.accentColor, lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div className="font-mono mt-1.5 truncate" style={{ fontSize: '10px', color: 'var(--color-light)' }}>
                    {stat.desc}
                  </div>
                </div>
              </SlideUp>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────
          03 / COMMUNITY PULSE
      ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT: My Innovations + Recommended */}
        <div className="lg:col-span-8 space-y-8">

          {/* My Innovations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-label section-label-muted mb-1">
                  <span>03 / MY INNOVATIONS</span>
                </div>
                <h3
                  style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)' }}
                >
                  Your active projects
                </h3>
              </div>
              <button
                onClick={() => onNavigate('my-projects')}
                className="btn-text"
              >
                View All ({myProjects.length}) →
              </button>
            </div>

            {myProjects.length === 0 ? (
              <div
                className="p-10 text-center rounded-[12px] space-y-4"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px dashed var(--color-border)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-[12px] flex items-center justify-center mx-auto"
                  style={{ background: 'rgba(230,111,130,0.08)' }}
                >
                  <FolderKanban className="w-6 h-6" style={{ color: 'var(--color-coral)' }} />
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)' }}>
                    NOTHING HERE YET.
                  </h4>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                    Your next innovation could start this page.
                  </p>
                </div>
                <button onClick={() => onNavigate('create')} className="btn-primary mx-auto">
                  CREATE YOUR FIRST IDEA →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myProjects.slice(0, 2).map(p => (
                  <div
                    key={p.id}
                    onClick={() => onNavigate('project-detail', p.id)}
                    className="p-5 rounded-[12px] cursor-pointer space-y-3 transition-all group"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-coral)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px -6px rgba(32,32,42,0.1)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <TypeBadge type={p.project_type} />
                      <StatusBadge status={p.status} />
                    </div>
                    <div>
                      <h4
                        className="transition-colors"
                        style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)' }}
                      >
                        {p.title}
                      </h4>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-muted)' }}>
                        {p.problem_title}
                      </p>
                    </div>
                    <div
                      className="pt-2 flex items-center justify-between font-mono"
                      style={{ borderTop: '1px solid var(--color-border-sub)', fontSize: '10px', color: 'var(--color-light)' }}
                    >
                      <ProjectVoteButtons projectId={p.id} size="sm" />
                      <span style={{ color: 'var(--color-lavender)', fontWeight: 600 }}>v{p.current_version}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-label section-label-muted mb-1">
                  <span>04 / RECOMMENDED FOR YOU</span>
                </div>
                <h3
                  style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)' }}
                >
                  Aligned with your interests
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  In {userInterests.slice(0, 2).join(' and ')}.
                </p>
              </div>
              <button onClick={() => onNavigate('explore')} className="btn-text">
                Browse All →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedProjects.map(p => {
                const matchScore = calculateMatchScore(p);
                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-[12px] flex flex-col justify-between space-y-4 transition-all"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-lavender)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px -6px rgba(32,32,42,0.1)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <CategoryBadge category={p.category} />
                        <span
                          className="font-mono font-bold px-2 py-0.5 rounded-[6px]"
                          style={{
                            fontSize: '10px',
                            background: 'rgba(157,150,213,0.1)',
                            color: 'var(--color-lavender)',
                            border: '1px solid rgba(157,150,213,0.22)',
                          }}
                        >
                          {matchScore}% MATCH
                        </span>
                      </div>
                      <div
                        onClick={() => onNavigate('project-detail', p.id)}
                        className="cursor-pointer"
                      >
                        <h4
                          style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)' }}
                        >
                          {p.title}
                        </h4>
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-muted)' }}>
                          {p.problem_description}
                        </p>
                      </div>
                    </div>
                    <div
                      className="pt-3 flex items-center justify-between"
                      style={{ borderTop: '1px solid var(--color-border-sub)' }}
                    >
                      <ProjectVoteButtons projectId={p.id} size="sm" />
                      <button
                        onClick={() => onOpenReview(p)}
                        className="font-mono font-bold text-white transition-all"
                        style={{
                          fontSize: '10px',
                          padding: '4px 12px',
                          borderRadius: '8px',
                          background: 'var(--color-lavender)',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                      >
                        REVIEW →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT: Sidebar panels */}
        <div className="lg:col-span-4 space-y-6">

          {/* Waiting for perspectives */}
          <div
            className="p-5 rounded-[12px] space-y-4"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--color-border-sub)' }}>
              <span className="font-mono uppercase tracking-wider font-semibold" style={{ fontSize: '10px', color: 'var(--color-ink)' }}>
                WAITING FOR PERSPECTIVES
              </span>
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'var(--color-peach)' }}
              />
            </div>

            {needingAttention.length === 0 ? (
              <div className="py-4 text-center" style={{ fontSize: '12px', color: 'var(--color-light)' }}>
                No projects awaiting review
              </div>
            ) : (
              <div className="space-y-2.5">
                {needingAttention.map(p => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-[10px] space-y-2 transition-colors"
                    style={{
                      background: 'var(--color-bg-subtle)',
                      border: '1px solid var(--color-border-sub)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-semibold truncate max-w-[140px]"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
                      >
                        {p.title}
                      </span>
                      <CategoryBadge category={p.category} />
                    </div>
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--color-muted)' }}>
                      {p.problem_title}
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="font-mono" style={{ fontSize: '9px', color: 'var(--color-light)' }}>
                        ~45s estimated
                      </span>
                      <button
                        onClick={() => onOpenReview(p)}
                        className="font-mono font-bold transition-colors"
                        style={{ fontSize: '10px', color: 'var(--color-lavender)' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}
                      >
                        Give Feedback →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ecosystem Activity Feed */}
          <div
            className="p-5 rounded-[12px] space-y-4"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="pb-3" style={{ borderBottom: '1px solid var(--color-border-sub)' }}>
              <span className="font-mono uppercase tracking-wider font-semibold" style={{ fontSize: '10px', color: 'var(--color-ink)' }}>
                ECOSYSTEM ACTIVITY FEED
              </span>
            </div>

            <div className="space-y-3.5">
              {[
                { color: 'var(--color-coral)',   text: <><strong>Elena Rostova</strong> published <strong>Version 2</strong> of StudyFlow.</>,   time: '2h ago' },
                { color: 'var(--color-lavender)',text: <><strong>Marcus Chen</strong> received 4 new perspectives on FoodSave.</>,             time: '4h ago' },
                { color: 'var(--color-mint)',    text: <><strong>IdeaPulse</strong> reached 95% project readiness validation score.</>,         time: 'Yesterday' },
                { color: 'var(--color-peach)',   text: <>New innovation <strong>CreatorProof</strong> submitted in Design.</>,                  time: '2 days ago' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ background: item.color }}
                  />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-ink)', lineHeight: 1.6 }}>{item.text}</p>
                    <span className="font-mono" style={{ fontSize: '9px', color: 'var(--color-light)' }}>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
