import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  Compass, 
  Zap, 
  ArrowRight, 
  Check, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Target,
  FileCheck,
  Scale
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project, ProjectUniquenessReport, SimilarSolutionComparison } from '../../types/database';
import { generateProjectUniquenessReport } from '../../services/projectComparisonService';
import { useProjects } from '../../context/ProjectContext';
import { Badge } from '../common/Badge';

interface SimilarSolutionsDifferentiatorProps {
  project: Partial<Project>;
  onApplyDifferentiation?: (diffText: string, uvpText?: string) => void;
  isSubmissionMode?: boolean;
}

export const SimilarSolutionsDifferentiator: React.FC<SimilarSolutionsDifferentiatorProps> = ({
  project,
  onApplyDifferentiation,
  isSubmissionMode = false
}) => {
  const routerNavigate = useNavigate();
  const { projects } = useProjects();
  const [selectedSolutionIndex, setSelectedSolutionIndex] = useState<number>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [adoptedIndex, setAdoptedIndex] = useState<number | null>(null);

  const report: ProjectUniquenessReport = generateProjectUniquenessReport(project, projects);
  const activeSolution: SimilarSolutionComparison | undefined = report.similarSolutions[selectedSolutionIndex];

  const handleAdoptStrategy = (stratText: string, idx: number) => {
    if (onApplyDifferentiation) {
      onApplyDifferentiation(stratText, `Autonomous 10x workflow with zero lock-in for ${project.target_audience || 'users'}.`);
    }
    setAdoptedIndex(idx);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    setTimeout(() => setAdoptedIndex(null), 3000);
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* ── Top Alert Banner: Existing Solutions Detected & Uniqueness Score ── */}
      <div className="bg-gradient-to-r from-[#181924] to-[#25283B] text-white p-6 sm:p-7 rounded-3xl border border-[#3E4259] shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#E8B653]/20 text-[#E8B653] border border-[#E8B653]/30">
                <Sparkles className="w-3 h-3" />
                SIMILAR SOLUTIONS & UNIQUENESS ADVISOR
              </span>
              <Badge variant="purple">{report.marketCrowdedness.toUpperCase()} MARKET CROWDEDNESS</Badge>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">
              Like Your Project, Similar Solutions Exist in the Market
            </h3>
          </div>

          {/* Uniqueness Score Gauge */}
          <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center">
              <div className="font-serif text-3xl font-bold text-[#4FA89B]">
                {report.overallUniquenessScore}%
              </div>
              <div className="text-[9px] font-mono text-white/60 uppercase">
                UNIQUENESS INDEX
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
          {report.executiveMessage}
        </p>
      </div>

      {/* ── Section 1: Identified Similar Solutions Tabs & Deep Breakdown ── */}
      <div className="bg-white rounded-3xl border border-[#E5E0D6] p-6 sm:p-7 shadow-card space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#6875E8]">
              01 / IDENTIFIED SIMILAR SOLUTIONS ({report.similarSolutions.length})
            </span>
            <span className="text-xs font-mono text-[#8E90A2]">
              Select a solution to compare
            </span>
          </div>
          <h4 className="font-serif text-xl font-bold text-[#181924]">
            How Existing Alternatives Currently Operate
          </h4>
        </div>

        {/* Solution Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {report.similarSolutions.map((sol, idx) => {
            const isSelected = selectedSolutionIndex === idx;
            return (
              <button
                key={sol.id}
                type="button"
                onClick={() => setSelectedSolutionIndex(idx)}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  isSelected
                    ? 'bg-[#181924] text-white border-[#181924] shadow-card'
                    : 'bg-[#FCFAF6] text-[#181924] border-[#E5E0D6] hover:border-[#6875E8]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    isSelected ? 'bg-white/10 text-white' : 'bg-[#E5E0D6] text-[#555768]'
                  }`}>
                    {sol.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono font-bold">
                    {sol.category}
                  </span>
                </div>

                <div className="font-serif font-bold text-base line-clamp-1">
                  {sol.name}
                </div>

                <p className={`text-[11px] line-clamp-2 leading-relaxed ${
                  isSelected ? 'text-white/80' : 'text-[#555768]'
                }`}>
                  {sol.similarityReason}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Solution Detailed Breakdown Card */}
        {activeSolution && (
          <div className="p-6 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D6] space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D6] pb-4">
              <div>
                <div className="text-[10px] font-mono uppercase font-bold text-[#E8B653]">
                  DEEP SOLUTION ANALYSIS
                </div>
                <h5 className="font-serif text-xl font-bold text-[#181924]">
                  {activeSolution.name}
                </h5>
                <p className="text-xs text-[#555768] mt-0.5">
                  {activeSolution.description}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E5E0D6] text-xs font-mono shrink-0">
                <span className="text-[#8E90A2] block text-[10px] uppercase">Similarity Reason:</span>
                <strong className="text-[#181924] text-[11px]">{activeSolution.similarityReason}</strong>
              </div>
            </div>

            {/* 2 Columns: Similarities vs Gaps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#E5E0D6] space-y-2">
                <div className="text-[11px] font-mono font-bold uppercase text-[#4FA89B] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Where It Overlaps With Your Idea</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#555768]">
                  {activeSolution.sharedCapabilities.map((cap, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2">
                      <span className="text-[#4FA89B]">•</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E96B7A]/20 space-y-2">
                <div className="text-[11px] font-mono font-bold uppercase text-[#E96B7A] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Known Weaknesses & Market Gaps</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#555768]">
                  {activeSolution.limitations.map((lim, lIdx) => (
                    <li key={lIdx} className="flex items-start gap-2">
                      <span className="text-[#E96B7A]">✕</span>
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Uniqueness Playbook for this solution */}
            <div className="p-4 bg-white rounded-xl border border-[#6875E8]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-[#6875E8] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Your Uniqueness Wedge Against {activeSolution.name}</span>
                </span>
              </div>
              <p className="text-xs text-[#181924] font-medium leading-relaxed">
                {activeSolution.uniquenessAngle}
              </p>
              <div className="text-[11px] font-mono text-[#555768] bg-[#F7F4EE] p-2.5 rounded-lg border border-[#E5E0D6]">
                <strong className="text-[#181924]">Recommended Moat:</strong> {activeSolution.recommendedMoat}
              </div>

              {activeSolution.type === 'workspace_project' && project.id && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const targetId = activeSolution.id.replace('sim-wp-', '');
                      routerNavigate(`/explore?compare=${project.id},${targetId}`);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#E66F82] hover:bg-[#d65e71] text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Compare Side-by-Side with {activeSolution.name} →</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Actionable Strategies to Make Your Project 100% Unique ── */}
      <div className="bg-white rounded-3xl border border-[#E5E0D6] p-6 sm:p-7 shadow-card space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E8B653]">
            02 / DIFFERENTIATION PLAYBOOK
          </span>
          <h4 className="font-serif text-xl font-bold text-[#181924]">
            3 Ways to Make Your Project Stand Out From Existing Solutions
          </h4>
          <p className="text-xs text-[#555768]">
            Incorporate these specific competitive moats into your UVP so reviewers and users instantly recognize your unique value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report.differentiatorStrategies.map((strat, sIdx) => (
            <div
              key={sIdx}
              className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D6] flex flex-col justify-between space-y-4 shadow-subtle hover:border-[#6875E8] transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#6875E8]/10 text-[#6875E8]">
                    {strat.badge}
                  </span>
                  <span className="text-[10px] font-mono text-[#8E90A2]">
                    STRATEGY {sIdx + 1}
                  </span>
                </div>

                <h5 className="font-serif font-bold text-base text-[#181924]">
                  {strat.title}
                </h5>

                <p className="text-xs text-[#555768] leading-relaxed">
                  {strat.description}
                </p>

                <div className="p-3 bg-white rounded-xl border border-[#E5E0D6] text-[11px] font-mono text-[#181924]">
                  <strong className="text-[#6875E8] block mb-0.5">Execution Hook:</strong>
                  {strat.actionableHook}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                {onApplyDifferentiation && (
                  <button
                    type="button"
                    onClick={() => handleAdoptStrategy(`${strat.description} ${strat.actionableHook}`, sIdx)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#181924] hover:bg-[#6875E8] text-white text-[10px] font-mono font-bold transition-all shadow-subtle flex items-center justify-center gap-1.5"
                  >
                    {adoptedIndex === sIdx ? (
                      <>
                        <Check className="w-3 h-3 text-[#4FA89B]" />
                        <span>ADOPTED TO UVP!</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3" />
                        <span>APPLY TO UVP</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopyText(`${strat.title}: ${strat.description} - ${strat.actionableHook}`, sIdx)}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-[#E5E0D6] border border-[#E5E0D6] text-[#181924] text-[10px] font-mono font-bold transition-all"
                  title="Copy strategy text"
                >
                  {copiedIndex === sIdx ? <Check className="w-3.5 h-3.5 text-[#4FA89B]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Side-by-Side Comparison Matrix ── */}
      <div className="bg-white rounded-3xl border border-[#E5E0D6] p-6 sm:p-7 shadow-card space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#4FA89B]">
            03 / SIDE-BY-SIDE FEATURE MATRIX
          </span>
          <h4 className="font-serif text-xl font-bold text-[#181924]">
            Your Innovation vs. Existing Alternatives
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E5E0D6] text-[11px] font-mono font-bold text-[#8E90A2] uppercase">
                <th className="py-3 px-4 w-1/4">Evaluation Dimension</th>
                <th className="py-3 px-4 w-1/3 text-[#4FA89B] bg-[#4FA89B]/5 rounded-t-xl">
                  ✨ Your Innovation ({project.title || 'Draft'})
                </th>
                <th className="py-3 px-4 w-1/3">Existing Solutions / Market Norm</th>
                <th className="py-3 px-4">Why You Win</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D6]">
              {report.comparisonMatrix.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#181924]">
                    {row.dimension}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#181924] bg-[#4FA89B]/5">
                    {row.yourInnovation}
                  </td>
                  <td className="py-3.5 px-4 text-[#555768]">
                    {row.existingSolutions}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-[#4FA89B]">
                    ✓ {row.whyYoursWins}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
