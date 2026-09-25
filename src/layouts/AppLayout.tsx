import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { ReviewModal } from '../components/reviews/ReviewModal';
import { PointsRewardToast } from '../components/common/PointsRewardToast';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { PageTransition } from '../components/common/MotionWrapper';
import { useReviewModal } from '../context/ReviewModalContext';
import { useAuth } from '../context/AuthContext';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { reviewingProject, closeReviewModal } = useReviewModal();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  const currentPath = location.pathname.replace('/', '') || 'home';
  const currentView = currentPath.startsWith('projects/') ? 'project-detail' : currentPath;

  const handleNavigate = (view: string, id?: string) => {
    if (view === 'home')           navigate('/home');
    else if (view === 'explore')   navigate('/explore');
    else if (view === 'create')    navigate('/create');
    else if (view === 'my-projects') navigate('/my-projects');
    else if (view === 'reviews')   navigate('/reviews');
    else if (view === 'insights' || view === 'search' || view === 'ai-search' || view === 'ai-research')  navigate('/insights');
    else if (view === 'ai-project-analyzer' || view === 'analyzer') navigate('/ai-project-analyzer');
    else if (view === 'compare')   navigate('/explore');
    else if (view === 'roadmap')   navigate('/roadmap');
    else if (view === 'community') navigate('/community');
    else if (view === 'profile')   navigate('/profile');
    else if (view === 'settings')  navigate('/settings');
    else if (view === 'project-detail' && id) navigate(`/projects/${id}`);
    else if (view === 'project-edit'   && id) navigate(`/projects/${id}/edit`);
    else if (view === 'versions'       && id) navigate(`/projects/${id}/versions`);
    else if (view === 'roadmap'        && id) navigate(`/projects/${id}/roadmap`);
    else if (view === 'analyze'        && id) navigate(`/projects/${id}/analyze`);
    else navigate(`/${view}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Loading state */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="text-center space-y-3">
          <div
            className="font-display font-normal animate-pulse"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              color: 'var(--color-ink)',
              letterSpacing: '-0.02em',
            }}
          >
            INNOVEXA
          </div>
          <div
            className="font-mono uppercase tracking-widest"
            style={{ fontSize: '9px', color: 'var(--color-light)', letterSpacing: '0.22em' }}
          >
            INITIALIZING WORKSPACE...
          </div>
          {/* Loading bar */}
          <div
            className="w-32 h-0.5 mx-auto rounded-full overflow-hidden"
            style={{ background: 'var(--color-border)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: '60%',
                background: 'var(--color-coral)',
                animation: 'skeleton-wave 1.6s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-ink)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main workspace — offset by sidebar width on desktop */}
      <div className="lg:pl-[260px] flex flex-col flex-1 min-h-screen">

        {/* Sticky header */}
        <Header
          onNavigate={handleNavigate}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Page content */}
        <main
          className="flex-1 px-4 sm:px-6 lg:px-10 py-7 max-w-[1400px] w-full mx-auto"
        >
          <ErrorBoundary>
            <PageTransition key={location.pathname}>
              <Outlet context={{ onNavigate: handleNavigate }} />
            </PageTransition>
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Review Modal */}
      {reviewingProject && (
        <ReviewModal
          project={reviewingProject}
          isOpen={Boolean(reviewingProject)}
          onClose={closeReviewModal}
          onSuccess={() => { closeReviewModal(); }}
        />
      )}

      {/* Global Animated Points & Reputation Reward Toast */}
      <PointsRewardToast />
    </div>
  );
};

export default AppLayout;
