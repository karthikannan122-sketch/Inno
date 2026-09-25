import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Award, 
  FolderKanban, 
  CheckSquare, 
  Sparkles, 
  Edit3, 
  Check, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';
import { Badge, CategoryBadge, TypeBadge } from '../components/common/Badge';

interface ProfilePageProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate: propOnNavigate }) => {
  const routerNavigate = useNavigate();
  const onNavigate = propOnNavigate || ((view: string, id?: string) => {
    if (id) routerNavigate(`/projects/${id}`);
    else routerNavigate(`/${view}`);
  });
  const { user, updateProfile } = useAuth();
  const { projects, reviews } = useProjects();

  const userId = user?.id || 'current';
  const userProjects = projects.filter(p => p.owner_id === userId);
  const userReviews = reviews.filter(r => r.reviewer_id === userId);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || 'Innovator');
  const [bio, setBio] = useState(user?.bio || 'Building and exploring the next generation of impactful innovations.');
  const [location, setLocation] = useState(user?.location || 'San Francisco, CA');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    await updateProfile({
      full_name: fullName,
      bio,
      location
    });
    setSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Profile Banner & Identity Header */}
      <SlideUp delay={0.05}>
        <div className="bg-white rounded-3xl border border-innovexa-border overflow-hidden shadow-card">
          
          {/* Pattern Banner */}
          <div className="h-36 bg-gradient-to-r from-innovexa-coral/20 via-innovexa-purple/20 to-innovexa-blue/20 relative" />

          {/* Profile Card Header */}
          <div className="p-8 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              <img
                src={user?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=e96b7a'}
                alt={user?.full_name || 'User'}
                className="w-28 h-28 rounded-full border-4 border-white shadow-card object-cover bg-white shrink-0"
              />
              <div className="text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-serif text-3xl font-bold text-innovexa-ink">
                    {user?.full_name || 'Innovator'}
                  </h1>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {user?.reputation_score || 100} REP
                  </span>
                </div>
                <div className="text-xs font-mono text-innovexa-ink-muted flex items-center justify-center sm:justify-start gap-2">
                  <span>@{user?.username || 'innovator'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-innovexa-ink-light" />
                    {user?.location || 'Global'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-xs font-mono text-innovexa-ink-muted px-4 py-2 hover:bg-innovexa-bg-subtle rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-innovexa-ink hover:bg-black text-white px-5 py-2 rounded-full text-xs font-mono font-semibold"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white hover:bg-innovexa-bg-subtle border border-innovexa-border text-innovexa-ink px-5 py-2 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-2 shadow-subtle"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Edit Form or Bio Section */}
          <div className="p-8 pt-0 border-t border-innovexa-border-subtle mt-4">
            {isEditing ? (
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-innovexa-ink-muted uppercase">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-2.5 bg-innovexa-bg-subtle/50 border border-innovexa-border rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-innovexa-ink-muted uppercase">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-2.5 bg-innovexa-bg-subtle/50 border border-innovexa-border rounded-xl text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-innovexa-ink-muted uppercase">Bio / Elevator Pitch</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-2.5 bg-innovexa-bg-subtle/50 border border-innovexa-border rounded-xl text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="pt-4 space-y-4">
                <p className="text-xs sm:text-sm text-innovexa-ink leading-relaxed max-w-3xl">
                  {user?.bio || 'Building and exploring the next generation of impactful innovations on INNOVEXA.'}
                </p>

                {/* Interests & Roles Pills */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-innovexa-ink-muted uppercase">Interests:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(user?.interests || ['Technology', 'AI', 'Sustainability']).map(i => (
                        <CategoryBadge key={i} category={i} />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-innovexa-ink-muted uppercase">Roles:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(user?.roles || ['Creator', 'Reviewer']).map(r => (
                        <Badge key={r} variant="purple">{r}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </SlideUp>

      {/* Profile Tabs & Work Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: User Projects */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-innovexa-ink">
              Innovations ({userProjects.length})
            </h3>
            <button
              onClick={() => onNavigate('create')}
              className="text-xs font-mono font-bold text-innovexa-coral hover:underline"
            >
              + Create Innovation
            </button>
          </div>

          {userProjects.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-innovexa-border p-8 text-center text-xs text-innovexa-ink-muted">
              No projects created yet.
            </div>
          ) : (
            <div className="space-y-4">
              {userProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => onNavigate('project-detail', p.id)}
                  className="bg-white rounded-3xl border border-innovexa-border p-5 shadow-subtle hover:shadow-card cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TypeBadge type={p.project_type} />
                      <CategoryBadge category={p.category} />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-600">
                      {p.readiness_score || 50}% READINESS
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif text-xl font-bold text-innovexa-ink group-hover:text-innovexa-coral transition-colors">
                      {p.title}
                    </h4>
                    <p className="text-xs text-innovexa-ink-muted line-clamp-2 mt-1">
                      {p.problem_description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-innovexa-border-subtle flex items-center justify-between text-[11px] font-mono text-innovexa-ink-muted">
                    <span>v{p.current_version} • {p.reviews_count || 0} reviews</span>
                    <span className="text-innovexa-purple font-semibold">View Detail →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Reputation & Activity Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-innovexa-border p-6 shadow-subtle space-y-4">
            <span className="text-[10px] font-mono font-bold text-innovexa-ink-muted uppercase tracking-wider block">
              REPUTATION & IMPACT
            </span>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 bg-innovexa-bg-subtle/50 rounded-xl font-mono">
                <span className="text-innovexa-ink-muted">Reputation Rating:</span>
                <span className="font-bold text-emerald-600">{user?.reputation_score || 100} pts</span>
              </div>
              <div className="flex justify-between p-3 bg-innovexa-bg-subtle/50 rounded-xl font-mono">
                <span className="text-innovexa-ink-muted">Perspectives Submitted:</span>
                <span className="font-bold text-innovexa-purple">{userReviews.length}</span>
              </div>
              <div className="flex justify-between p-3 bg-innovexa-bg-subtle/50 rounded-xl font-mono">
                <span className="text-innovexa-ink-muted">Validation Trust Tier:</span>
                <span className="font-bold text-innovexa-teal">Verified Reviewer</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
