import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  GitFork, 
  Sparkles, 
  Tag, 
  Star, 
  Filter 
} from 'lucide-react';
import { OPEN_SOURCE_TOOLS, CATEGORY_LABELS, OpenSourceTool } from '../../data/openSourceDirectory';
import { SlideUp } from '../common/MotionWrapper';
import { Badge } from '../common/Badge';

interface OpenSourceExplorerProps {
  onSelectToolForResearch?: (tool: OpenSourceTool) => void;
}

export const OpenSourceExplorer: React.FC<OpenSourceExplorerProps> = ({ 
  onSelectToolForResearch 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Ecosystem' },
    { id: 'ai_ml', label: 'AI & LLMs' },
    { id: 'backend_api', label: 'Backend & APIs' },
    { id: 'fullstack_web', label: 'Frontend & UI' },
    { id: 'database_storage', label: 'Data & Storage' },
    { id: 'devops_cloud', label: 'DevOps & Deploy' },
  ];

  const filteredTools = useMemo(() => {
    return OPEN_SOURCE_TOOLS.filter(tool => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.primaryLanguage.toLowerCase().includes(q) ||
        tool.tags.some(t => t.toLowerCase().includes(q)) ||
        tool.bestFor.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopyInstall = (id: string, command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Search Controls */}
      <SlideUp delay={0.05}>
        <div className="bg-white rounded-3xl border border-[#E5E0D6] p-7 shadow-card space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-widest text-[#6875E8] uppercase font-bold">
                  02 / VETTED DIRECTORY
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#6875E8]" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#181924]">
                Open Source Tool & Repository Registry
              </h2>
              <p className="text-xs sm:text-sm text-[#555768]">
                Curated open source building blocks with zero vendor lock-in. Filter by category, inspect CLI install scripts, or generate AI solutions.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="purple">{filteredTools.length} TOOLS AVAILABLE</Badge>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#8E90A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools by name, tag, language, or keyword (e.g. 'vector', 'fastapi', 'realtime', 'auth')..."
                className="w-full bg-[#F7F4EE] pl-10 pr-4 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono text-[#181924] outline-none focus:border-[#6875E8] transition-colors placeholder:text-[#8E90A2]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8E90A2] hover:text-[#181924]"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap
                    ${isActive 
                      ? 'bg-[#181924] text-white shadow-subtle' 
                      : 'bg-[#F7F4EE] text-[#555768] hover:bg-[#E5E0D6] border border-[#E5E0D6]'
                    }
                  `}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </SlideUp>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool, idx) => {
          const catInfo = CATEGORY_LABELS[tool.category] || { label: tool.category, color: '#6875E8' };
          const isCopied = copiedId === tool.id;

          return (
            <SlideUp key={tool.id} delay={0.05 + (idx % 6) * 0.03}>
              <div className="bg-white rounded-3xl border border-[#E5E0D6] p-6 shadow-subtle space-y-4 flex flex-col justify-between h-full hover:border-[#181924]/30 transition-all group">
                
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg"
                      style={{ 
                        background: `${catInfo.color}15`, 
                        color: catInfo.color,
                        border: `1px solid ${catInfo.color}30` 
                      }}
                    >
                      {catInfo.label}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#8E90A2]">
                      <Star className="w-3.5 h-3.5 text-[#E8B653] fill-[#E8B653]" />
                      <span>{tool.stars}</span>
                    </div>
                  </div>

                  {/* Title & Lang */}
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#181924] group-hover:text-[#6875E8] transition-colors">
                      {tool.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono font-medium text-[#8E90A2]">
                        {tool.primaryLanguage}
                      </span>
                      <span className="text-[#E5E0D6]">•</span>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#4FA89B]">
                        {tool.license}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#555768] leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>

                  {/* Best for box */}
                  <div className="p-3 bg-[#F7F4EE] rounded-xl border border-[#E5E0D6] text-xs">
                    <span className="font-mono font-bold text-[#181924] text-[9px] uppercase tracking-wider block mb-0.5">
                      Recommended For:
                    </span>
                    <span className="text-[#555768] leading-normal">{tool.bestFor}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tool.tags.map(t => (
                      <span key={t} className="text-[10px] font-mono text-[#8E90A2] bg-[#F7F4EE] px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-[#E5E0D6] space-y-2.5">
                  {/* CLI Command */}
                  <div className="flex items-center justify-between gap-2 p-2 bg-[#181924] rounded-xl text-white font-mono text-[11px]">
                    <span className="truncate pl-1">{tool.installCommand}</span>
                    <button
                      onClick={() => handleCopyInstall(tool.id, tool.installCommand)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white shrink-0"
                      title="Copy install command"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-[#4FA89B]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <a
                      href={tool.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#555768] hover:text-[#181924] transition-colors"
                    >
                      <span>REPO</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {onSelectToolForResearch && (
                      <button
                        onClick={() => onSelectToolForResearch(tool)}
                        className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#6875E8] hover:underline"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI ARCHITECT</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </SlideUp>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="bg-white rounded-3xl border border-[#E5E0D6] p-12 text-center space-y-3">
          <Filter className="w-8 h-8 text-[#8E90A2] mx-auto opacity-50" />
          <h3 className="font-serif text-xl font-bold text-[#181924]">No matching tools found</h3>
          <p className="text-xs text-[#555768] max-w-md mx-auto">
            Try adjusting your search keywords or select "All Ecosystem" to browse available open source tools.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="text-xs font-mono font-bold text-[#6875E8] underline"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};
