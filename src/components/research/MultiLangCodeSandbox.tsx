import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  FileCode, 
  Sparkles 
} from 'lucide-react';
import { CodeBundle, StarterSnippet } from '../../services/aiResearchService';
import { SlideUp } from '../common/MotionWrapper';
import { Badge } from '../common/Badge';

interface MultiLangCodeSandboxProps {
  codeBundle?: CodeBundle;
  projectTitle: string;
}

export const MultiLangCodeSandbox: React.FC<MultiLangCodeSandboxProps> = ({
  codeBundle,
  projectTitle
}) => {
  const [activeLang, setActiveLang] = useState<'python' | 'typescript' | 'sql' | 'docker' | 'bash'>('python');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  const fallbackSnippet: StarterSnippet = {
    filename: 'main.py',
    language: 'python',
    code: '# FastAPI Core\nfrom fastapi import FastAPI\napp = FastAPI()\n',
    title: 'FastAPI Backend',
    description: 'REST API boilerplate.',
    installCli: 'pip install fastapi uvicorn'
  };

  const currentSnippet: StarterSnippet = (codeBundle && (codeBundle as any)[activeLang]) || codeBundle?.python || fallbackSnippet;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentSnippet.code || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText(currentSnippet.installCli || '');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([currentSnippet.code || ''], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = currentSnippet.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const tabs = [
    { id: 'python', label: 'Python (FastAPI + Ollama)', ext: 'main.py' },
    { id: 'typescript', label: 'TypeScript (Next.js Client)', ext: 'useProjectData.ts' },
    { id: 'sql', label: 'PostgreSQL (pgvector Schema)', ext: 'schema.sql' },
    { id: 'docker', label: 'Docker Compose (Stack)', ext: 'docker-compose.yml' },
    { id: 'bash', label: 'Bash (1-Click Deploy)', ext: 'setup.sh' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#E5E0D6] overflow-hidden shadow-card space-y-0">
      
      {/* Sandbox Top Bar with Language Tabs */}
      <div className="p-6 border-b border-[#E5E0D6] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#6875E8]/10 text-[#6875E8] font-bold">
              MULTI-LANGUAGE BOILERPLATE
            </span>
            <span className="text-xs font-mono text-[#8E90A2]">
              {currentSnippet.filename}
            </span>
          </div>
          <h4 className="font-serif text-xl font-bold text-[#181924]">
            {currentSnippet.title || currentSnippet.filename}
          </h4>
          <p className="text-xs text-[#555768]">
            {currentSnippet.description || currentSnippet.explanation || 'Component starter boilerplate'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadFile}
            className="flex items-center gap-1.5 text-xs font-mono font-bold px-3.5 py-2 rounded-xl border border-[#E5E0D6] bg-[#F7F4EE] hover:bg-[#E5E0D6] text-[#181924] transition-all"
            title="Download source file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 text-xs font-mono font-bold px-4 py-2 rounded-xl bg-[#181924] text-white hover:bg-[#6875E8] transition-all shadow-subtle"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#4FA89B]" />
                <span>COPIED CODE</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY CODE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Language Switcher Bar */}
      <div className="flex items-center gap-1 overflow-x-auto px-6 py-2.5 bg-[#F7F4EE] border-b border-[#E5E0D6]">
        {tabs.map(tab => {
          const isActive = activeLang === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveLang(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-[#181924] shadow-sm border border-[#E5E0D6]'
                  : 'text-[#555768] hover:text-[#181924] hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CLI Command Bar */}
      <div className="px-6 py-3 bg-[#1F202B] border-b border-white/10 flex items-center justify-between gap-3 text-xs font-mono text-white">
        <div className="flex items-center gap-2 truncate">
          <Terminal className="w-3.5 h-3.5 text-[#4FA89B] shrink-0" />
          <span className="text-[#8E90A2] uppercase font-bold text-[10px]">Install Command:</span>
          <code className="text-[#4FA89B] font-bold truncate">{currentSnippet.installCli}</code>
        </div>
        <button 
          onClick={handleCopyCli}
          className="text-[#8FA6DD] hover:underline text-[11px] font-bold shrink-0 flex items-center gap-1"
        >
          {copiedCli ? <Check className="w-3 h-3 text-[#4FA89B]" /> : <Copy className="w-3 h-3" />}
          <span>{copiedCli ? 'Copied' : 'Copy CLI'}</span>
        </button>
      </div>

      {/* Code Viewer */}
      <div className="p-6 bg-[#181924] text-[#F7F4EE] overflow-x-auto">
        <pre className="font-mono text-xs leading-relaxed">
          <code>{currentSnippet.code}</code>
        </pre>
      </div>

    </div>
  );
};
