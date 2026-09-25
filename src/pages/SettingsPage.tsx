import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Layers, 
  AlertOctagon, 
  Check, 
  Save, 
  Database,
  Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, STORAGE_KEYS } from '../lib/supabase';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';
import { Badge } from '../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'privacy' | 'appearance' | 'integrations' | 'danger'>('account');

  // Account State
  const [fullName, setFullName] = useState(user?.full_name || 'Innovator');
  const [username, setUsername] = useState(user?.username || 'innovator');
  const [bio, setBio] = useState(user?.bio || 'Building and exploring impactful innovations on INNOVEXA.');
  const [location, setLocation] = useState(user?.location || 'San Francisco, CA');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Settings Toggles
  const [emailDigest, setEmailDigest] = useState(true);
  const [perspectiveAlerts, setPerspectiveAlerts] = useState(true);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showReputation, setShowReputation] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      full_name: fullName,
      username,
      bio,
      location,
      avatar_url: avatarUrl || undefined
    });
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to reset your local data cache?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'account', label: 'ACCOUNT', icon: User },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell },
    { id: 'privacy', label: 'PRIVACY', icon: Shield },
    { id: 'appearance', label: 'APPEARANCE', icon: Palette },
    { id: 'integrations', label: 'INTEGRATIONS', icon: Layers },
    { id: 'danger', label: 'DANGER ZONE', icon: AlertOctagon },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <SlideUp delay={0.05}>
        <div className="space-y-2">
          <div className="text-[11px] font-mono tracking-widest text-innovexa-ink-muted uppercase font-bold flex items-center gap-2">
            <span>PREFERENCES & CONFIGURATION</span>
            <span className="w-1.5 h-1.5 rounded-full bg-innovexa-ink"></span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-innovexa-ink">
            Settings
          </h1>
        </div>
      </SlideUp>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-innovexa-border pb-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 text-xs font-mono transition-all rounded-t-xl flex items-center gap-2 ${
                activeTab === t.id
                  ? 'border-b-2 border-innovexa-ink text-innovexa-ink font-bold bg-white'
                  : 'text-innovexa-ink-muted hover:text-innovexa-ink'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: ACCOUNT */}
      {activeTab === 'account' && (
        <SlideUp delay={0.1}>
          <div className="bg-white rounded-3xl border border-innovexa-border p-8 shadow-card space-y-6 max-w-2xl">
            <div className="flex items-center justify-between border-b border-innovexa-border-subtle pb-4">
              <h3 className="font-serif text-2xl font-bold text-innovexa-ink">Personal Profile Details</h3>
              {saveSuccess && (
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Changes Saved</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-innovexa-ink-muted uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-coral rounded-xl text-xs text-innovexa-ink outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-innovexa-ink-muted uppercase">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2.5 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-coral rounded-xl text-xs text-innovexa-ink outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-innovexa-ink-muted uppercase">Bio / Headline</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2.5 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-coral rounded-xl text-xs text-innovexa-ink outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-innovexa-ink-muted uppercase">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-coral rounded-xl text-xs text-innovexa-ink outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-innovexa-ink-muted uppercase">Avatar Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full p-2.5 bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-coral rounded-xl text-xs text-innovexa-ink outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-innovexa-ink hover:bg-black text-white px-6 py-2.5 rounded-full text-xs font-mono font-semibold tracking-wider flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'SAVING...' : 'SAVE CHANGES'}</span>
                </button>
              </div>
            </form>
          </div>
        </SlideUp>
      )}

      {/* TAB: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <SlideUp delay={0.1}>
          <div className="bg-white rounded-3xl border border-innovexa-border p-8 shadow-card space-y-6 max-w-2xl">
            <h3 className="font-serif text-2xl font-bold text-innovexa-ink border-b border-innovexa-border-subtle pb-4">
              Notification Preferences
            </h3>

            <div className="space-y-4 text-xs">
              <label className="flex items-center justify-between p-4 rounded-2xl bg-innovexa-bg-subtle/40 border border-innovexa-border-subtle cursor-pointer">
                <div>
                  <div className="font-bold text-innovexa-ink">New Perspective Signals</div>
                  <div className="text-innovexa-ink-muted">Receive alerts when reviewers submit feedback on your projects.</div>
                </div>
                <input
                  type="checkbox"
                  checked={perspectiveAlerts}
                  onChange={(e) => setPerspectiveAlerts(e.target.checked)}
                  className="w-4 h-4 accent-innovexa-coral"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-innovexa-bg-subtle/40 border border-innovexa-border-subtle cursor-pointer">
                <div>
                  <div className="font-bold text-innovexa-ink">Domain Review Matching</div>
                  <div className="text-innovexa-ink-muted">Get notified when a new innovation matches your interest expertise.</div>
                </div>
                <input
                  type="checkbox"
                  checked={matchAlerts}
                  onChange={(e) => setMatchAlerts(e.target.checked)}
                  className="w-4 h-4 accent-innovexa-purple"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-innovexa-bg-subtle/40 border border-innovexa-border-subtle cursor-pointer">
                <div>
                  <div className="font-bold text-innovexa-ink">Weekly Innovation Digest</div>
                  <div className="text-innovexa-ink-muted">A calm weekly email summarizing ecosystem highlights and launch milestones.</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  className="w-4 h-4 accent-innovexa-teal"
                />
              </label>
            </div>
          </div>
        </SlideUp>
      )}

      {/* TAB: PRIVACY */}
      {activeTab === 'privacy' && (
        <SlideUp delay={0.1}>
          <div className="bg-white rounded-3xl border border-innovexa-border p-8 shadow-card space-y-6 max-w-2xl">
            <h3 className="font-serif text-2xl font-bold text-innovexa-ink border-b border-innovexa-border-subtle pb-4">
              Privacy & Profile Visibility
            </h3>

            <div className="space-y-4 text-xs">
              <label className="flex items-center justify-between p-4 rounded-2xl bg-innovexa-bg-subtle/40 border border-innovexa-border-subtle cursor-pointer">
                <div>
                  <div className="font-bold text-innovexa-ink">Public Profile Showcase</div>
                  <div className="text-innovexa-ink-muted">Allow other innovators to view your published projects and badges.</div>
                </div>
                <input
                  type="checkbox"
                  checked={publicProfile}
                  onChange={(e) => setPublicProfile(e.target.checked)}
                  className="w-4 h-4 accent-innovexa-ink"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-innovexa-bg-subtle/40 border border-innovexa-border-subtle cursor-pointer">
                <div>
                  <div className="font-bold text-innovexa-ink">Display Reputation Score</div>
                  <div className="text-innovexa-ink-muted">Show your reviewer reputation and validation trust score publicly.</div>
                </div>
                <input
                  type="checkbox"
                  checked={showReputation}
                  onChange={(e) => setShowReputation(e.target.checked)}
                  className="w-4 h-4 accent-innovexa-emerald"
                />
              </label>
            </div>
          </div>
        </SlideUp>
      )}

      {/* TAB: APPEARANCE */}
      {activeTab === 'appearance' && (
        <SlideUp delay={0.1}>
          <div className="bg-white rounded-3xl border border-innovexa-border p-8 shadow-card space-y-6 max-w-2xl">
            <h3 className="font-serif text-2xl font-bold text-innovexa-ink border-b border-innovexa-border-subtle pb-4">
              Editorial Aesthetic & Theme
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl border-2 border-innovexa-coral bg-innovexa-bg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-innovexa-ink">Cream & Editorial Ink (Default)</div>
                  <div className="text-[11px] text-innovexa-ink-muted mt-0.5">
                    Classic premium editorial design with purposeful color accents.
                  </div>
                </div>
                <Badge variant="coral">ACTIVE</Badge>
              </div>
            </div>
          </div>
        </SlideUp>
      )}

      {/* TAB: INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <SlideUp delay={0.1}>
          <div className="bg-white rounded-3xl border border-innovexa-border p-8 shadow-card space-y-6 max-w-2xl">
            <h3 className="font-serif text-2xl font-bold text-innovexa-ink border-b border-innovexa-border-subtle pb-4">
              Infrastructure & Backend Integrations
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-innovexa-bg-subtle/50 border border-innovexa-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-bold text-innovexa-ink">Supabase PostgreSQL & Auth</div>
                    <div className="text-innovexa-ink-muted">
                      {isSupabaseConfigured 
                        ? 'Live Cloud Supabase instance connected.' 
                        : 'Local resilient fallback storage active (ready for live keys).'}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase ${
                  isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isSupabaseConfigured ? 'LIVE CLOUD' : 'LOCAL READY'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-innovexa-bg-subtle/50 border border-innovexa-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-innovexa-purple" />
                  <div>
                    <div className="font-bold text-innovexa-ink">AI Summary Engine (Optional)</div>
                    <div className="text-innovexa-ink-muted">Rule-based aggregation active by default; AI API optional.</div>
                  </div>
                </div>
                <Badge variant="purple">ACTIVE</Badge>
              </div>
            </div>
          </div>
        </SlideUp>
      )}

      {/* TAB: DANGER ZONE */}
      {activeTab === 'danger' && (
        <SlideUp delay={0.1}>
          <div className="bg-white rounded-3xl border border-red-200 p-8 shadow-card space-y-6 max-w-2xl">
            <div className="border-b border-red-100 pb-4">
              <span className="text-[10px] font-mono font-bold text-red-600 uppercase">HIGH RISK ACTIONS</span>
              <h3 className="font-serif text-2xl font-bold text-red-900">Danger Zone</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50/50 border border-red-200">
                <div>
                  <div className="font-bold text-red-900">Reset Local Seed Data</div>
                  <div className="text-red-700/80">Clears local client cache and resets back to the 20 default seed projects.</div>
                </div>
                <button
                  onClick={handleClearCache}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-xs font-mono font-semibold"
                >
                  Reset Data
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <div>
                  <div className="font-bold text-innovexa-ink">Sign Out of INNOVEXA</div>
                  <div className="text-innovexa-ink-muted">Terminates active session and returns to landing page.</div>
                </div>
                <button
                  onClick={async () => {
                    await signOut();
                    window.location.href = '/login';
                  }}
                  className="bg-innovexa-ink hover:bg-black text-white px-4 py-2 rounded-full text-xs font-mono font-semibold"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </SlideUp>
      )}

    </div>
  );
};
