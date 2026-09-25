import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Code2, 
  Copy, 
  Check, 
  HelpCircle, 
  ArrowRight, 
  Terminal, 
  Zap, 
  BookOpen 
} from 'lucide-react';
import { askResearchQuestion, QuickAnswer } from '../../services/aiResearchService';
import { SlideUp } from '../common/MotionWrapper';
import { Badge } from '../common/Badge';

interface ResearchSandboxProps {
  onSelectTool?: (toolName: string) => void;
}

export const ResearchSandbox: React.FC<ResearchSandboxProps> = ({ onSelectTool }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAnswer, setActiveAnswer] = useState<QuickAnswer | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  const promptChips = [
    'How to build local RAG with Ollama & PostgreSQL pgvector?',
    'How to deploy fullstack open-source apps with Coolify for $5/mo?',
    'Best open-source alternatives to Firebase for realtime apps',
    'How to build asynchronous microservices with FastAPI & Redis?'
  ];

  const handleAsk = async (textToAsk?: string) => {
    const q = textToAsk || query;
    if (!q.trim()) return;

    setLoading(true);
    setCurrentPrompt(q);
    try {
      const res = await askResearchQuestion(q);
      setActiveAnswer(res);
      setQuery('');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Prompt Input Card */}
      <SlideUp delay={0.05}>
        <div className="bg-white rounded-3xl border border-[#E5E0D6] p-7 shadow-card space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-widest text-[#6875E8] uppercase font-bold">
                03 / INTERACTIVE AI COPILOT
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#6875E8]" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#181924]">
              AI Research Assistant & Solution Sandbox
            </h2>
            <p className="text-xs sm:text-sm text-[#555768]">
              Ask any engineering, open-source architecture, or technical integration question. Get immediate blueprints and copyable starter code.
            </p>
          </div>

          {/* Prompt Chips */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8E90A2]">
              Quick Architecture Questions:
            </span>
            <div className="flex flex-wrap gap-2">
              {promptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(chip);
                    handleAsk(chip);
                  }}
                  className="text-xs text-[#555768] bg-[#F7F4EE] hover:bg-[#181924] hover:text-white px-3.5 py-2 rounded-xl border border-[#E5E0D6] transition-all text-left flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3 text-[#E8B653] shrink-0" />
                  <span>{chip}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Search Bar */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleAsk(); }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Terminal className="w-4 h-4 text-[#8E90A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask e.g. 'How to configure HNSW vector index in pgvector?' or 'Best open source search engine'..."
                className="w-full bg-[#F7F4EE] pl-10 pr-4 py-3 rounded-2xl border border-[#E5E0D6] text-xs font-mono text-[#181924] outline-none focus:border-[#6875E8] transition-colors placeholder:text-[#8E90A2]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || (!query.trim() && !currentPrompt)}
              className="flex items-center gap-2 bg-[#181924] text-white px-6 py-3 rounded-2xl text-xs font-mono font-bold hover:bg-[#6875E8] transition-all disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <span>ANALYZING...</span>
              ) : (
                <>
                  <span>SOLVE</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </SlideUp>

      {/* Answer Container */}
      {activeAnswer && (
        <SlideUp delay={0.05}>
          <div className="bg-white rounded-3xl border border-[#E5E0D6] p-7 shadow-card space-y-6">
            
            {/* Query Header */}
            <div className="flex items-center justify-between border-b border-[#E5E0D6] pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#6875E8]" />
                <h3 className="font-serif text-xl font-bold text-[#181924]">
                  Solution Analysis: "{currentPrompt}"
                </h3>
              </div>
              <Badge variant="mint">VERIFIED BLUEPRINT</Badge>
            </div>

            {/* Answer Text */}
            <div className="text-sm text-[#181924] leading-relaxed p-5 bg-[#F7F4EE] rounded-2xl border border-[#E5E0D6]">
              {activeAnswer.answer}
            </div>

            {/* Code Snippet if present */}
            {activeAnswer.codeSnippet && (
              <div className="bg-[#181924] rounded-2xl overflow-hidden shadow-subtle">
                <div className="p-4 border-b border-white/10 flex items-center justify-between text-xs font-mono text-white/70">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#4FA89B]" />
                    <span className="uppercase font-bold">{activeAnswer.codeSnippet.language} Code Snippet</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(activeAnswer.codeSnippet!.code)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-[#4FA89B]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
                <div className="p-5 text-[#F7F4EE] overflow-x-auto">
                  <pre className="font-mono text-xs leading-relaxed">
                    <code>{activeAnswer.codeSnippet.code}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Recommended Tools */}
            {activeAnswer.recommendedTools.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8E90A2] block">
                  Recommended Open Source Tools:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {activeAnswer.recommendedTools.map((tool: any) => (
                    <div 
                      key={tool.id}
                      className="p-4 bg-[#F7F4EE] rounded-2xl border border-[#E5E0D6] space-y-2 hover:border-[#181924]/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-base text-[#181924]">{tool.name}</span>
                        <span className="text-[10px] font-mono font-bold text-[#4FA89B]">★ {tool.stars}</span>
                      </div>
                      <p className="text-xs text-[#555768] line-clamp-2">{tool.description}</p>
                      <code className="text-[10px] font-mono bg-[#181924] text-white px-2 py-1 rounded block truncate">
                        {tool.installCommand}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Follow-Up Questions */}
            {activeAnswer.relatedQuestions.length > 0 && (
              <div className="pt-4 border-t border-[#E5E0D6] space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8E90A2] block">
                  Explore Follow-up Questions:
                </span>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  {activeAnswer.relatedQuestions.map((rq: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleAsk(rq)}
                      className="flex items-center gap-1.5 text-xs text-[#6875E8] hover:underline bg-[#F7F4EE] px-3 py-1.5 rounded-xl border border-[#E5E0D6] text-left"
                    >
                      <ArrowRight className="w-3 h-3 shrink-0" />
                      <span>{rq}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </SlideUp>
      )}

    </div>
  );
};
