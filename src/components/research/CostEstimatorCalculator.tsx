import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingDown, 
  Server, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Sliders 
} from 'lucide-react';
import { SlideUp } from '../common/MotionWrapper';
import { Badge } from '../common/Badge';

export const CostEstimatorCalculator: React.FC = () => {
  const [mau, setMau] = useState<number>(25000);
  const [useAI, setUseAI] = useState<boolean>(true);
  const [useSearch, setUseSearch] = useState<boolean>(true);

  // Cost formulas
  const saasBaseBaaS = Math.round(25 + (mau / 1000) * 8); // Firebase/Supabase Cloud
  const saasAICost = useAI ? Math.round((mau / 1000) * 28) : 0; // OpenAI token usage
  const saasSearchCost = useSearch ? Math.round((mau / 1000) * 12) : 0; // Algolia
  const saasTotalMonthly = saasBaseBaaS + saasAICost + saasSearchCost;

  // Open Source Self-Hosted
  const osVpsCost = mau < 10000 ? 6 : mau < 50000 ? 14 : mau < 150000 ? 28 : 64; // Hetzner VPS
  const osGpuCost = useAI && mau > 50000 ? 35 : 0; // Optional GPU for high scale
  const osTotalMonthly = osVpsCost + osGpuCost;

  const monthlySavings = Math.max(0, saasTotalMonthly - osTotalMonthly);
  const annualSavings = monthlySavings * 12;

  // Server sizing recommendation
  const serverSpecs = mau < 10000 ? '2 vCPU • 4 GB RAM • 40 GB NVMe' :
    mau < 50000 ? '4 vCPU • 8 GB RAM • 80 GB NVMe' :
    mau < 150000 ? '8 vCPU • 16 GB RAM • 160 GB NVMe' :
    '16 vCPU • 32 GB RAM • 320 GB NVMe + Dedicated GPU';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <SlideUp delay={0.05}>
        <div className="bg-white rounded-3xl border border-[#E5E0D6] p-7 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-widest text-[#6875E8] uppercase font-bold">
                  05 / FINANCIAL INTELLIGENCE
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#6875E8]" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#181924]">
                Interactive Cloud Cost & Scalability Estimator
              </h2>
              <p className="text-xs sm:text-sm text-[#555768]">
                Calculate exact infrastructure expenditure comparing open-source self-hosting versus proprietary metered SaaS at your project's traffic volume.
              </p>
            </div>

            <Badge variant="mint">ROI CALCULATOR</Badge>
          </div>
        </div>
      </SlideUp>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E5E0D6] p-7 shadow-card space-y-6">
          <div className="flex items-center gap-2 border-b border-[#E5E0D6] pb-3">
            <Sliders className="w-4 h-4 text-[#6875E8]" />
            <span className="text-xs font-mono font-bold text-[#181924] uppercase">Project Scale Parameters</span>
          </div>

          {/* User Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#181924]">
                Monthly Active Users (MAU):
              </span>
              <span className="text-sm font-mono font-bold text-[#6875E8] px-2.5 py-1 bg-[#6875E8]/10 rounded-lg">
                {mau.toLocaleString()} Users
              </span>
            </div>

            <input
              type="range"
              min="1000"
              max="200000"
              step="2000"
              value={mau}
              onChange={(e) => setMau(Number(e.target.value))}
              className="w-full accent-[#6875E8] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-[#8E90A2]">
              <span>1k (MVP)</span>
              <span>50k (Growth)</span>
              <span>100k</span>
              <span>200k+ (Scale)</span>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8E90A2] block">
              Architectural Workloads:
            </span>

            <label className="flex items-center justify-between p-3.5 bg-[#F7F4EE] rounded-2xl border border-[#E5E0D6] cursor-pointer hover:border-[#181924]/30 transition-all">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#181924]">AI / LLM Ingestion Workload</div>
                <div className="text-[10px] text-[#555768]">Ollama/vLLM vs OpenAI token meter</div>
              </div>
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="w-4 h-4 accent-[#4FA89B] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-[#F7F4EE] rounded-2xl border border-[#E5E0D6] cursor-pointer hover:border-[#181924]/30 transition-all">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#181924]">Instant Search & Filtering</div>
                <div className="text-[10px] text-[#555768]">Meilisearch vs Algolia per-query charges</div>
              </div>
              <input
                type="checkbox"
                checked={useSearch}
                onChange={(e) => setUseSearch(e.target.checked)}
                className="w-4 h-4 accent-[#4FA89B] cursor-pointer"
              />
            </label>
          </div>

          {/* Hardware sizing box */}
          <div className="p-4 bg-[#181924] rounded-2xl text-white space-y-1.5 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#4FA89B] font-bold text-[10px] uppercase">
              <Server className="w-3.5 h-3.5" />
              <span>Recommended Single VPS Sizing:</span>
            </div>
            <div className="text-white font-bold">{serverSpecs}</div>
            <div className="text-[#8E90A2] text-[10px] pt-1">
              Estimated hosting: ~${osVpsCost}/month (Hetzner / DO / AWS Lightsail)
            </div>
          </div>
        </div>

        {/* Right: Cost Savings Comparison Summary */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5E0D6] p-7 shadow-card space-y-6 flex flex-col justify-between">
          
          <div className="space-y-6">
            {/* Top Big Savings Hero */}
            <div className="p-6 bg-[#F7F4EE] rounded-3xl border border-[#E5E0D6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-[#4FA89B] tracking-wider">
                  PROJECTED ANNUAL SAVINGS
                </span>
                <div className="font-serif text-4xl sm:text-5xl font-bold text-[#4FA89B]">
                  ${annualSavings.toLocaleString()}
                  <span className="text-sm font-sans font-normal text-[#555768]"> / yr</span>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1 text-xs font-mono">
                <div className="text-[#181924] font-bold">Monthly Savings: ${monthlySavings.toLocaleString()}/mo</div>
                <div className="text-[#8E90A2]">~{Math.round((monthlySavings / Math.max(1, saasTotalMonthly)) * 100)}% Cost Reduction</div>
              </div>
            </div>

            {/* Visual Comparison Bars */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-[#181924]">Open Source Self-Hosted (PostgreSQL + Docker + Ollama)</span>
                  <span className="font-bold text-[#4FA89B]">${osTotalMonthly}/mo</span>
                </div>
                <div className="h-3 bg-[#F7F4EE] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#4FA89B] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(8, (osTotalMonthly / saasTotalMonthly) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-[#181924]">Commercial Proprietary SaaS (OpenAI + Firebase + Algolia)</span>
                  <span className="font-bold text-[#E96B7A]">${saasTotalMonthly}/mo</span>
                </div>
                <div className="h-3 bg-[#F7F4EE] rounded-full overflow-hidden">
                  <div className="h-full bg-[#E96B7A] rounded-full w-full" />
                </div>
              </div>
            </div>

            {/* Strategic Advantages Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#555768]">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4FA89B] mt-0.5 shrink-0" />
                <span>Zero surprise read/write invoice spikes</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4FA89B] mt-0.5 shrink-0" />
                <span>Fixed predictable server line item</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4FA89B] mt-0.5 shrink-0" />
                <span>Complete database sovereignty (GDPR compliant)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4FA89B] mt-0.5 shrink-0" />
                <span>Unlimited team seats with zero per-user pricing</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E0D6] flex items-center justify-between text-[11px] font-mono text-[#8E90A2]">
            <span>Calculations based on standard Hetzner Cloud and OpenAI token pricing.</span>
          </div>

        </div>

      </div>

    </div>
  );
};
