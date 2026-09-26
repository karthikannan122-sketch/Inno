import {
  Home,
  Compass,
  PlusCircle,
  FolderKanban,
  CheckSquare,
  Sparkles,
  Users,
  User,
  Settings,
  LogOut,
  X,
  BrainCircuit,
  GitBranch,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onClose
}) => {
  const { user, signOut } = useAuth();
  const { notifications } = useProjects();

  const unreadNotifs = notifications.filter(n => !n.is_read).length;

  const isAdminUser = Boolean(
    user?.roles?.includes('admin') || 
    user?.username?.includes('admin') || 
    user?.id?.startsWith('demo-admin')
  );

  const navItems = [
    { id: 'home',                label: 'HOME',        icon: Home },
    { id: 'explore',             label: 'EXPLORE',     icon: Compass },
    { id: 'community',           label: 'COMMUNITY',   icon: Users },
    { id: 'investors',           label: 'INVESTORS',   icon: Briefcase },
    { id: 'create',              label: 'CREATE IDEA', icon: PlusCircle },
    { id: 'insights',            label: 'AI RESEARCH', icon: BrainCircuit },
    { id: 'ai-project-analyzer', label: 'AI ANALYZER', icon: Sparkles },
    { id: 'roadmap',             label: 'ROADMAP',     icon: GitBranch },
    { id: 'my-projects',         label: 'MY PROJECTS', icon: FolderKanban },
    { id: 'reviews',             label: 'REVIEWS',     icon: CheckSquare, badge: unreadNotifs > 0 ? `${unreadNotifs}` : null },
    ...(isAdminUser ? [{ id: 'admin', label: 'ADMIN CONSOLE', icon: ShieldCheck }] : [{ id: 'admin', label: 'ADMIN', icon: ShieldCheck }]),
    { id: 'profile',             label: 'PROFILE',     icon: User },
    { id: 'settings',            label: 'SETTINGS',    icon: Settings },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    onClose();
  };

  const userInitials = (user?.full_name || 'User')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const displayName = user?.full_name || 'innovator';
  const repScore    = user?.reputation_score ?? 100;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          width: '260px',
          background: 'var(--color-sidebar)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* ── Brand Header ── */}
        <div
          className="flex items-center justify-between px-5 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={() => handleNav('home')}
            className="flex flex-col gap-0.5 text-left group"
          >
            <div className="flex items-center gap-2.5">
              <span style={{ color: 'var(--color-coral)', fontSize: '16px', lineHeight: 1 }}>✦</span>
              <span
                className="font-display font-normal tracking-tight text-white group-hover:text-innovexa-coral transition-colors duration-150"
                style={{ fontSize: '24px', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', fontWeight: 400 }}
              >
                INNOVEXA
              </span>
            </div>
            <span
              className="font-mono uppercase"
              style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', paddingLeft: '28px', fontFamily: 'var(--font-mono)' }}
            >
              THE INNOVATION NETWORK
            </span>
          </button>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map(item => {
            const Icon     = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-[10px]
                  font-sans text-[13px] tracking-[0.04em] font-medium
                  transition-all duration-150
                `}
                style={isActive ? {
                  background: 'rgba(230,111,130,0.12)',
                  border: '1px solid rgba(230,111,130,0.28)',
                  color: 'var(--color-coral)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                } : {
                  color: 'rgba(255,255,255,0.65)',
                  border: '1px solid transparent',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.80)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.42)';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className="w-4 h-4 shrink-0"
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className="text-white font-bold text-[9px] rounded-full px-1.5 py-0.5 shrink-0"
                    style={{ background: 'var(--color-coral)', minWidth: '18px', textAlign: 'center' }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── User Footer ── */}
        <div
          className="px-3 pb-4 pt-3 space-y-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'var(--color-sidebar-sec)' }}
        >
          {/* User card */}
          <button
            onClick={() => handleNav('profile')}
            className="w-full flex items-center gap-3 p-3 rounded-[10px] transition-all duration-150 text-left"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
            }}
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-mono font-bold text-white text-xs"
              style={{ background: 'var(--color-coral)' }}
            >
              {userInitials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-white text-xs font-medium truncate" style={{ fontFamily: 'var(--font-body)' }}>
                {displayName}
              </div>
              <div className="font-mono flex items-center gap-1.5 mt-0.5" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>
                <span style={{ color: 'var(--color-coral)', fontWeight: 700 }}>{repScore} pts</span>
                <span>•</span>
                <span className="uppercase tracking-wider">TRUSTED REVIEWER</span>
              </div>
            </div>
          </button>

          {/* Sub actions */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => handleNav('insights')}
              className="flex items-center gap-1.5 font-mono uppercase transition-colors duration-150"
              style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.70)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)')}
            >
              <Sparkles className="w-3 h-3" style={{ color: 'var(--color-coral)' }} />
              <span>AI ENGINE</span>
            </button>

            <button
              onClick={async () => {
                await signOut();
                onClose();
                window.location.href = '/login';
              }}
              className="flex items-center gap-1.5 font-mono uppercase transition-colors duration-150"
              style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--color-coral)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)')}
            >
              <LogOut className="w-3 h-3" />
              <span>EXIT</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
