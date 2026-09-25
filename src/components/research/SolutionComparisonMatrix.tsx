import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  Layers,
  Cpu,
  Server,
  Star
} from 'lucide-react';
import { RelatedSolutionApproach } from '../../services/aiResearchService';
import { SlideUp } from '../common/MotionWrapper';

interface SolutionComparisonMatrixProps {
  relatedSolutions: RelatedSolutionApproach[];
  activeApproachId: string;
  onSelectApproach: (approachId: string) => void;
  queryTitle: string;
}

export const SolutionComparisonMatrix: React.FC<SolutionComparisonMatrixProps> = ({
  relatedSolutions,
  activeApproachId,
  onSelectApproach,
  queryTitle
}) => {
  if (!relatedSolutions || relatedSolutions.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div 
        className="p-5 sm:p-6 rounded-[18px] flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(104,117,232,0.08) 0%, rgba(230,111,130,0.08) 100%)',
          border: '1px solid var(--color-border, #EAE4D9)'
        }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6875E8] text-white">
              ARCHITECTURAL TRADE-OFF MATRIX
            </span>
            <span className="font-mono text-xs text-muted">
              {relatedSolutions.length} Distinct Engineering Approaches
            </span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-ink">
            Compare Related Solutions for "{queryTitle}"
          </h3>
          <p className="text-xs text-muted max-w-2xl leading-relaxed">
            Different technical trade-offs serve different constraints. Choose between rapid MVP time-to-market, 100% private offline execution, or high-throughput distributed microservices.
          </p>
        </div>

        <div className="font-mono text-[11px] text-[#6875E8] bg-white px-4 py-2 rounded-[12px] border border-[#6875E8]/30 shrink-0 flex items-center gap-2 shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>Click "Select Solution" to swap blueprint</span>
        </div>
      </div>

      {/* Side-by-Side Solution Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {relatedSolutions.map((sol, idx) => {
          const isSelected = sol.id === activeApproachId;

          return (
            <SlideUp key={sol.id} delay={0.05 + idx * 0.05}>
              <div
                className={`flex flex-col justify-between rounded-[18px] p-6 h-full transition-all relative ${
                  isSelected 
                    ? 'ring-2 ring-[#E66F82] shadow-xl bg-white' 
                    : 'bg-white hover:border-[#6875E8] shadow-sm hover:shadow-md'
                }`}
                style={{
                  border: isSelected ? '1px solid #E66F82' : '1px solid var(--color-border, #EAE4D9)'
                }}
              >
                {/* Active Indicator Ribbon */}
                {isSelected && (
                  <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#E66F82] text-white font-mono text-[10px] font-bold tracking-wider uppercase shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    <span>ACTIVE BLUEPRINT</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Tag & Title */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span 
                        className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: sol.tagColor ? `${sol.tagColor}15` : 'rgba(104,117,232,0.12)',
                          color: sol.tagColor || '#6875E8'
                        }}
                      >
                        {sol.tag}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {sol.feasibilityScore}% Feasibility
                      </span>
                    </div>

                    <h4 className="font-display font-semibold text-xl text-ink leading-tight">
                      {sol.title}
                    </h4>

                    <p className="text-xs text-muted leading-relaxed line-clamp-3">
                      {sol.architectureSummary}
                    </p>
                  </div>

                  {/* Key Metrics Chips */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    <div className="p-2.5 rounded-[10px] bg-[#FAF8F5] border border-[#F0EAE1]">
                      <span className="text-[9px] uppercase tracking-wider text-muted block">Speed to MVP</span>
                      <span className="font-bold text-ink flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-[#6875E8]" />
                        {sol.speedToMarketDays} Days
                      </span>
                    </div>

                    <div className="p-2.5 rounded-[10px] bg-[#FAF8F5] border border-[#F0EAE1]">
                      <span className="text-[9px] uppercase tracking-wider text-muted block">Est. Monthly Cost</span>
                      <span className="font-bold text-ink flex items-center gap-1 mt-0.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        {sol.estimatedCloudCost}
                      </span>
                    </div>
                  </div>

                  {/* Core Stack */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block">
                      Core Technology Stack:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sol.coreStack.map(st => (
                        <span 
                          key={st}
                          className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-[#FAF8F5] text-[#181924] border border-[#EAE4D9]"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pros & Advantages */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">
                      Key Advantages (Pros):
                    </span>
                    <ul className="space-y-1 text-[11px] text-[#2B2C3C]">
                      {sol.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons & Limitations */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 block">
                      Trade-offs (Cons):
                    </span>
                    <ul className="space-y-1 text-[11px] text-muted">
                      {sol.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Best For Callout */}
                  <div className="p-3 rounded-[10px] bg-[#FAF8F5] border border-[#EAE4D9] text-xs leading-relaxed font-mono">
                    <span className="text-[9px] uppercase tracking-wider text-muted font-bold block">Why Choose This:</span>
                    <span className="text-ink text-[11px]">{sol.whyChooseThis}</span>
                  </div>
                </div>

                {/* Selection Button */}
                <div className="pt-5 mt-4 border-t border-[#F0EAE1]">
                  {isSelected ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-[12px] bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-default"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Currently Active Blueprint</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectApproach(sol.id)}
                      className="w-full py-2.5 px-4 rounded-[12px] bg-[#181924] hover:bg-[#E66F82] text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm group"
                    >
                      <span>Select This Solution</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </SlideUp>
          );
        })}
      </div>

      {/* Comparison Deep-Dive Table */}
      <div 
        className="bg-white rounded-[18px] border border-[#EAE4D9] p-6 shadow-sm overflow-hidden space-y-4"
      >
        <h4 className="font-serif text-lg font-bold text-ink">
          Side-by-Side Feature & Requirement Comparison
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#EAE4D9] text-[10px] text-muted uppercase">
                <th className="py-3 px-3">Evaluation Metric</th>
                {relatedSolutions.map(s => (
                  <th key={s.id} className="py-3 px-3">
                    <span className={s.id === activeApproachId ? 'text-[#E66F82] font-bold' : 'text-ink'}>
                      {s.title}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              <tr>
                <td className="py-3 px-3 font-semibold text-muted">Primary Strategy</td>
                {relatedSolutions.map(s => (
                  <td key={s.id} className="py-3 px-3 text-ink">
                    {s.tag}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-muted">Time to Launch MVP</td>
                {relatedSolutions.map(s => (
                  <td key={s.id} className="py-3 px-3 font-bold text-emerald-700">
                    {s.speedToMarketDays} Days
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-muted">Monthly Cloud / Server Cost</td>
                {relatedSolutions.map(s => (
                  <td key={s.id} className="py-3 px-3 font-bold text-ink">
                    {s.estimatedCloudCost}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-muted">Data Privacy & Sovereignty</td>
                {relatedSolutions.map(s => (
                  <td key={s.id} className="py-3 px-3 text-ink">
                    {s.securityPrivacy}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-muted">Scalability Limit</td>
                {relatedSolutions.map(s => (
                  <td key={s.id} className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      String(s.scalabilityRating) === 'Very High' 
                        ? 'bg-purple-100 text-purple-800' 
                        : String(s.scalabilityRating) === 'High' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {String(s.scalabilityRating || 'Standard')}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-muted">Action</td>
                {relatedSolutions.map(s => (
                  <td key={s.id} className="py-3 px-3">
                    {s.id === activeApproachId ? (
                      <span className="text-emerald-600 font-bold">✓ Active</span>
                    ) : (
                      <button
                        onClick={() => onSelectApproach(s.id)}
                        className="text-[#6875E8] hover:underline font-bold"
                      >
                        Switch to this →
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
