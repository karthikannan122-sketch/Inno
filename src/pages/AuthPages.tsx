import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, Mail, User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';

interface AuthPagesProps {
  initialMode?: 'login' | 'signup' | 'forgot';
  onSuccess?: (isNewUser: boolean) => void;
  onNavigateHome?: () => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'signup',
  onSuccess: propOnSuccess,
  onNavigateHome: propOnNavigateHome
}) => {
  const routerNavigate = useNavigate();
  const onSuccess = propOnSuccess || ((isNewUser: boolean) => {
    if (isNewUser) routerNavigate('/onboarding');
    else routerNavigate('/home');
  });
  const onNavigateHome = propOnNavigateHome || (() => routerNavigate('/'));
  const { signUp, signIn, signInAsDemo, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [fullName, setFullName]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [resetSent, setResetSent]     = useState(false);

  const handleDemoSignIn = async (persona?: 'alex' | 'priya' | 'marcus') => {
    setError(null);
    setLoading(true);
    await signInAsDemo(persona);
    setLoading(false);
    onSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (!fullName.trim())              { setError('Please enter your full name.');              return; }
      if (!email.trim() || !password.trim()) { setError('Please provide a valid email and password.'); return; }
      if (password.length < 6)          { setError('Password must be at least 6 characters.');   return; }

      setLoading(true);
      const res = await signUp(email, password, fullName);
      setLoading(false);
      if (res.error) setError(res.error);
      else onSuccess(true);

    } else if (mode === 'login') {
      if (!email.trim() || !password.trim()) { setError('Please enter your email and password.'); return; }

      setLoading(true);
      const res = await signIn(email, password);
      setLoading(false);
      if (res.error) setError(res.error);
      else onSuccess(false);

    } else if (mode === 'forgot') {
      if (!email.trim()) { setError('Please enter your registered email address.'); return; }

      setLoading(true);
      const res = await resetPassword(email);
      setLoading(false);
      if (res.error) setError(res.error);
      else setResetSent(true);
    }
  };

  const inputBase: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    padding: '0.65rem 0.875rem 0.65rem 2.5rem',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    color: 'var(--color-ink)',
    outline: 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
  };

  return (
    <div
      className="min-h-screen flex antialiased"
      style={{ background: 'var(--color-bg)', fontFamily: 'var(--font-body)' }}
    >
      {/* ── Left editorial panel (desktop) ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[46%] min-h-screen p-12 relative overflow-hidden"
        style={{ background: 'var(--color-sidebar)' }}
      >
        {/* Subtle grain */}
        <div className="absolute inset-0 grain-bg opacity-60 pointer-events-none" />

        {/* Brand */}
        <button onClick={onNavigateHome} className="flex flex-col gap-1 text-left relative z-10">
          <div className="flex items-center gap-2.5">
            <span style={{ color: 'var(--color-coral)', fontSize: '18px' }}>✦</span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                color: 'white',
                letterSpacing: '-0.01em',
              }}
            >
              INNOVEXA
            </span>
          </div>
          <span
            className="font-mono uppercase tracking-widest"
            style={{ fontSize: '8px', color: 'rgba(255,255,255,0.28)', paddingLeft: '32px', letterSpacing: '0.2em' }}
          >
            THE INNOVATION NETWORK
          </span>
        </button>

        {/* Hero text */}
        <div className="space-y-6 relative z-10">
          <div
            className="font-mono uppercase tracking-widest"
            style={{ fontSize: '10px', color: 'var(--color-coral)', letterSpacing: '0.18em' }}
          >
            01 / JOIN THE ECOSYSTEM
          </div>

          <div className="space-y-2">
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '52px',
                color: 'white',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
              }}
            >
              {mode === 'login'  && <>WELCOME<br/>BACK.</>}
              {mode === 'signup' && <>BUILD.<br/>VALIDATE.<br/>IMPACT.</>}
              {mode === 'forgot' && <>ACCOUNT<br/>RECOVERY.</>}
            </h1>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: '26px',
                color: 'var(--color-coral)',
                lineHeight: 1.3,
              }}
            >
              {mode === 'login'  && 'Your workspace awaits.'}
              {mode === 'signup' && 'turn ideas into impact.'}
              {mode === 'forgot' && 'stay curious.'}
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '340px' }}>
            A premium innovation ecosystem where raw sparks become tested products, sharp minds critique assumptions, and breakthroughs find momentum.
          </p>

          {/* 3 feature pills */}
          <div className="space-y-2 pt-2">
            {[
              'Matched peer reviews & validation',
              'AI-powered research synthesis',
              'Community consensus signals',
            ].map(feat => (
              <div key={feat} className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(230,111,130,0.15)', border: '1px solid rgba(230,111,130,0.3)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-coral)' }} />
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.50)', fontFamily: 'var(--font-body)' }}>
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom signature */}
        <div
          className="font-mono uppercase tracking-widest relative z-10"
          style={{ fontSize: '9px', color: 'rgba(255,255,255,0.18)' }}
        >
          INNOVEXA • SECURE SUPABASE AUTHENTICATION
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile brand */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <button onClick={onNavigateHome} className="flex items-center gap-2">
            <span style={{ color: 'var(--color-coral)', fontSize: '14px' }}>✦</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)' }}>INNOVEXA</span>
          </button>
          <button
            onClick={onNavigateHome}
            className="font-mono text-xs"
            style={{ color: 'var(--color-muted)' }}
          >
            ← Home
          </button>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <SlideUp delay={0.1}>
              <div
                className="p-8 space-y-6 shadow-float"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                }}
              >
                {/* Header */}
                <div className="space-y-1.5">
                  <div
                    className="font-mono uppercase tracking-widest"
                    style={{ fontSize: '10px', color: 'var(--color-coral)', letterSpacing: '0.18em' }}
                  >
                    {mode === 'signup' ? 'JOIN THE COMMUNITY'
                      : mode === 'login' ? 'WELCOME BACK'
                      : 'ACCOUNT RECOVERY'}
                  </div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '28px',
                      color: 'var(--color-ink)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.15,
                    }}
                  >
                    {mode === 'signup' && 'Create your account.'}
                    {mode === 'login'  && 'Sign in to INNOVEXA.'}
                    {mode === 'forgot' && 'Reset your password.'}
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                    {mode === 'signup' && 'Connect with domain peers and validate your innovations.'}
                    {mode === 'login'  && 'Enter your credentials to access your personal workspace.'}
                    {mode === 'forgot' && "We'll send a password recovery link to your inbox."}
                  </p>
                </div>

                {/* Error */}
                {/* Error */}
                {error && (
                  <div
                    className="p-3.5 text-xs rounded-[10px] space-y-2"
                    style={{ background: 'rgba(230,111,130,0.08)', border: '1px solid rgba(230,111,130,0.25)', color: '#B84F62' }}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>{error}</span>
                    </div>

                    {mode === 'login' && (
                      <div className="pt-2 border-t border-red-200/50 flex flex-col gap-1.5">
                        <div className="text-[11px] text-[#7A3644]">
                          Testing without Supabase verified credentials?
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDemoSignIn('alex')}
                          className="w-full py-1.5 px-2.5 rounded-lg text-white font-mono font-bold text-[10px] uppercase tracking-wider transition-all"
                          style={{ background: 'var(--color-coral)' }}
                        >
                          ⚡ Sign In with Demo Profile (Alex Rivera) →
                        </button>
                      </div>
                    )}

                    {error.toLowerCase().includes('rate limit') && (
                      <div className="text-[11px] text-[#7A3644] leading-relaxed pt-1 border-t border-red-200/50">
                        💡 <strong>Quick Fix:</strong> In your <a href="https://supabase.com/dashboard/project/stfpitwhsemzpnevvheq/auth/providers" target="_blank" rel="noreferrer" className="underline font-bold">Supabase Auth Settings</a>, turn <strong>"Confirm email"</strong> to <strong>OFF</strong> to remove email limits completely.
                      </div>
                    )}
                  </div>
                )}

                {/* Reset sent */}
                {resetSent ? (
                  <div
                    className="p-6 text-center space-y-3 rounded-[12px]"
                    style={{ background: 'rgba(121,197,181,0.08)', border: '1px solid rgba(121,197,181,0.25)' }}
                  >
                    <CheckCircle2 className="w-8 h-8 mx-auto" style={{ color: 'var(--color-mint)' }} />
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)' }}>
                      Recovery Email Sent
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                      Please check your inbox for instructions to reset your password.
                    </p>
                    <button
                      onClick={() => { setResetSent(false); setMode('login'); }}
                      className="font-mono font-bold text-xs underline"
                      style={{ color: 'var(--color-coral)' }}
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full name */}
                    {mode === 'signup' && (
                      <div className="space-y-1.5">
                        <label className="form-label">Full Name</label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-light)' }} />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Karthick S."
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            style={inputBase}
                            onFocus={e => { (e.target as HTMLElement).style.borderColor = 'var(--color-coral)'; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(230,111,130,0.1)'; }}
                            onBlur={e => { (e.target as HTMLElement).style.borderColor = 'var(--color-border)'; (e.target as HTMLElement).style.boxShadow = 'none'; }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="form-label">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-light)' }} />
                        <input
                          type="email"
                          required
                          placeholder="name@organization.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          style={inputBase}
                          onFocus={e => { (e.target as HTMLElement).style.borderColor = 'var(--color-coral)'; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(230,111,130,0.1)'; }}
                          onBlur={e => { (e.target as HTMLElement).style.borderColor = 'var(--color-border)'; (e.target as HTMLElement).style.boxShadow = 'none'; }}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    {mode !== 'forgot' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="form-label">Password</label>
                          {mode === 'login' && (
                            <button
                              type="button"
                              onClick={() => { setMode('forgot'); setError(null); }}
                              className="font-mono text-xs"
                              style={{ color: 'var(--color-coral)', fontSize: '10px' }}
                            >
                              Forgot?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-light)' }} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ ...inputBase, paddingRight: '2.5rem' }}
                            onFocus={e => { (e.target as HTMLElement).style.borderColor = 'var(--color-coral)'; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(230,111,130,0.1)'; }}
                            onBlur={e => { (e.target as HTMLElement).style.borderColor = 'var(--color-border)'; (e.target as HTMLElement).style.boxShadow = 'none'; }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: 'var(--color-light)' }}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 text-white font-mono font-bold uppercase tracking-wider transition-all active:scale-98 disabled:opacity-50"
                      style={{
                        background: loading ? 'var(--color-muted)' : 'var(--color-coral)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '10px',
                        fontSize: '11px',
                        letterSpacing: '0.12em',
                        marginTop: '0.5rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: loading ? 'none' : '0 2px 12px -4px rgba(230,111,130,0.4)',
                      }}
                    >
                      {loading
                        ? 'PROCESSING...'
                        : mode === 'signup' ? 'CREATE PROFILE →'
                        : mode === 'login'  ? 'SIGN IN →'
                        : 'SEND RESET LINK'}
                    </button>

                    {/* Quick 1-click Demo Personas (Login view) */}
                    {mode === 'login' && (
                      <div className="pt-3 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-[1px] flex-1 bg-border/60" />
                          <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                            OR QUICK 1-CLICK ACCESS
                          </span>
                          <div className="h-[1px] flex-1 bg-border/60" />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleDemoSignIn('alex')}
                            disabled={loading}
                            className="p-2 text-left rounded-lg border border-border bg-surface hover:border-coral transition-all text-xs group"
                          >
                            <div className="font-semibold text-ink text-[11px] group-hover:text-coral truncate">Alex R.</div>
                            <div className="text-[9px] text-muted font-mono truncate">AI Builder</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDemoSignIn('priya')}
                            disabled={loading}
                            className="p-2 text-left rounded-lg border border-border bg-surface hover:border-coral transition-all text-xs group"
                          >
                            <div className="font-semibold text-ink text-[11px] group-hover:text-coral truncate">Dr. Priya</div>
                            <div className="text-[9px] text-muted font-mono truncate">HealthTech</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDemoSignIn('marcus')}
                            disabled={loading}
                            className="p-2 text-left rounded-lg border border-border bg-surface hover:border-coral transition-all text-xs group"
                          >
                            <div className="font-semibold text-ink text-[11px] group-hover:text-coral truncate">Marcus V.</div>
                            <div className="text-[9px] text-muted font-mono truncate">FinTech</div>
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {/* Toggle modes */}
                <div
                  className="pt-3 text-center text-xs"
                  style={{ borderTop: '1px solid var(--color-border-sub)', color: 'var(--color-muted)', paddingTop: '1rem' }}
                >
                  {mode === 'signup' ? (
                    <span>
                      Already have an account?{' '}
                      <button
                        onClick={() => { setMode('login'); setError(null); }}
                        className="font-bold"
                        style={{ color: 'var(--color-coral)' }}
                      >
                        Sign In
                      </button>
                    </span>
                  ) : (
                    <span>
                      Don't have an account yet?{' '}
                      <button
                        onClick={() => { setMode('signup'); setError(null); }}
                        className="font-bold"
                        style={{ color: 'var(--color-coral)' }}
                      >
                        Create Account
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </SlideUp>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="px-6 py-4 font-mono text-center"
          style={{ fontSize: '10px', color: 'var(--color-light)', letterSpacing: '0.1em', borderTop: '1px solid var(--color-border)' }}
        >
          INNOVEXA • SECURE SUPABASE AUTHENTICATION
        </div>
      </div>
    </div>
  );
};
