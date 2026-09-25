import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, PlusCircle, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { Badge } from './Badge';

interface HeaderProps {
  onNavigate: (view: string, id?: string) => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onToggleSidebar }) => {
  const routerNavigate = useNavigate();
  const { user } = useAuth();
  const { notifications, markNotificationRead, projects } = useProjects();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const searchResults = searchQuery.trim() === '' ? [] : projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.problem_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 5);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const el = document.getElementById('header-search');
        if (el) { el.focus(); setShowSearchResults(true); }
      }
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-5 lg:px-8 py-3 transition-colors"
      style={{
        background: 'rgba(247,244,238,0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* ── Left: Mobile Menu + Search ── */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-[10px] transition-colors"
          style={{ color: 'var(--color-ink)' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-bg-subtle)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1">
          <div className="relative">
            <Search
              className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-light)' }}
            />
            <input
              id="header-search"
              type="text"
              placeholder="Search innovations..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
              onFocus={() => setShowSearchResults(true)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  e.preventDefault();
                  setShowSearchResults(false);
                  routerNavigate(`/insights?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="w-full pl-9 pr-16 py-2 text-xs transition-all outline-none"
              style={{
                background: 'rgba(234,228,217,0.7)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-body)',
              }}
              onFocusCapture={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-coral)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(230,111,130,0.08)';
              }}
              onBlurCapture={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(234,228,217,0.7)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            />
            {/* Kbd hint */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <span
                className="font-mono px-1.5 py-0.5 rounded border"
                style={{
                  fontSize: '9px',
                  color: 'var(--color-light)',
                  background: 'var(--color-bg-subtle)',
                  borderColor: 'var(--color-border)',
                }}
              >
                ⌘K
              </span>
            </div>
          </div>

          {/* Search results dropdown */}
          {showSearchResults && searchQuery.trim() !== '' && (
            <div
              className="absolute left-0 right-0 top-full mt-1.5 p-2 z-50 shadow-float"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
              }}
            >
              <div
                className="font-mono uppercase px-2 py-1.5 mb-1"
                style={{ fontSize: '9px', color: 'var(--color-light)', letterSpacing: '0.14em' }}
              >
                Matching Innovations ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="p-3 text-center" style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  No local projects matching "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-0.5">
                  {searchResults.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { onNavigate('project-detail', p.id); setShowSearchResults(false); setSearchQuery(''); }}
                      className="w-full text-left px-2.5 py-2 rounded-[8px] flex items-center justify-between transition-colors"
                      style={{ color: 'var(--color-ink)' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-bg-subtle)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    >
                      <div>
                        <div className="text-xs font-medium" style={{ color: 'var(--color-ink)' }}>{p.title}</div>
                        <div className="truncate max-w-xs" style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{p.problem_title}</div>
                      </div>
                      <Badge variant="neutral" size="sm">{p.category}</Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* AI Research action in dropdown */}
              <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  onClick={() => {
                    setShowSearchResults(false);
                    const q = searchQuery.trim();
                    setSearchQuery('');
                    routerNavigate(`/insights?q=${encodeURIComponent(q)}`);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-[8px] flex items-center gap-2 transition-all font-mono text-xs font-bold text-[#6875E8] hover:bg-[#6875E8]/10"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E8B653]" />
                  <span>Launch AI Research for "{searchQuery}" →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Notifications + CTA ── */}
      <div className="flex items-center gap-3 ml-4 shrink-0">

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-[10px] transition-all"
            style={{ color: 'var(--color-ink)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-bg-subtle)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 font-bold flex items-center justify-center text-white"
                style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: 'var(--color-coral)',
                  fontSize: '8px',
                  animation: 'pulse-slow 2.5s ease-in-out infinite',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-3 z-50 shadow-float"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
              }}
            >
              <div className="flex items-center justify-between pb-2.5 mb-2" style={{ borderBottom: '1px solid var(--color-border-sub)' }}>
                <span className="font-mono uppercase tracking-wider font-semibold" style={{ fontSize: '10px', color: 'var(--color-ink)' }}>
                  Notifications
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <span className="font-mono font-medium" style={{ fontSize: '10px', color: 'var(--color-coral)' }}>
                      {unreadCount} unread
                    </span>
                  )}
                  <button onClick={() => setShowNotifications(false)} style={{ color: 'var(--color-light)' }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center" style={{ fontSize: '12px', color: 'var(--color-light)' }}>
                  No notifications yet
                </div>
              ) : (
                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link.startsWith('/projects/')) {
                          const id = n.link.split('/projects/')[1]?.split('?')[0];
                          onNavigate('project-detail', id);
                        } else if (n.link === '/explore') {
                          onNavigate('explore');
                        }
                        setShowNotifications(false);
                      }}
                      className={`p-3 rounded-[8px] cursor-pointer flex items-start justify-between gap-2 transition-colors`}
                      style={n.is_read ? {} : {
                        background: 'rgba(230,111,130,0.04)',
                        border: '1px solid rgba(230,111,130,0.14)',
                        borderRadius: '8px',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-bg-subtle)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = n.is_read ? 'transparent' : 'rgba(230,111,130,0.04)')}
                    >
                      <div>
                        <div className="text-xs font-semibold" style={{ color: 'var(--color-ink)' }}>{n.title}</div>
                        <div className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>{n.message}</div>
                      </div>
                      {!n.is_read && (
                        <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ background: 'var(--color-coral)' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* NEW SPECIMEN CTA */}
        <button
          onClick={() => onNavigate('create')}
          className="flex items-center gap-1.5 text-white shrink-0 transition-all active:scale-95"
          style={{
            background: 'var(--color-coral)',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--color-coral-hover)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px -4px rgba(230,111,130,0.45)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--color-coral)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>NEW SPECIMEN</span>
        </button>
      </div>
    </header>
  );
};
