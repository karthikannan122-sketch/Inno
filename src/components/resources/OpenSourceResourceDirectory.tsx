import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ExternalLink, 
  GitBranch, 
  Globe, 
  Copy, 
  Check, 
  Star, 
  Terminal, 
  Layers, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Cloud, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { OPEN_SOURCE_TOOLS, OpenSourceTool } from '../../data/openSourceDirectory';
import { SlideUp } from '../common/MotionWrapper';

export const OpenSourceResourceDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'All', label: 'ALL RESOURCES' },
    { id: 'ai_ml', label: 'AI & LLMS' },
    { id: 'fullstack_web', label: 'FULLSTACK & WEB' },
    { id: 'backend_api', label: 'BACKEND & APIS' },
    { id: 'database_storage', label: 'DATABASES & STORAGE' },
    { id: 'auth_security', label: 'AUTH & SECURITY' },
    { id: 'devops_cloud', label: 'DEVOPS & DEPLOY' },
  ];

  const filteredTools = useMemo(() => {
    return OPEN_SOURCE_TOOLS.filter(tool => {
      const matchesSearch = 
        searchQuery.trim() === '' ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.bestFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || tool.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopyCommand = (toolId: string, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(toolId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div
        className="p-5 lg:p-6 rounded-[14px] space-y-4 shadow-sm"
        style={{
          background: 'var(--color-surface, #FFFFFF)',
          border: '1px solid var(--color-border, #EAE4D9)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
            <input
              type="text"
              placeholder="Search 50+ open-source tools, models, frameworks, database kits..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs outline-none transition-all rounded-[10px]"
              style={{
                background: 'var(--color-bg-subtle, #FAF8F5)',
                border: '1px solid var(--color-border, #EAE4D9)',
                color: 'var(--color-ink, #181924)',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          <div className="font-mono text-xs text-muted shrink-0">
            {filteredTools.length} verified toolkits available
          </div>
        </div>

        {/* Category selector pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="font-mono whitespace-nowrap transition-all shrink-0 text-[10px] py-1.5 px-3 rounded-[8px]"
              style={{
                background: selectedCategory === cat.id ? 'var(--color-ink, #181924)' : 'transparent',
                color: selectedCategory === cat.id ? 'white' : 'var(--color-muted, #8E90A2)',
                border: selectedCategory === cat.id
                  ? '1px solid var(--color-ink, #181924)'
                  : '1px solid var(--color-border, #EAE4D9)',
                fontWeight: selectedCategory === cat.id ? 600 : 400
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Open Source Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool, idx) => (
          <SlideUp key={tool.id} delay={0.03 + (idx % 6) * 0.03}>
            <div
              className="flex flex-col justify-between rounded-[14px] p-5 h-full transition-all group"
              style={{
                background: 'var(--color-surface, #FFFFFF)',
                border: '1px solid var(--color-border, #EAE4D9)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-coral, #E66F82)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(32,32,42,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border, #EAE4D9)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="space-y-3.5">
                {/* Header with Title & Stars */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono font-bold text-base text-ink group-hover:text-[#E66F82] transition-colors">
                        {tool.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#6875E8]/10 text-[#6875E8] font-semibold">
                        {tool.license}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted">
                      {tool.primaryLanguage} • Difficulty: {tool.selfHostingDifficulty || 'Easy'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-1 rounded-lg shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{tool.stars}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted leading-relaxed line-clamp-3">
                  {tool.description}
                </p>

                {/* Best For Callout */}
                <div 
                  className="p-2.5 rounded-[8px] text-[11px] font-mono"
                  style={{ background: 'var(--color-bg-subtle, #FAF8F5)', border: '1px solid var(--color-border-sub, #F0EAE1)' }}
                >
                  <span className="font-bold text-ink block text-[9px] uppercase tracking-wider text-muted">Best For:</span>
                  <span className="text-ink">{tool.bestFor}</span>
                </div>

                {/* Install Command */}
                {tool.installCommand && (
                  <div className="flex items-center justify-between p-2 rounded-[8px] bg-[#181924] text-white font-mono text-[10px]">
                    <div className="flex items-center gap-1.5 overflow-hidden pr-2">
                      <Terminal className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate text-emerald-300">{tool.installCommand}</span>
                    </div>
                    <button
                      onClick={() => handleCopyCommand(tool.id, tool.installCommand)}
                      className="p-1 rounded hover:bg-white/20 transition-colors shrink-0 text-white/80 hover:text-white"
                      title="Copy install command"
                    >
                      {copiedId === tool.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {tool.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag}
                      className="text-[9px] font-mono px-2 py-0.5 rounded-md"
                      style={{ background: 'var(--color-bg-subtle, #FAF8F5)', color: 'var(--color-muted, #8E90A2)', border: '1px solid var(--color-border-sub, #F0EAE1)' }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons to Open Resources */}
              <div 
                className="pt-4 mt-4 flex items-center gap-2"
                style={{ borderTop: '1px solid var(--color-border-sub, #F0EAE1)' }}
              >
                <a
                  href={tool.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-[8px] bg-[#181924] hover:bg-[#2B2C3C] text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                  <ArrowUpRight className="w-3 h-3 opacity-70" />
                </a>

                {tool.websiteUrl && (
                  <a
                    href={tool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-[8px] bg-[#6875E8] hover:bg-[#5764D0] text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                )}
              </div>
            </div>
          </SlideUp>
        ))}
      </div>
    </div>
  );
};
