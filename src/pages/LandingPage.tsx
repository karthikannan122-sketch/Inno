import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  Cpu, 
  Flame, 
  Lock,
  Zap,
  Globe,
  LogIn
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '../components/common/MotionWrapper';
import { Badge, CategoryBadge, TypeBadge } from '../components/common/Badge';
import { Interactive3DEcosystem } from '../components/home/Interactive3DEcosystem';

interface LandingPageProps {
  onStart?: () => void;
  onLogin?: () => void;
  onExplore?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStart: propOnStart, 
  onLogin: propOnLogin, 
  onExplore: propOnExplore 
}) => {
  const routerNavigate = useNavigate();
  const onStart = propOnStart || (() => routerNavigate('/signup'));
  const onLogin = propOnLogin || (() => routerNavigate('/login'));
  const onExplore = propOnExplore || (() => routerNavigate('/explore'));
  const steps = [
    {
      num: '01',
      title: 'OBSERVE',
      subtitle: 'Spot the problem',
      desc: 'Frame real-world friction, user pain points, and systemic market inefficiencies.',
      color: 'border-innovexa-coral/40 bg-innovexa-coral/5 text-innovexa-coral'
    },
    {
      num: '02',
      title: 'CREATE',
      subtitle: 'Shape the solution',
      desc: 'Define your hypothesis, unique value proposition, and intended target audience.',
      color: 'border-innovexa-blue/40 bg-innovexa-blue/5 text-innovexa-blue'
    },
    {
      num: '03',
      title: 'SHARE',
      subtitle: 'Get perspectives',
      desc: 'Route your concept to matched domain peers without generic comment noise.',
      color: 'border-innovexa-purple/40 bg-innovexa-purple/5 text-innovexa-purple'
    },
    {
      num: '04',
      title: 'ANALYZE',
      subtitle: 'Understand feedback',
      desc: 'Synthesize quantified signal indicators, readiness scores, and constructive themes.',
      color: 'border-innovexa-lavender/40 bg-innovexa-lavender/5 text-innovexa-lavender'
    },
    {
      num: '05',
      title: 'IMPROVE',
      subtitle: 'Refine and evolve',
      desc: 'Triage actionable community suggestions and ship clear iterative version milestones.',
      color: 'border-innovexa-amber/40 bg-innovexa-amber/5 text-innovexa-amber'
    },
    {
      num: '06',
      title: 'LAUNCH',
      subtitle: 'Make it real',
      desc: 'Publish validated innovations directly to the global builder ecosystem.',
      color: 'border-innovexa-teal/40 bg-innovexa-teal/5 text-innovexa-teal'
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#181924] font-sans relative overflow-x-hidden selection:bg-[#E96B7A]/20">
      
      {/* Top Editorial Navbar matching screenshot */}
      <header className="sticky top-0 z-40 bg-[#F7F4EE]/95 backdrop-blur-md border-b border-[#E5E0D6] px-6 lg:px-12 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#E96B7A] text-lg font-bold">✦</span>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#181924]">
              INNOVEXA
            </span>
          </div>
          <span className="hidden sm:inline text-[9px] font-mono tracking-widest text-[#8E90A2] font-semibold uppercase">
            THE INNOVATION NETWORK
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-xs font-mono tracking-wider text-[#555768] uppercase font-medium">
          <button onClick={onExplore} className="hover:text-[#181924] transition-colors">DISCOVER</button>
          <button onClick={onStart} className="hover:text-[#181924] transition-colors">CREATE</button>
          <button onClick={onExplore} className="hover:text-[#181924] transition-colors">VALIDATE</button>
          <button onClick={onExplore} className="text-[#E96B7A] font-bold hover:text-[#DE5565] transition-colors">AI RESEARCH</button>
          <button onClick={onExplore} className="hover:text-[#181924] transition-colors">CONNECT</button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onStart}
            className="bg-[#181924] hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1 shadow-sm"
          >
            <span>WORKSPACE DESK</span>
            <span className="text-[11px]">↗</span>
          </button>
          <button
            onClick={onLogin}
            title="Sign In"
            className="p-2 text-[#555768] hover:text-[#181924] transition-colors"
          >
            <LogIn className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3D Modeled Hero Section */}
      <section className="relative px-6 lg:px-12 pt-12 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-6 space-y-6">
            <SlideUp delay={0.1}>
              <div className="section-label">
                <span>01 / POSSIBILITY IN MOTION</span>
              </div>
            </SlideUp>

            <SlideUp delay={0.2}>
              <div className="space-y-1">
                <h1
                  className="font-display uppercase text-[#181924]"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 400,
                    fontSize: 'clamp(3.5rem, 7vw, 7rem)',
                    lineHeight: 0.95,
                    letterSpacing: '-0.03em'
                  }}
                >
                  IDEAS
                </h1>
                <div
                  className="font-display uppercase text-[#555768]"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 400,
                    fontSize: 'clamp(2.5rem, 5vw, 5rem)',
                    lineHeight: 0.95,
                    letterSpacing: '-0.03em'
                  }}
                >
                  WERE NEVER MEANT TO
                </div>
                <div
                  className="editorial-italic"
                  style={{
                    fontFamily: 'var(--font-editorial)',
                    fontStyle: 'italic',
                    fontWeight: 600,
                    color: '#E66F82',
                    fontSize: 'clamp(3.5rem, 7vw, 7rem)',
                    lineHeight: 1.0,
                    letterSpacing: '-0.02em'
                  }}
                >
                  stay still.
                </div>
              </div>
            </SlideUp>

            <SlideUp delay={0.3}>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '16px',
                  lineHeight: 1.6,
                  color: '#62616A',
                  maxWidth: '480px'
                }}
              >
                A premium innovation ecosystem where raw sparks become tested products, sharp minds critique assumptions, and breakthroughs find momentum.
              </p>
            </SlideUp>

            <SlideUp delay={0.4}>
              <div className="pt-2">
                <button
                  onClick={onStart}
                  className="flex items-center gap-2 bg-[#E96B7A] hover:bg-[#DE5565] text-white px-8 py-3.5 rounded-2xl text-xs tracking-wider transition-all transform active:scale-95 shadow-card hover:shadow-glow-coral uppercase"
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.04em' }}
                >
                  <span>MAKE IT YOURS.</span>
                  <span className="text-sm">↗</span>
                </button>
              </div>
            </SlideUp>

            {/* Bottom 3 Metrics Matching Screenshot */}
            <SlideUp delay={0.5}>
              <div className="pt-8 grid grid-cols-3 gap-6 border-t border-[#E5E0D6]">
                <div>
                  <div
                    className="text-3xl sm:text-4xl"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: '#181924', lineHeight: 1 }}
                  >
                    44
                  </div>
                  <div className="mono-label text-[#8E90A2] mt-1.5" style={{ fontSize: '10px' }}>
                    ACTIVE INNOVATIONS
                  </div>
                </div>

                <div>
                  <div className="font-serif text-3xl sm:text-4xl font-bold text-[#5577E6]">
                    12
                  </div>
                  <div className="text-[10px] font-mono font-bold text-[#8E90A2] uppercase tracking-wider mt-1">
                    PEER REVIEWS
                  </div>
                </div>

                <div>
                  <div className="font-serif text-3xl sm:text-4xl font-bold text-[#4FA89B]">
                    100%
                  </div>
                  <div className="text-[10px] font-mono font-bold text-[#8E90A2] uppercase tracking-wider mt-1">
                    CONSENSUS INTEGRITY
                  </div>
                </div>
              </div>
            </SlideUp>
          </div>

          {/* Right Column: Interactive 3D Canvas Card */}
          <div className="lg:col-span-6">
            <SlideUp delay={0.3}>
              <Interactive3DEcosystem />
            </SlideUp>
          </div>

        </div>
      </section>

      {/* 6-Step Storytelling Process Section */}
      <section id="how-it-works" className="py-24 border-y border-innovexa-border bg-innovexa-bg-subtle/40 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="text-xs font-mono font-semibold text-innovexa-purple tracking-widest uppercase">
              THE INNOVATION VALIDATION LIFECYCLE
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-innovexa-ink">
              From initial friction to verified community launch.
            </h2>
            <p className="text-sm text-innovexa-ink-muted">
              A disciplined, human-centered framework designed to eliminate guesswork and build what matters.
            </p>
          </div>

          {/* Grid of 6 Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((s, idx) => (
              <div
                key={s.num}
                className="bg-white rounded-3xl p-8 border border-innovexa-border shadow-subtle hover:shadow-card hover:border-innovexa-ink-light transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-innovexa-ink-light group-hover:text-innovexa-coral transition-colors">
                      {s.num}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${s.color}`}>
                      PHASE {idx + 1}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl font-bold text-innovexa-ink">
                      {s.title}
                    </h3>
                    <div className="text-xs font-mono text-innovexa-purple font-medium mt-0.5">
                      {s.subtitle}
                    </div>
                  </div>

                  <p className="text-xs text-innovexa-ink-muted leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-innovexa-border-subtle mt-6 flex items-center justify-between text-[11px] font-mono text-innovexa-ink-light">
                  <span>INNOVEXA ENGINE</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Validation Engine Feature Highlights */}
      <section id="validation" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="text-xs font-mono font-semibold text-innovexa-coral tracking-widest uppercase">
              RELEVANT REVIEWER MATCHING
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-innovexa-ink leading-tight">
              Feedback from people who actually experience the problem.
            </h2>
            <p className="text-sm text-innovexa-ink-muted leading-relaxed">
              Traditional feedback loops fail because random opinions lack domain relevance. 
              INNOVEXA intelligently maps interest overlap, technical roles, and verified expertise to route ideas to high-signal evaluators.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-innovexa-border">
                <div className="p-2 rounded-xl bg-innovexa-coral/10 text-innovexa-coral shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono text-innovexa-ink uppercase">Anti-Noise Protocol</h4>
                  <p className="text-xs text-innovexa-ink-muted mt-0.5">
                    Self-review blocking, duplicate prevention, and reputation weighting ensure unbiased validation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-innovexa-border">
                <div className="p-2 rounded-xl bg-innovexa-purple/10 text-innovexa-purple shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono text-innovexa-ink uppercase">Connected Project Clusters</h4>
                  <p className="text-xs text-innovexa-ink-muted mt-0.5">
                    Discover complementary innovations, explore potential synergies, and avoid duplicated work.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-innovexa-border p-8 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-innovexa-border-subtle pb-4">
              <span className="text-xs font-mono font-semibold text-innovexa-ink uppercase tracking-wider">
                VALIDATION SIGNAL FORMULA
              </span>
              <Badge variant="purple">DYNAMIC SCORING</Badge>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-innovexa-bg-subtle/60 border border-innovexa-border-subtle">
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="font-semibold text-innovexa-ink">Interest & Domain Overlap</span>
                  <span className="font-bold text-innovexa-purple">30%</span>
                </div>
                <div className="h-2 bg-innovexa-border rounded-full overflow-hidden">
                  <div className="h-full bg-innovexa-purple rounded-full w-[30%]" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-innovexa-bg-subtle/60 border border-innovexa-border-subtle">
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="font-semibold text-innovexa-ink">Problem Significance & Empathy</span>
                  <span className="font-bold text-innovexa-coral">25%</span>
                </div>
                <div className="h-2 bg-innovexa-border rounded-full overflow-hidden">
                  <div className="h-full bg-innovexa-coral rounded-full w-[25%]" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-innovexa-bg-subtle/60 border border-innovexa-border-subtle">
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="font-semibold text-innovexa-ink">Constructive Suggestion Quality</span>
                  <span className="font-bold text-innovexa-teal">25%</span>
                </div>
                <div className="h-2 bg-innovexa-border rounded-full overflow-hidden">
                  <div className="h-full bg-innovexa-teal rounded-full w-[25%]" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-innovexa-bg-subtle/60 border border-innovexa-border-subtle">
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="font-semibold text-innovexa-ink">Reviewer Activity & Reputation</span>
                  <span className="font-bold text-innovexa-amber">20%</span>
                </div>
                <div className="h-2 bg-innovexa-border rounded-full overflow-hidden">
                  <div className="h-full bg-innovexa-amber rounded-full w-[20%]" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-innovexa-purple/5 border border-innovexa-purple/20 text-center">
              <span className="text-xs font-serif italic text-innovexa-purple">
                "Not random validation. Measurable, targeted perspectives."
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 px-6 lg:px-12 bg-innovexa-ink text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <Badge variant="coral">BEGIN TODAY</Badge>
          
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Ready to test your next bold innovation?
          </h2>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
            Create an account in 30 seconds. Personalize your interest profile and submit your problem statement to receive community perspectives.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="bg-innovexa-coral hover:bg-[#DE5B6B] text-white px-8 py-4 rounded-full text-sm font-mono font-semibold tracking-wider transition-all transform active:scale-95 shadow-glow-coral"
            >
              CREATE ACCOUNT →
            </button>
            <button
              onClick={onExplore}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-7 py-4 rounded-full text-sm font-mono font-semibold tracking-wider transition-all"
            >
              BROWSE INNOVATIONS
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-innovexa-border py-12 px-6 lg:px-12 bg-innovexa-bg text-xs font-mono text-innovexa-ink-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-innovexa-ink">INNOVEXA</span>
            <span>•</span>
            <span>BUILD. VALIDATE. IMPACT.</span>
          </div>
          <div>
            © 2026 INNOVEXA Platform. Designed for intentional builders.
          </div>
        </div>
      </footer>

    </div>
  );
};
