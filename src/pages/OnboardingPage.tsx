import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Compass, Lightbulb, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { SlideUp, FadeIn } from '../components/common/MotionWrapper';

interface OnboardingPageProps {
  onComplete?: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete: propOnComplete }) => {
  const routerNavigate = useNavigate();
  const onComplete = propOnComplete || (() => routerNavigate('/home'));
  const { user, completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Technology', 'Artificial Intelligence']);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Creator', 'Reviewer']);
  const [saving, setSaving] = useState(false);

  const interestOptions = [
    'Technology',
    'Artificial Intelligence',
    'Healthcare',
    'Education',
    'Sustainability',
    'Finance',
    'Agriculture',
    'Cybersecurity',
    'Design',
    'Robotics',
    'Startups',
    'Social Impact'
  ];

  const roleOptions = [
    { id: 'Creator', title: 'Creator', desc: 'Submitting ideas, products, and requesting feedback' },
    { id: 'Explorer', title: 'Explorer', desc: 'Discovering novel innovations and learning from projects' },
    { id: 'Reviewer', title: 'Reviewer', desc: 'Giving fast, constructive perspectives to fellow builders' },
    { id: 'Builder', title: 'Builder', desc: 'Seeking collaborators, co-founders, and tech synergy' },
    { id: 'Researcher', title: 'Researcher', desc: 'Exploring market signals and domain validation trends' }
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    await completeOnboarding(selectedInterests, selectedRoles);
    setSaving(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-innovexa-bg text-innovexa-ink flex flex-col justify-between p-6 lg:p-12 selection:bg-innovexa-coral/20">
      
      {/* Brand & Progress Header */}
      <div className="max-w-2xl mx-auto w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-innovexa-ink">
              INNOVEXA
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-innovexa-coral animate-pulse"></span>
          </div>
          <div className="text-xs font-mono text-innovexa-ink-muted">
            PAGE {step} OF 3 ({Math.round((step / 3) * 100)}%)
          </div>
        </div>

        {/* Step Progress Line & Step Chips */}
        <div className="space-y-2">
          <div className="w-full bg-innovexa-bg-subtle h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-innovexa-coral via-innovexa-purple to-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { num: 1, label: '1. Interests' },
              { num: 2, label: '2. Roles' },
              { num: 3, label: '3. Space Ready' },
            ].map(s => (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < step || (s.num === 2 && selectedInterests.length > 0) || (s.num === 3 && selectedRoles.length > 0)) {
                    setStep(s.num);
                  }
                }}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-mono transition-all ${
                  step === s.num
                    ? 'bg-innovexa-ink text-white font-bold shadow-sm'
                    : s.num < step
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-white/70 text-innovexa-ink-muted border border-innovexa-border-subtle'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto w-full my-8">
        <SlideUp delay={0.1}>
          <div className="bg-white rounded-3xl border border-innovexa-border p-8 lg:p-10 shadow-float space-y-8">
            
            {/* Step 1: Interests */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-coral uppercase">
                    STEP 01 / PERSONALIZATION
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-innovexa-ink">
                    What interests you?
                  </h2>
                  <p className="text-xs text-innovexa-ink-muted leading-relaxed">
                    Select the domain areas you are passionate about. We will route matching projects and review invitations to your workspace.
                  </p>
                </div>

                {/* Interest Pills Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {interestOptions.map(interest => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`p-3 rounded-2xl border text-xs font-mono tracking-tight text-left transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-innovexa-coral/10 border-innovexa-coral text-innovexa-coral font-bold shadow-sm'
                            : 'bg-innovexa-bg-subtle/40 border-innovexa-border hover:border-innovexa-ink-light text-innovexa-ink'
                        }`}
                      >
                        <span className="truncate">{interest}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-innovexa-border-subtle">
                  <span className="text-[11px] font-mono text-innovexa-ink-muted">
                    {selectedInterests.length} selected
                  </span>
                  <button
                    type="button"
                    disabled={selectedInterests.length === 0}
                    onClick={() => setStep(2)}
                    className="bg-innovexa-ink hover:bg-black text-white px-6 py-2.5 rounded-full text-xs font-mono font-semibold tracking-wider transition-all disabled:opacity-40 flex items-center gap-2"
                  >
                    <span>CONTINUE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Roles */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-innovexa-purple uppercase">
                    STEP 02 / ROLES & PARTICIPATION
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-innovexa-ink">
                    How do you participate?
                  </h2>
                  <p className="text-xs text-innovexa-ink-muted leading-relaxed">
                    Choose one or more ways you wish to engage with the INNOVEXA ecosystem. You can adjust this anytime in settings.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {roleOptions.map(r => {
                    const isSelected = selectedRoles.includes(r.id);
                    return (
                      <div
                        key={r.id}
                        onClick={() => toggleRole(r.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-innovexa-purple/10 border-innovexa-purple shadow-sm'
                            : 'bg-innovexa-bg-subtle/30 border-innovexa-border hover:border-innovexa-ink-light'
                        }`}
                      >
                        <div>
                          <div className={`text-sm font-bold font-serif ${isSelected ? 'text-innovexa-purple' : 'text-innovexa-ink'}`}>
                            {r.title}
                          </div>
                          <div className="text-xs text-innovexa-ink-muted mt-0.5 leading-relaxed">
                            {r.desc}
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-innovexa-purple border-innovexa-purple text-white' : 'border-innovexa-border'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-innovexa-border-subtle">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-mono text-innovexa-ink-muted hover:text-innovexa-ink"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={selectedRoles.length === 0}
                    onClick={() => setStep(3)}
                    className="bg-innovexa-purple hover:bg-[#6C4CD0] text-white px-6 py-2.5 rounded-full text-xs font-mono font-semibold tracking-wider transition-all disabled:opacity-40 flex items-center gap-2"
                  >
                    <span>NEXT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Space Ready */}
            {step === 3 && (
              <div className="text-center py-6 space-y-6 animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 uppercase">
                    INITIALIZATION COMPLETE
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-innovexa-ink">
                    Your space is ready.
                  </h2>
                  <p className="text-xs text-innovexa-ink-muted max-w-md mx-auto leading-relaxed">
                    Welcome to INNOVEXA, {user?.full_name?.split(' ')[0] || 'Innovator'}. Your personal workspace has been configured to surface relevant projects and reviewers.
                  </p>
                </div>

                <div className="p-4 bg-innovexa-bg-subtle/60 rounded-2xl border border-innovexa-border-subtle max-w-sm mx-auto text-left text-xs font-mono space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-innovexa-ink-muted">Interests:</span>
                    <span className="font-bold text-innovexa-ink truncate max-w-[180px]">{selectedInterests.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-innovexa-ink-muted">Roles:</span>
                    <span className="font-bold text-innovexa-ink">{selectedRoles.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-innovexa-ink-muted">Reputation:</span>
                    <span className="font-bold text-emerald-600">100 Initial Points</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleFinish}
                    disabled={saving}
                    className="bg-innovexa-coral hover:bg-[#DE5B6B] text-white px-8 py-3.5 rounded-full text-xs font-mono font-semibold tracking-wider shadow-card hover:shadow-glow-coral transition-all transform active:scale-95 disabled:opacity-50"
                  >
                    {saving ? 'CONFIGURING WORKSPACE...' : 'ENTER INNOVEXA →'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </SlideUp>
      </div>

      <div className="text-center text-[11px] font-mono text-innovexa-ink-light">
        INNOVEXA • BUILD • VALIDATE • IMPACT
      </div>

    </div>
  );
};
