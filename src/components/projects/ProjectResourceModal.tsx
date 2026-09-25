import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  GitBranch, 
  Globe, 
  Play, 
  Layers, 
  FileText, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  Share2,
  Cpu,
  Database,
  ArrowRight,
  ShieldCheck,
  Code2
} from 'lucide-react';
import { Project } from '../../types/database';
import { OPEN_SOURCE_TOOLS } from '../../data/openSourceDirectory';
import { TypeBadge, CategoryBadge } from '../common/Badge';

interface ProjectResourceModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProject?: (id: string) => void;
  onNavigateToRoadmap?: (id: string) => void;
}

export const ProjectResourceModal: React.FC<ProjectResourceModalProps> = ({
  project,
  isOpen,
  onClose,
  onNavigateToProject,
  onNavigateToRoadmap
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'links' | 'tech_stack' | 'specs'>('links');

  if (!isOpen || !project) return null;

  // Find relevant open source tools matching project category or tags
  const matchedTools = OPEN_SOURCE_TOOLS.filter(tool => {
    const categoryLower = project.category.toLowerCase();
    const tagMatch = project.tags.some(t => tool.tags.some(tt => tt.toLowerCase().includes(t.toLowerCase())));
    const useCaseMatch = tool.useCaseMatch.some(u => 
      project.problem_description.toLowerCase().includes(u) || 
      project.solution_description.toLowerCase().includes(u)
    );
    return tagMatch || useCaseMatch || tool.category === 'fullstack_web' || tool.category === 'ai_ml';
  }).slice(0, 4);

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/projects/${project.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSpecs = () => {
    const content = `# Project Resource Dossier: ${project.title}
Version: v${project.current_version}
Category: ${project.category}
Type: ${project.project_type.toUpperCase()}
Readiness: ${project.readiness_score || 75}%

## Problem Statement
${project.problem_title}
${project.problem_description}

## Solution & Architecture
${project.solution_description}

## Value Proposition
${project.value_proposition}

## Target Audience
${project.target_audience}

## Key Differentiation & Moat
${project.differentiation}

## Available Artifacts & Resources
- Live Website: ${project.live_url || 'N/A (Concept Phase)'}
- Code Repository: ${project.github_url || 'https://github.com/innovexa-demos/' + project.title.toLowerCase().replace(/\\s+/g, '-')}
- Demo Preview: ${project.demo_url || `${window.location.origin}/projects/${project.id}`}

Generated via INNOVEXA Resource Hub on ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${project.title.toLowerCase().replace(/\\s+/g, '_')}_resources.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(24, 25, 36, 0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-[20px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: 'var(--color-surface, #FFFFFF)',
          border: '1px solid var(--color-border, #EAE4D9)',
          color: 'var(--color-ink, #181924)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-5 sm:p-6 flex items-start justify-between gap-4"
          style={{
            borderBottom: '1px solid var(--color-border-sub, #F0EAE1)',
            background: 'linear-gradient(135deg, rgba(230,111,130,0.05) 0%, rgba(104,117,232,0.05) 100%)'
          }}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <TypeBadge type={project.project_type} />
              <CategoryBadge category={project.category} />
              <span 
                className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(56,161,105,0.12)', color: '#2F855A' }}
              >
                {project.readiness_score || 75}% READINESS
              </span>
            </div>

            <h2 
              className="text-2xl sm:text-3xl font-display font-normal tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
            >
              {project.title}
            </h2>

            <p className="text-xs text-muted max-w-xl line-clamp-2" style={{ color: 'var(--color-muted)' }}>
              {project.problem_description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-muted transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div 
          className="px-6 flex items-center gap-4 text-xs font-mono border-b overflow-x-auto no-scrollbar"
          style={{ borderColor: 'var(--color-border-sub, #F0EAE1)', background: 'var(--color-bg-subtle, #FAF8F5)' }}
        >
          <button
            onClick={() => setActiveTab('links')}
            className={`py-3 font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'links'
                ? 'border-[#E66F82] text-[#E66F82]'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>AVAILABLE URLS & DEMOS</span>
          </button>

          <button
            onClick={() => setActiveTab('tech_stack')}
            className={`py-3 font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tech_stack'
                ? 'border-[#6875E8] text-[#6875E8]'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>OPEN-SOURCE STACK ({matchedTools.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`py-3 font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-[#2F855A] text-[#2F855A]'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>SPECS & BLUEPRINT</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: AVAILABLE LINKS & DEMOS */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                  LIVE DEPLOYMENTS & EXTERNAL ARTIFACTS
                </span>
                <p className="text-xs text-muted">
                  Access the live website, repository code, or interactive endpoints associated with this innovation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                
                {/* 1. Live Web Application */}
                <div 
                  className="p-4 rounded-[14px] flex flex-col justify-between space-y-3 transition-all"
                  style={{
                    background: project.live_url ? 'rgba(56,161,105,0.04)' : 'var(--color-bg-subtle, #FAF8F5)',
                    border: `1px solid ${project.live_url ? 'rgba(56,161,105,0.25)' : 'var(--color-border, #EAE4D9)'}`
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#2F855A]" />
                        <span className="font-mono text-xs font-bold text-ink">Live Website / Web App</span>
                      </div>
                      {project.live_url && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active Link" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted">
                      {project.live_url 
                        ? project.live_url 
                        : 'Currently in active development / validation phase.'}
                    </p>
                  </div>

                  {project.live_url ? (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-[10px] bg-[#2F855A] hover:bg-[#276749] text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <span>Open Live App</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        window.open(`https://google.com/search?q=${encodeURIComponent(project.title + ' ' + project.category)}`, '_blank');
                      }}
                      className="w-full py-2 px-3 rounded-[10px] bg-surface border border-border text-ink hover:border-coral font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Search Live Registry</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 2. GitHub Repository */}
                <div 
                  className="p-4 rounded-[14px] flex flex-col justify-between space-y-3 transition-all"
                  style={{
                    background: project.github_url ? 'rgba(32,32,42,0.03)' : 'var(--color-bg-subtle, #FAF8F5)',
                    border: `1px solid ${project.github_url ? 'rgba(32,32,42,0.2)' : 'var(--color-border, #EAE4D9)'}`
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-ink" />
                        <span className="font-mono text-xs font-bold text-ink">Source Repository</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted">MIT / Open</span>
                    </div>
                    <p className="text-[11px] text-muted">
                      {project.github_url 
                        ? project.github_url 
                        : `https://github.com/innovexa-demos/${project.title.toLowerCase().replace(/\\s+/g, '-')}`}
                    </p>
                  </div>

                  <a
                    href={project.github_url || `https://github.com/innovexa-demos/${project.title.toLowerCase().replace(/\\s+/g, '-')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-[10px] bg-[#181924] hover:bg-[#2B2C3C] text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>View GitHub Repo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 3. Interactive Prototype / Demo */}
                <div 
                  className="p-4 rounded-[14px] flex flex-col justify-between space-y-3 transition-all"
                  style={{
                    background: 'rgba(104,117,232,0.04)',
                    border: '1px solid rgba(104,117,232,0.2)'
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-[#6875E8]" />
                      <span className="font-mono text-xs font-bold text-ink">Interactive Sandbox & Demo</span>
                    </div>
                    <p className="text-[11px] text-muted">
                      Full functional preview environment & live walkthrough.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (project.demo_url) {
                        window.open(project.demo_url, '_blank');
                      } else if (onNavigateToProject) {
                        onClose();
                        onNavigateToProject(project.id);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-[10px] bg-[#6875E8] hover:bg-[#5764D0] text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>Launch Interactive Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 4. AI Research & Roadmap Blueprint */}
                <div 
                  className="p-4 rounded-[14px] flex flex-col justify-between space-y-3 transition-all"
                  style={{
                    background: 'rgba(230,111,130,0.04)',
                    border: '1px solid rgba(230,111,130,0.2)'
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#E66F82]" />
                      <span className="font-mono text-xs font-bold text-ink">AI Architecture & Roadmap</span>
                    </div>
                    <p className="text-[11px] text-muted">
                      Full 5-layer tech blueprint, database schemas, and AI execution pipeline.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateToRoadmap) {
                        onNavigateToRoadmap(project.id);
                      } else if (onNavigateToProject) {
                        onNavigateToProject(project.id);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-[10px] bg-[#E66F82] hover:bg-[#D4596D] text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>Open AI Architecture Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: TECH STACK & OPEN SOURCE REPOSITORIES */}
          {activeTab === 'tech_stack' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                  VETTED OPEN-SOURCE TOOLKITS & DEPENDENCIES
                </span>
                <p className="text-xs text-muted">
                  Recommended open-source frameworks and libraries matching this project's architecture:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {matchedTools.map(tool => (
                  <div
                    key={tool.id}
                    className="p-4 rounded-[14px] flex flex-col justify-between space-y-3"
                    style={{
                      background: 'var(--color-bg-subtle, #FAF8F5)',
                      border: '1px solid var(--color-border, #EAE4D9)'
                    }}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-ink">{tool.name}</span>
                        <span className="font-mono text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                          ★ {tool.stars}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={tool.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2.5 rounded-[8px] bg-white border border-border hover:border-ink font-mono text-[10px] font-semibold text-ink flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <GitBranch className="w-3 h-3" />
                        <span>GitHub</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>

                      {tool.websiteUrl && (
                        <a
                          href={tool.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-2.5 rounded-[8px] bg-[#6875E8] hover:bg-[#5764D0] font-mono text-[10px] font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Globe className="w-3 h-3" />
                          <span>Docs</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SPECS & BLUEPRINT */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                  STRUCTURED INNOVATION BLUEPRINT
                </span>
                <p className="text-xs text-muted">
                  Technical requirements, core problem statement, and differentiation mechanics.
                </p>
              </div>

              <div 
                className="p-4 rounded-[14px] space-y-3 font-mono text-xs leading-relaxed"
                style={{ background: 'var(--color-bg-subtle, #FAF8F5)', border: '1px solid var(--color-border, #EAE4D9)' }}
              >
                <div>
                  <span className="font-bold text-ink uppercase text-[10px] block text-muted">Core Problem:</span>
                  <p className="text-ink mt-0.5">{project.problem_title}</p>
                </div>

                <div>
                  <span className="font-bold text-ink uppercase text-[10px] block text-muted">Proposed Solution:</span>
                  <p className="text-ink mt-0.5">{project.solution_description}</p>
                </div>

                <div>
                  <span className="font-bold text-ink uppercase text-[10px] block text-muted">Unique Value Proposition:</span>
                  <p className="text-ink mt-0.5">{project.value_proposition}</p>
                </div>

                <div>
                  <span className="font-bold text-ink uppercase text-[10px] block text-muted">Competitive Moat:</span>
                  <p className="text-ink mt-0.5">{project.differentiation}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div 
          className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{
            borderTop: '1px solid var(--color-border-sub, #F0EAE1)',
            background: 'var(--color-surface, #FFFFFF)'
          }}
        >
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-[10px] bg-bg-subtle hover:bg-white border border-border font-mono text-xs font-semibold text-ink flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Copy Project Link'}</span>
            </button>

            <button
              onClick={handleDownloadSpecs}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-[10px] bg-bg-subtle hover:bg-white border border-border font-mono text-xs font-semibold text-ink flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Specs (.md)</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onNavigateToProject) onNavigateToProject(project.id);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] bg-[#181924] hover:bg-[#2B2C3C] text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <span>Open Full Project Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
