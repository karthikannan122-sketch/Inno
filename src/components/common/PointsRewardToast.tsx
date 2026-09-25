import React, { useEffect, useState } from 'react';
import { Sparkles, Trophy, Star, X, CheckCircle, Flame, ArrowUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export const PointsRewardToast: React.FC = () => {
  const { lastReward, clearLastReward } = useAuth();
  const [visibleReward, setVisibleReward] = useState<any>(null);

  useEffect(() => {
    if (lastReward) {
      setVisibleReward(lastReward);

      // Trigger colorful micro-confetti burst
      try {
        confetti({
          particleCount: lastReward.points >= 20 ? 40 : 20,
          spread: 60,
          origin: { x: 0.9, y: 0.85 },
          colors: ['#E66F82', '#6875E8', '#4FA89B', '#E8B653', '#F472B6'],
          disableForReducedMotion: true
        });
      } catch (e) {}

      const timer = setTimeout(() => {
        setVisibleReward(null);
        clearLastReward();
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [lastReward]);

  if (!visibleReward) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      style={{ maxWidth: '380px' }}
    >
      <div 
        className="p-4 rounded-[18px] shadow-2xl flex items-start gap-3.5 relative overflow-hidden group"
        style={{
          background: '#181924',
          border: '1px solid rgba(230, 111, 130, 0.4)',
          color: '#FFFFFF',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4), 0 0 25px rgba(230, 111, 130, 0.25)'
        }}
      >
        {/* Glow backdrop */}
        <div 
          className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #E66F82 0%, transparent 70%)' }}
        />

        {/* Icon Badge */}
        <div 
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
          style={{
            background: visibleReward.points >= 20 
              ? 'linear-gradient(135deg, #E66F82 0%, #6875E8 100%)' 
              : 'linear-gradient(135deg, #4FA89B 0%, #2F855A 100%)'
          }}
        >
          {visibleReward.points >= 50 ? (
            <Trophy className="w-5 h-5 text-white animate-bounce" />
          ) : visibleReward.points >= 20 ? (
            <Star className="w-5 h-5 text-white fill-white" />
          ) : (
            <Sparkles className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 space-y-1 pr-4">
          <div className="flex items-center gap-2">
            <span 
              className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-wider flex items-center gap-1 shadow-sm"
              style={{
                background: 'rgba(56, 161, 105, 0.25)',
                color: '#68D391',
                border: '1px solid rgba(72, 187, 120, 0.4)'
              }}
            >
              <ArrowUp className="w-3 h-3" />
              <span>+{visibleReward.points} REP POINTS</span>
            </span>

            <span className="text-[10px] font-mono text-white/50">
              Total: {visibleReward.totalScore} pts
            </span>
          </div>

          <h4 className="font-serif text-sm font-bold text-white leading-tight">
            {visibleReward.reason}
          </h4>

          <p className="text-[11px] text-white/70 font-sans leading-tight">
            Keep evaluating, voting, and launching innovations to level up your validator status.
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => {
            setVisibleReward(null);
            clearLastReward();
          }}
          className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
