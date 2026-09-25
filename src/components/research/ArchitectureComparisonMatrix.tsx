import React, { useState } from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Layers,
  Scale
} from 'lucide-react';
import { COMPARISON_PAIRS, ComparisonPair } from '../../data/openSourceDirectory';
import { SlideUp } from '../common/MotionWrapper';
import { Badge } from '../common/Badge';

interface ArchitectureComparisonMatrixProps {
  onSelectOpenSourceTool?: (toolId: string) => void;
}

export const ArchitectureComparisonMatrix: React.FC<ArchitectureComparisonMatrixProps> = ({
  onSelectOpenSourceTool
}) => {
  const [selectedPairId, setSelectedPairId] = useState<string>(COMPARISON_PAIRS[0]?.id || 'supabase-vs-firebase');

  const selectedPair: ComparisonPair = COMPARISON_PAIRS.find(p => p.id === selectedPairId) || COMPARISON_PAIRS[0];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <SlideUp delay={0.05}>
        <div className="bg-white rounded-3xl border border-[#E5E0D6] p-7 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-widest text-[#6875E8] uppercase font-bold">
                  04 / STRATEGIC BENCHMARK
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#6875E8]" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#181924]">
                Open Source vs Proprietary SaaS Comparison Matrix
              </h2>
              <p className="text-xs sm:text-sm text-[#555768]">
                Rigorous side-by-side analysis of data sovereignty, cost scaling, vendor lock-in risk, and setup complexity.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="mint">MAXIMUM SOVEREIGNTY</Badge>
            </div>
          </div>

          {/* Preset Selector Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2">
            {COMPARISON_PAIRS.map(pair => (
              <button
                key={pair.id}
                onClick={() => setSelectedPairId(pair.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedPairId === pair.id
                    ? 'bg-[#181924] text-white shadow-subtle'
                    : 'bg-[#F7F4EE] text-[#555768] hover:bg-[#E5E0D6] border border-[#E5E0D6]'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-[#E8B653]" />
                <span>{pair.title}</span>
              </button>
            ))}
          </div>
        </div>
      </SlideUp>

      {/* Main Comparison Hero View */}
      {selectedPair && (
        <SlideUp delay={0.08}>
          <div className="space-y-6">
            
            {/* Top Verdict Banner */}
            <div className="p-6 rounded-3xl bg-[#181924] text-white shadow-card space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#4FA89B]" />
                  <span className="text-xs font-mono font-bold text-[#4FA89B] uppercase">
                    ARCHITECTURAL VERDICT & SAVINGS
                  </span>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#4FA89B]/20 text-[#4FA89B] border border-[#4FA89B]/40">
                  {selectedPair.monthlySavings}
                </span>
              </div>
              <p className="font-serif text-lg sm:text-xl text-[#F7F4EE] leading-relaxed">
                "{selectedPair.verdict}"
              </p>
            </div>

            {/* Side by Side Dual Column Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left: Open Source Solution */}
              <div className="bg-white rounded-3xl border-2 border-[#4FA89B] p-6 shadow-subtle space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E0D6] pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-[#4FA89B]">
                        OPEN SOURCE STACK
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-[#181924]">
                        {selectedPair.openSourceTool}
                      </h3>
                    </div>
                    <Badge variant="mint">RECOMMENDED</Badge>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-[#F7F4EE] rounded-xl border border-[#E5E0D6] space-y-1">
                      <span className="font-mono font-bold text-[#181924] text-[10px] uppercase block">
                        Data Privacy & Hosting:
                      </span>
                      <span className="text-[#555768] font-medium">{selectedPair.metrics.dataPrivacy.openSource}</span>
                    </div>

                    <div className="p-3 bg-[#F7F4EE] rounded-xl border border-[#E5E0D6] space-y-1">
                      <span className="font-mono font-bold text-[#181924] text-[10px] uppercase block">
                        Cost Model at Scale:
                      </span>
                      <span className="text-[#4FA89B] font-bold">{selectedPair.metrics.costAtScale.openSource}</span>
                    </div>

                    <div className="p-3 bg-[#F7F4EE] rounded-xl border border-[#E5E0D6] space-y-1">
                      <span className="font-mono font-bold text-[#181924] text-[10px] uppercase block">
                        Vendor Lock-in Risk:
                      </span>
                      <span className="text-[#4FA89B] font-bold">{selectedPair.metrics.vendorLockIn.openSource}</span>
                    </div>
                  </div>

                  {/* Why Choose Open Source */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#181924] block">
                      Why Choose Open Source For Your Project:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#555768]">
                      {selectedPair.whyChooseOpenSource.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#4FA89B] mt-0.5 shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {onSelectOpenSourceTool && (
                  <button
                    onClick={() => onSelectOpenSourceTool(selectedPair.openSourceId)}
                    className="w-full py-2.5 rounded-xl bg-[#4FA89B] hover:bg-[#3D8F83] text-white text-xs font-mono font-bold transition-all shadow-subtle flex items-center justify-center gap-1.5"
                  >
                    <span>EXPLORE {selectedPair.openSourceTool} BLUEPRINT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Right: Commercial SaaS Solution */}
              <div className="bg-white rounded-3xl border border-[#E5E0D6] p-6 shadow-subtle space-y-5 flex flex-col justify-between opacity-95">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E0D6] pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-[#8E90A2]">
                        COMMERCIAL SAAS
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-[#181924]">
                        {selectedPair.commercialSaaS}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#E96B7A]/10 text-[#E96B7A] border border-[#E96B7A]/30">
                      PROPRIETARY LOCK-IN
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-[#F7F4EE] rounded-xl border border-[#E5E0D6] space-y-1">
                      <span className="font-mono font-bold text-[#181924] text-[10px] uppercase block">
                        Data Privacy & Hosting:
                      </span>
                      <span className="text-[#555768] font-medium">{selectedPair.metrics.dataPrivacy.saas}</span>
                    </div>

                    <div className="p-3 bg-[#F7F4EE] rounded-xl border border-[#E5E0D6] space-y-1">
                      <span className="font-mono font-bold text-[#181924] text-[10px] uppercase block">
                        Cost Model at Scale:
                      </span>
                      <span className="text-[#E96B7A] font-bold">{selectedPair.metrics.costAtScale.saas}</span>
                    </div>

                    <div className="p-3 bg-[#F7F4EE] rounded-xl border border-[#E5E0D6] space-y-1">
                      <span className="font-mono font-bold text-[#181924] text-[10px] uppercase block">
                        Vendor Lock-in Risk:
                      </span>
                      <span className="text-[#E96B7A] font-bold">{selectedPair.metrics.vendorLockIn.saas}</span>
                    </div>
                  </div>

                  {/* When to Choose SaaS */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#181924] block">
                      When Proprietary SaaS Still Makes Sense:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#555768]">
                      {selectedPair.whenToChooseSaaS.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-[#E8B653] mt-0.5 shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F7F4EE] border border-[#E5E0D6] text-center text-xs font-mono text-[#8E90A2]">
                  Proprietary API • Metered Monthly Billing
                </div>
              </div>

            </div>

          </div>
        </SlideUp>
      )}

    </div>
  );
};
