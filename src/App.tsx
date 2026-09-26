import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { ReviewModalProvider } from './context/ReviewModalContext';
import { AppLayout } from './layouts/AppLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPages } from './pages/AuthPages';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { MyProjectsPage } from './pages/MyProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { InsightsPage } from './pages/InsightsPage';
import { VersionsPage } from './pages/VersionsPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { AIProjectAnalyzerPage } from './pages/AIProjectAnalyzerPage';
import { LaunchPage } from './pages/LaunchPage';
import { CommunityPage } from './pages/CommunityPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { SmartReviewPage } from './pages/SmartReviewPage';
import { ValidationInsightsPage } from './pages/ValidationInsightsPage';
import { InvestorPage } from './pages/InvestorPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route Guard (with fallback support for offline/demo experience)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="font-serif text-3xl font-bold text-[#181924] animate-pulse">
            INNOVEXA
          </div>
          <div className="text-xs font-mono text-[#8E90A2]">
            AUTHENTICATING USER...
          </div>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProjectProvider>
          <ReviewModalProvider>
            <BrowserRouter>
              <Routes>
                {/* Public & Landing Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPages initialMode="login" />} />
                <Route path="/signup" element={<AuthPages initialMode="signup" />} />
                <Route path="/onboarding" element={<OnboardingPage />} />

                {/* Central Authenticated Application Layout */}
                <Route element={<AppLayout />}>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/create" element={<CreateProjectPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route path="/projects/:id/review" element={<SmartReviewPage />} />
                  <Route path="/projects/:id/validation" element={<ValidationInsightsPage />} />
                  <Route path="/projects/:id/insights/validation" element={<ValidationInsightsPage />} />
                  <Route path="/projects/:id/edit" element={<CreateProjectPage />} />
                  <Route path="/projects/:id/versions" element={<VersionsPage />} />
                  <Route path="/projects/:id/roadmap" element={<RoadmapPage />} />
                  <Route path="/roadmap" element={<RoadmapPage />} />
                  <Route path="/projects/:id/launch" element={<LaunchPage />} />
                  <Route path="/my-projects" element={<MyProjectsPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/insights" element={<InsightsPage />} />
                  <Route path="/search" element={<InsightsPage />} />
                  <Route path="/ai-search" element={<InsightsPage />} />
                  <Route path="/ai-research" element={<InsightsPage />} />
                  <Route path="/ai-project-analyzer" element={<AIProjectAnalyzerPage />} />
                  <Route path="/projects/:id/analyze" element={<AIProjectAnalyzerPage />} />
                  <Route path="/compare" element={<ExplorePage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/investors" element={<InvestorPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  
                  {/* 404 Catch-All within Layout */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ReviewModalProvider>
        </ProjectProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
