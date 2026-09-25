import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Plus, 
  ArrowRight, 
  FileText, 
  Code2, 
  ShieldCheck, 
  FolderKanban, 
  Search, 
  Layers, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  Zap,
  Bookmark,
  TrendingUp,
  FileCode,
  Printer,
  X,
  AlertCircle,
  Edit2,
  Trash2,
  RotateCcw,
  Tag,
  Filter,
  CheckSquare,
  Square,
  Wand2,
  Cpu,
  Database,
  Layout,
  Server,
  Terminal,
  Shield,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project } from '../../types/database';
import { 
  performProjectDeepResearch, 
  ResearchSolution, 
  RoadmapPhase,
  generateProjectRecommendations,
  CONCEPT_CATEGORIES,
  ConceptCategory,
  generateConceptBasedTasks,
  GeneratedConceptTaskOption,
  isTaskDuplicate
} from '../../services/aiResearchService';
import { SlideUp } from '../common/MotionWrapper';
import { Badge } from '../common/Badge';

export interface RoadmapTaskItem {
  id: string;
  title: string;
  completed: boolean;
  phaseId: number;
  priority: 'High' | 'Medium' | 'Low';
  conceptId?: string;
  conceptLabel?: string;
  badgeColor?: string;
  description?: string;
  suggestedByAI?: boolean;
}

interface RoadmapWorkflowStudioProps {
  initialProject?: Project;
  allProjects?: Project[];
  onNavigate?: (view: string, id?: string) => void;
  onVersionCreated?: (versionTitle: string, changelog: string) => void;
}

export const RoadmapWorkflowStudio: React.FC<RoadmapWorkflowStudioProps> = ({
  initialProject,
  allProjects = [],
  onNavigate,
  onVersionCreated
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProject?.id || allProjects[0]?.id || '');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customProjectTitle, setCustomProjectTitle] = useState<string>('');
  const [customProblem, setCustomProblem] = useState<string>('');

  const activeProject = allProjects.find(p => p.id === selectedProjectId) || initialProject || allProjects[0];

  const [researchSolution, setResearchSolution] = useState<ResearchSolution | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  // Active roadmap phases state (allows adding custom phases)
  const [customPhases, setCustomPhases] = useState<RoadmapPhase[]>([]);
  const [tasks, setTasks] = useState<RoadmapTaskItem[]>([]);
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);

  // Inline Quick-Add Task State
  const [inlineTaskInput, setInlineTaskInput] = useState<string>('');
  const [inlinePriority, setInlinePriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [inlineConceptId, setInlineConceptId] = useState<string>('frontend_ui');
  const [inlineFeedback, setInlineFeedback] = useState<{ type: 'error' | 'success' | 'warning'; message: string } | null>(null);

  // Concept Selector & Assignment Modal State
  const [isConceptModalOpen, setIsConceptModalOpen] = useState<boolean>(false);
  const [modalSelectedConceptId, setModalSelectedConceptId] = useState<string>('ai_intelligence');
  const [modalCustomConceptText, setModalCustomConceptText] = useState<string>('');
  const [modalTargetPhase, setModalTargetPhase] = useState<number>(0);
  const [modalPriority, setModalPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [generatedConceptTasks, setGeneratedConceptTasks] = useState<GeneratedConceptTaskOption[]>([]);
  const [selectedConceptTaskIds, setSelectedConceptTaskIds] = useState<string[]>([]);
  const [isGeneratingConceptTasks, setIsGeneratingConceptTasks] = useState<boolean>(false);

  // Manual Add Task Modal State
  const [isManualTaskModalOpen, setIsManualTaskModalOpen] = useState<boolean>(false);
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualDescription, setManualDescription] = useState<string>('');
  const [manualConceptId, setManualConceptId] = useState<string>('frontend_ui');
  const [manualPhaseId, setManualPhaseId] = useState<number>(0);
  const [manualPriority, setManualPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [manualModalError, setManualModalError] = useState<string | null>(null);

  // Add Custom Phase Modal State
  const [isAddPhaseModalOpen, setIsAddPhaseModalOpen] = useState<boolean>(false);
  const [newPhaseTitle, setNewPhaseTitle] = useState<string>('');
  const [newPhaseDuration, setNewPhaseDuration] = useState<string>('Days 10–14');
  const [newPhaseDeliverable, setNewPhaseDeliverable] = useState<string>('');

  // Edit Task Inline/Modal State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [editingPriority, setEditingPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterConceptId, setFilterConceptId] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Download & Copy state
  const [copiedMd, setCopiedMd] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper storage key
  const getStorageKey = (projId?: string, customTitle?: string) => {
    return `innovexa_roadmap_tasks_${projId || (customTitle ? customTitle.toLowerCase().replace(/\s+/g, '_') : 'default')}`;
  };

  // Load saved tasks from localStorage or initialize
  const loadSavedTasksOrInit = (res: ResearchSolution, projId?: string, customTitle?: string) => {
    const key = getStorageKey(projId, customTitle);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Deduplicate saved tasks on load
          const seen = new Set<string>();
          const deduped: RoadmapTaskItem[] = [];
          parsed.forEach((t: RoadmapTaskItem) => {
            const clean = t.title.trim().toLowerCase();
            if (!seen.has(clean)) {
              seen.add(clean);
              deduped.push(t);
            }
          });
          setTasks(deduped);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load saved roadmap tasks:', e);
    }

    // Default initialization from research solution with deduplication
    const seenTitles = new Set<string>();
    const generatedTasks: RoadmapTaskItem[] = [];
    res.roadmap.forEach((phase, pIdx) => {
      (phase.tasks || []).forEach((t: any, tIdx: number) => {
        const titleStr = typeof t === 'string' ? t : t?.title || '';
        const clean = titleStr.trim().toLowerCase();
        if (clean && !seenTitles.has(clean)) {
          seenTitles.add(clean);
          generatedTasks.push({
            id: `task-${pIdx}-${tIdx}-${Date.now()}`,
            title: titleStr,
            completed: pIdx === 0 && tIdx === 0,
            phaseId: pIdx,
            priority: tIdx === 0 ? 'High' : 'Medium',
            conceptId: pIdx === 0 ? 'database_vector' : pIdx === 1 ? 'ai_intelligence' : 'devops_deployment',
            conceptLabel: pIdx === 0 ? 'Database' : pIdx === 1 ? 'AI & LLM' : 'DevOps',
            badgeColor: pIdx === 0 ? '#5AAFA3' : pIdx === 1 ? '#8875E8' : '#4FA89B',
            suggestedByAI: true
          });
        }
      });
    });
    setTasks(generatedTasks);
  };

  // Save tasks to localStorage
  const saveTasksToStorage = (updatedTasks: RoadmapTaskItem[]) => {
    setTasks(updatedTasks);
    const key = getStorageKey(selectedProjectId, isCustomMode ? customProjectTitle : undefined);
    try {
      localStorage.setItem(key, JSON.stringify(updatedTasks));
    } catch (e) {}
  };

  // Initialize and run AI Complete Researcher on active project or custom prompt
  const runCompleteProjectResearcher = async (proj?: Partial<Project>, prompt?: string) => {
    setIsSynthesizing(true);
    try {
      const targetProj = proj || activeProject || { title: prompt || 'New Project Concept', category: 'Technology' };
      const res = await performProjectDeepResearch(targetProj, prompt);
      setResearchSolution(res);
      setCustomPhases(res.roadmap);
      loadSavedTasksOrInit(res, proj?.id || selectedProjectId, prompt || customProjectTitle);
    } finally {
      setIsSynthesizing(false);
    }
  };

  useEffect(() => {
    if (!isCustomMode && activeProject) {
      runCompleteProjectResearcher(activeProject);
    }
  }, [selectedProjectId, isCustomMode, activeProject?.id]);

  // Clean / Deduplicate Roadmap Tasks
  const handleCleanDuplicates = () => {
    const seen = new Set<string>();
    const uniqueTasks: RoadmapTaskItem[] = [];
    let dupCount = 0;

    tasks.forEach(t => {
      const clean = t.title.trim().toLowerCase();
      if (seen.has(clean)) {
        dupCount++;
      } else {
        seen.add(clean);
        uniqueTasks.push(t);
      }
    });

    if (dupCount > 0) {
      saveTasksToStorage(uniqueTasks);
      showToast(`Cleaned ${dupCount} duplicate task${dupCount > 1 ? 's' : ''} from roadmap!`);
    } else {
      showToast('All roadmap tasks are unique and clean. No duplicates found.');
    }
  };

  // Toggle Task Completion
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          confetti({ particleCount: 35, spread: 40, origin: { y: 0.7 } });
        }
        return { ...t, completed: nextState };
      }
      return t;
    });
    saveTasksToStorage(updated);
  };

  // Inline Quick-Add Task
  const handleInlineAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const title = inlineTaskInput.trim();
    if (!title) {
      setInlineFeedback({ type: 'error', message: 'Please enter a task title.' });
      setTimeout(() => setInlineFeedback(null), 3000);
      return;
    }

    // Check for duplicates
    if (isTaskDuplicate(tasks, title)) {
      setInlineFeedback({ 
        type: 'warning', 
        message: 'This task (or a very similar one) already exists in the roadmap.' 
      });
      setTimeout(() => setInlineFeedback(null), 4000);
      return;
    }

    const concept = CONCEPT_CATEGORIES.find(c => c.id === inlineConceptId) || CONCEPT_CATEGORIES[0];
    const newTask: RoadmapTaskItem = {
      id: `task-manual-${Date.now()}`,
      title,
      completed: false,
      phaseId: activePhaseIndex,
      priority: inlinePriority,
      conceptId: concept.id,
      conceptLabel: concept.shortLabel,
      badgeColor: concept.badgeColor,
      suggestedByAI: false
    };

    const updated = [...tasks, newTask];
    saveTasksToStorage(updated);
    setInlineTaskInput('');
    setInlineFeedback({ type: 'success', message: 'Task added successfully!' });
    setTimeout(() => setInlineFeedback(null), 2500);
    showToast(`Added "${title.slice(0, 35)}..." to Phase ${activePhaseIndex + 1}`);
  };

  // Manual Add Task Modal Submit
  const handleManualModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = manualTitle.trim();
    if (!title) {
      setManualModalError('Task title is required.');
      return;
    }

    if (isTaskDuplicate(tasks, title)) {
      setManualModalError('A task with this title already exists in the roadmap. Please use a distinct title.');
      return;
    }

    const concept = CONCEPT_CATEGORIES.find(c => c.id === manualConceptId) || CONCEPT_CATEGORIES[0];
    const newTask: RoadmapTaskItem = {
      id: `task-manual-modal-${Date.now()}`,
      title,
      description: manualDescription.trim() || undefined,
      completed: false,
      phaseId: manualPhaseId,
      priority: manualPriority,
      conceptId: concept.id,
      conceptLabel: concept.shortLabel,
      badgeColor: concept.badgeColor,
      suggestedByAI: false
    };

    saveTasksToStorage([...tasks, newTask]);
    setIsManualTaskModalOpen(false);
    setManualTitle('');
    setManualDescription('');
    setManualModalError(null);
    showToast(`Task assigned to Phase ${manualPhaseId + 1}!`);
    confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
  };

  // Open Concept Modal and Generate Concept Tasks
  const handleOpenConceptModal = (phaseIdx = activePhaseIndex) => {
    setModalTargetPhase(phaseIdx);
    setIsConceptModalOpen(true);
    triggerConceptTasksGeneration(modalSelectedConceptId, modalCustomConceptText, phaseIdx);
  };

  const triggerConceptTasksGeneration = (conceptId: string, customText = '', phaseIdx = modalTargetPhase) => {
    setIsGeneratingConceptTasks(true);
    try {
      const generated = generateConceptBasedTasks(
        activeProject,
        conceptId,
        customText,
        phaseIdx,
        isCustomMode ? customProjectTitle : activeProject?.title
      );
      setGeneratedConceptTasks(generated);
      // Select all non-duplicate tasks by default
      const nonDupIds = generated
        .filter(g => !isTaskDuplicate(tasks, g.title))
        .map(g => g.id);
      setSelectedConceptTaskIds(nonDupIds);
    } finally {
      setIsGeneratingConceptTasks(false);
    }
  };

  // Assign Selected Concept Tasks to Phase
  const handleAssignSelectedConceptTasks = () => {
    const selectedTasks = generatedConceptTasks.filter(g => selectedConceptTaskIds.includes(g.id));
    if (selectedTasks.length === 0) {
      showToast('Please select at least one concept task to assign.');
      return;
    }

    let addedCount = 0;
    let skippedCount = 0;
    const newTasksToAdd: RoadmapTaskItem[] = [];

    selectedTasks.forEach(st => {
      if (isTaskDuplicate(tasks, st.title)) {
        skippedCount++;
      } else {
        addedCount++;
        newTasksToAdd.push({
          id: `task-concept-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: st.title,
          description: st.description,
          completed: false,
          phaseId: modalTargetPhase,
          priority: (st.priority === 'high' || st.priority === 'High') ? 'High' : (st.priority === 'low' || st.priority === 'Low') ? 'Low' : 'Medium',
          conceptId: st.conceptId,
          conceptLabel: st.conceptLabel,
          badgeColor: st.badgeColor,
          suggestedByAI: true
        });
      }
    });

    if (newTasksToAdd.length > 0) {
      saveTasksToStorage([...tasks, ...newTasksToAdd]);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.65 } });
      showToast(`Assigned ${addedCount} concept task${addedCount > 1 ? 's' : ''} to Phase ${modalTargetPhase + 1}!${skippedCount > 0 ? ` (${skippedCount} duplicates skipped)` : ''}`);
    } else {
      showToast('All selected tasks are already present in the roadmap.');
    }

    setIsConceptModalOpen(false);
  };

  // Add AI Suggestion to Phase with duplicate protection
  const handleAddAiSuggestionToPhase = (suggestionTitle: string, phaseIdx: number, categoryLabel?: string) => {
    if (isTaskDuplicate(tasks, suggestionTitle)) {
      showToast(`"${suggestionTitle.slice(0, 30)}..." is already in the roadmap!`);
      return;
    }

    const newTask: RoadmapTaskItem = {
      id: `task-ai-sug-${Date.now()}`,
      title: suggestionTitle,
      completed: false,
      phaseId: phaseIdx,
      priority: 'High',
      conceptId: 'ai_intelligence',
      conceptLabel: categoryLabel || 'AI Suggestion',
      badgeColor: '#8875E8',
      suggestedByAI: true
    };
    saveTasksToStorage([...tasks, newTask]);
    confetti({ particleCount: 40, spread: 45, origin: { y: 0.7 } });
    showToast(`Added suggestion to Phase ${phaseIdx + 1}`);
  };

  // Delete Task
  const handleDeleteTask = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = tasks.filter(t => t.id !== taskId);
    saveTasksToStorage(updated);
    showToast('Task removed from roadmap.');
  };

  // Save Inline Edit
  const handleSaveEditTask = (taskId: string) => {
    if (!editingTitle.trim()) return;
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, title: editingTitle.trim(), priority: editingPriority };
      }
      return t;
    });
    saveTasksToStorage(updated);
    setEditingTaskId(null);
    setEditingTitle('');
    showToast('Task updated successfully.');
  };

  // Add Custom Phase
  const handleAddCustomPhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhaseTitle.trim()) return;

    const currentPhases = researchSolution?.roadmap || customPhases;
    const nextPhaseNumber = currentPhases.length + 1;
    const newPhase: RoadmapPhase = {
      id: `phase-${Date.now()}`,
      phaseNumber: nextPhaseNumber,
      phase: `Phase 0${nextPhaseNumber}`,
      title: newPhaseTitle.trim(),
      duration: newPhaseDuration.trim() || 'Days 10–14',
      goals: [],
      deliverables: [],
      tasks: [],
      deliverable: newPhaseDeliverable.trim() || 'Milestone deliverable verified and operational.',
      keyTools: []
    };

    setCustomPhases(prev => [...prev, newPhase]);
    if (researchSolution) {
      setResearchSolution({
        ...researchSolution,
        roadmap: [...researchSolution.roadmap, newPhase]
      });
    }

    setIsAddPhaseModalOpen(false);
    setNewPhaseTitle('');
    setNewPhaseDeliverable('');
    setActivePhaseIndex(currentPhases.length);
    showToast(`Created ${newPhase.phase}: ${newPhase.title}!`);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
  };

  // Generate full comprehensive Markdown dossier
  const generateMarkdownReport = (): string => {
    if (!researchSolution) return '';
    const title = researchSolution.queryTitle || researchSolution.title || 'Research Project';
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const phasesToExport = researchSolution.roadmap.length > 0 ? researchSolution.roadmap : customPhases;

    return `# COMPLETE AI RESEARCH DOSSIER & WORKFLOW ROADMAP
**Project:** ${title}  
**Category:** ${researchSolution.projectCategory || 'Technology'}  
**Generated On:** ${dateStr}  
**Engine:** INNOVEXA AI Research & Open Source Architecture Intelligence

---

## 1. Executive Summary & Feasibility Score
${researchSolution.executiveSummary}

- **Project Feasibility:** ${researchSolution.feasibilityScore || 85}%
- **Estimated Speed to MVP:** ${researchSolution.speedToMarketDays || 30} Days
- **Projected Hosting Costs:** ${researchSolution.estimatedCloudCost || '$25/mo'}

---

## 2. Recommended Open-Source Stack
${(researchSolution.openSourceStack || []).map((tool, idx) => `### ${idx + 1}. ${tool.name || tool.toolName} (${tool.primaryLanguage || 'Open Source'})
- **Role:** ${tool.category}
- **GitHub Stars:** ★ ${tool.stars || ''} | **License:** ${tool.license || 'MIT'}
- **Description:** ${tool.description || tool.reason}
- **Why It Fits:** ${tool.bestFor || 'Proven architectural solution'}
- **Install CLI:** \`${tool.installCommand || ''}\`
- **Repository:** ${tool.githubUrl || tool.officialUrl}`).join('\n\n')}

---

## 3. End-to-End Architecture Flow
${(researchSolution.architecture || []).map(layer => `### [${layer.layer}] ${layer.component || layer.name}
- **Technology:** ${layer.technology || (layer.components && layer.components.join(', '))}
- **System Responsibility:** ${layer.role || layer.description}`).join('\n\n')}

---

## 4. Multi-Phase Implementation Roadmap & Tasks
${phasesToExport.map((phase, pIdx) => {
  const phaseTasks = tasks.filter(t => t.phaseId === pIdx);
  return `### ${phase.phase || `Phase ${pIdx + 1}`}: ${phase.title} (Duration: ${phase.duration})
**Milestone Deliverable:** ${phase.deliverable || (phase.deliverables && phase.deliverables.join(', '))}

**Workflow Checklist (${phaseTasks.filter(t => t.completed).length}/${phaseTasks.length} Completed):**
${phaseTasks.map(t => `- [${t.completed ? 'x' : ' '}] ${t.title} [${t.conceptLabel || 'Core'}] (${t.priority} Priority)`).join('\n')}
`;
}).join('\n')}

---

## 5. Starter Code Boilerplate

### Python (FastAPI)
\`\`\`python
${researchSolution.codeBundle?.python?.code || '# FastAPI Starter\nfrom fastapi import FastAPI\napp = FastAPI()'}
\`\`\`

### TypeScript (Client Hook)
\`\`\`typescript
${researchSolution.codeBundle?.typescript?.code || '// Client Hook\nexport function useApi() {}'}
\`\`\`

### PostgreSQL pgvector Schema
\`\`\`sql
${researchSolution.codeBundle?.sql?.code || '-- Schema\nCREATE TABLE projects (id UUID PRIMARY KEY);'}
\`\`\`

### Docker Compose Multi-Container Stack
\`\`\`yaml
${researchSolution.codeBundle?.docker?.code || '# Compose\nversion: "3.8"'}
\`\`\`

---

## 6. Strategic Recommendations & Competitive Moats
${(researchSolution.suggestions || []).map(s => `### [${s.categoryLabel}] ${s.title}
- **Impact:** ${s.impact} | **Effort:** ${s.effort}
- **Description:** ${s.description}
- **Action Step:** ${s.actionableStep}`).join('\n\n')}

---

## 7. Proactive Pitfalls & Engineering Mitigations
${(researchSolution.pitfallsAndMitigations || []).map((p: any) => `- **[${String(p.severity || 'Notice').toUpperCase()}] ${p.risk || p.pitfall}**\n  *Mitigation:* ${p.mitigation}`).join('\n\n')}

---
*Report exported from INNOVEXA — The Open Innovation & Validation Network*
`;
  };

  // Download Markdown file
  const handleDownloadMarkdown = () => {
    setDownloadingFormat('md');
    const md = generateMarkdownReport();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(researchSolution?.queryTitle || 'project').toLowerCase().replace(/\s+/g, '-')}-research-dossier.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingFormat(null), 1500);
  };

  // Download JSON Blueprint file
  const handleDownloadJSON = () => {
    if (!researchSolution) return;
    setDownloadingFormat('json');
    const phasesToExport = researchSolution.roadmap.length > 0 ? researchSolution.roadmap : customPhases;
    const exportData = {
      project: researchSolution.queryTitle,
      category: researchSolution.projectCategory,
      feasibility: researchSolution.feasibilityScore,
      summary: researchSolution.executiveSummary,
      architecture: researchSolution.architecture,
      openSourceStack: researchSolution.openSourceStack,
      roadmap: phasesToExport.map((phase, idx) => ({
        ...phase,
        tasks: tasks.filter(t => t.phaseId === idx)
      })),
      codeBundle: researchSolution.codeBundle,
      suggestions: researchSolution.suggestions,
      pitfalls: researchSolution.pitfallsAndMitigations,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const projName = researchSolution.queryTitle || researchSolution.title || 'research';
    link.download = `${projName.toLowerCase().replace(/\s+/g, '-')}-blueprint.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingFormat(null), 1500);
  };

  // Download HTML Report
  const handleDownloadHTML = () => {
    if (!researchSolution) return;
    setDownloadingFormat('html');
    const title = researchSolution.queryTitle || researchSolution.title || 'Research Project';
    const phasesToExport = researchSolution.roadmap.length > 0 ? researchSolution.roadmap : customPhases;
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} — AI Research Dossier & Roadmap</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #181924; background: #FAF8F5; padding: 40px; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 32px; border-bottom: 2px solid #181924; padding-bottom: 12px; margin-bottom: 8px; }
    h2 { font-size: 22px; color: #181924; margin-top: 32px; border-bottom: 1px solid #E5E0D6; padding-bottom: 6px; }
    h3 { font-size: 16px; margin-top: 20px; color: #4B4D63; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; background: #6875E8; color: #fff; }
    .card { background: #fff; border: 1px solid #E5E0D6; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
    pre { background: #181924; color: #F7F4EE; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; font-family: monospace; }
    ul { padding-left: 20px; }
    li { margin-bottom: 6px; }
    .header-meta { font-size: 13px; color: #73758C; margin-bottom: 24px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="badge">INNOVEXA AI RESEARCH DOSSIER</div>
  <h1>${title}</h1>
  <div class="header-meta">Category: ${researchSolution.projectCategory || 'Technology'} • Feasibility Score: ${researchSolution.feasibilityScore || 85}% • Generated: ${new Date().toLocaleDateString()}</div>
  
  <h2>Executive Summary</h2>
  <div class="card">${researchSolution.executiveSummary}</div>

  <h2>Implementation Roadmap & Workflow Checklist</h2>
  ${phasesToExport.map((phase, pIdx) => `
    <div class="card">
      <h3><strong>${phase.phase || `Phase ${pIdx + 1}`}: ${phase.title}</strong> (${phase.duration})</h3>
      <p><em>Deliverable:</em> ${phase.deliverable || (phase.deliverables && phase.deliverables.join(', '))}</p>
      <ul>
        ${tasks.filter(t => t.phaseId === pIdx).map(t => `<li>[${t.completed ? '✓' : ' '}] ${t.title} <strong>(${t.conceptLabel || 'Core'})</strong></li>`).join('')}
      </ul>
    </div>
  `).join('')}

  <h2>Open-Source Tech Stack</h2>
  <div class="card">
    <ul>
      ${(researchSolution.openSourceStack || []).map(tool => `<li><strong>${tool.name || tool.toolName}</strong> (${tool.category}) - ${tool.description || tool.reason} <code>${tool.installCommand || ''}</code></li>`).join('')}
    </ul>
  </div>

  <h2>System Architecture</h2>
  ${(researchSolution.architecture || []).map(layer => `
    <div class="card">
      <strong>${layer.layer}: ${layer.component || layer.name}</strong><br>
      <code>Technology: ${layer.technology || (layer.components && layer.components.join(', '))}</code><br>
      <span>${layer.role || layer.description}</span>
    </div>
  `).join('')}

  <h2>Starter Code</h2>
  <pre><code>${researchSolution.codeBundle?.python?.code || '// Starter Code'}</code></pre>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-report.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingFormat(null), 1500);
  };

  const handleCopyReport = () => {
    const md = generateMarkdownReport();
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
    showToast('Dossier copied to clipboard!');
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const phasesList = researchSolution?.roadmap || customPhases;

  // Filtered tasks for the active phase
  const activePhaseTasks = tasks.filter(t => {
    if (t.phaseId !== activePhaseIndex) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchConcept = t.conceptLabel?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchConcept) return false;
    }
    if (filterConceptId !== 'all' && t.conceptId !== filterConceptId) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-16 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181924] text-white px-5 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-[#4FA89B] shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Card with Complete Project Researcher Trigger */}
      <SlideUp delay={0.05}>
        <div className="bg-white rounded-3xl border border-[#E5E0D6] p-7 shadow-card space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E5E0D6]">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#6875E8]/10 text-[#6875E8] border border-[#6875E8]/20">
                  <Sparkles className="w-3 h-3" />
                  COMPLETE PROJECT RESEARCHER & ROADMAP
                </span>
                <Badge variant="purple">EXPORT & DOWNLOAD READY</Badge>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181924]">
                {researchSolution ? researchSolution.queryTitle : 'Project Workflow & Research Studio'}
              </h1>
              <p className="text-xs sm:text-sm text-[#555768] leading-relaxed">
                Step-by-step phased execution engine, concept-guided task assignment, and full exportable AI research dossiers for your innovation.
              </p>
            </div>

            {/* Overall Progress Dial */}
            <div className="flex items-center gap-6 bg-[#F7F4EE] p-5 rounded-3xl border border-[#E5E0D6] shrink-0">
              <div className="text-center">
                <div className="font-serif text-4xl sm:text-5xl font-bold text-[#4FA89B]">
                  {progressPercent}%
                </div>
                <div className="text-[9px] font-mono font-bold uppercase text-[#8E90A2] mt-0.5">
                  ROADMAP PROGRESS
                </div>
              </div>
              <div className="border-l border-[#E5E0D6] pl-5 space-y-1 text-xs font-mono text-[#555768]">
                <div>Completed: <strong className="text-[#181924]">{completedCount} of {tasks.length} tasks</strong></div>
                <div>Milestones: <strong className="text-[#6875E8]">{phasesList.length} Phases</strong></div>
                <div>Status: <strong className="text-[#4FA89B]">{progressPercent === 100 ? 'Launch Ready' : 'In Execution'}</strong></div>
              </div>
            </div>
          </div>

          {/* Project Selector & Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsCustomMode(false)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  !isCustomMode 
                    ? 'bg-[#6875E8] text-white shadow-subtle' 
                    : 'bg-[#F7F4EE] text-[#555768] hover:bg-[#E5E0D6]'
                }`}
              >
                SELECT WORKSPACE PROJECT
              </button>
              <button
                onClick={() => setIsCustomMode(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  isCustomMode 
                    ? 'bg-[#6875E8] text-white shadow-subtle' 
                    : 'bg-[#F7F4EE] text-[#555768] hover:bg-[#E5E0D6]'
                }`}
              >
                RESEARCH CUSTOM PROJECT
              </button>
            </div>

            {/* Export & Download Buttons Group */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCleanDuplicates}
                className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-2 rounded-xl bg-[#F7F4EE] hover:bg-[#E5E0D6] border border-[#E5E0D6] text-[#555768] hover:text-[#181924] transition-all"
                title="Deduplicate roadmap tasks"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#5AAFA3]" />
                <span>CLEAN DUPLICATES</span>
              </button>

              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-2 rounded-xl bg-[#F7F4EE] hover:bg-[#E5E0D6] border border-[#E5E0D6] text-[#181924] transition-all"
                title="Copy markdown report"
              >
                {copiedMd ? <Check className="w-3.5 h-3.5 text-[#4FA89B]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMd ? 'COPIED' : 'COPY DOSSIER'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                disabled={!researchSolution}
                className="flex items-center gap-1.5 text-xs font-mono font-bold px-3.5 py-2 rounded-xl bg-[#181924] hover:bg-[#6875E8] text-white transition-all shadow-subtle disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingFormat === 'md' ? 'DOWNLOADING...' : 'DOWNLOAD .MD'}</span>
              </button>

              <button
                onClick={handleDownloadJSON}
                disabled={!researchSolution}
                className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-2 rounded-xl bg-[#F7F4EE] hover:bg-[#E5E0D6] border border-[#E5E0D6] text-[#555768] transition-all disabled:opacity-50"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>.JSON</span>
              </button>

              <button
                onClick={handleDownloadHTML}
                disabled={!researchSolution}
                className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-2 rounded-xl bg-[#F7F4EE] hover:bg-[#E5E0D6] border border-[#E5E0D6] text-[#555768] transition-all disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>.HTML</span>
              </button>
            </div>
          </div>

          {/* Project Dropdown / Custom Inputs */}
          {!isCustomMode ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <FolderKanban className="w-4 h-4 text-[#8E90A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-[#F7F4EE] pl-10 pr-4 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono font-bold text-[#181924] outline-none cursor-pointer focus:border-[#6875E8]"
                >
                  {allProjects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.category}) — v{p.current_version}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => runCompleteProjectResearcher(activeProject)}
                disabled={isSynthesizing}
                className="flex items-center gap-2 bg-[#6875E8] text-white px-5 py-2.5 rounded-2xl text-xs font-mono font-bold hover:bg-[#5563D6] transition-all disabled:opacity-50 shrink-0 shadow-subtle"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSynthesizing ? 'RESEARCHING...' : 'RE-RUN RESEARCHER'}</span>
              </button>
            </div>
          ) : (
            <form 
              onSubmit={(e) => { e.preventDefault(); runCompleteProjectResearcher(undefined, customProjectTitle); }}
              className="space-y-3 pt-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={customProjectTitle}
                  onChange={(e) => setCustomProjectTitle(e.target.value)}
                  placeholder="Enter Project Title (e.g. 'EduSynth AI Academic Planner')..."
                  className="w-full bg-[#F7F4EE] px-4 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono text-[#181924] outline-none focus:border-[#6875E8]"
                />
                <input
                  type="text"
                  value={customProblem}
                  onChange={(e) => setCustomProblem(e.target.value)}
                  placeholder="Core Problem Statement (e.g. 'Students miss assignment deadlines')..."
                  className="w-full bg-[#F7F4EE] px-4 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono text-[#181924] outline-none focus:border-[#6875E8]"
                />
              </div>
              <button
                type="submit"
                disabled={isSynthesizing || !customProjectTitle.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#181924] text-white px-6 py-2.5 rounded-2xl text-xs font-mono font-bold hover:bg-[#6875E8] transition-all disabled:opacity-50 shadow-subtle"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSynthesizing ? 'SYNTHESIZING RESEARCH...' : 'GENERATE COMPLETE RESEARCH DOSSIER'}</span>
              </button>
            </form>
          )}

        </div>
      </SlideUp>

      {/* Main Roadmap Workflow Layout */}
      {researchSolution && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Phase Workflow & Checklist */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Action Bar: Assign Concept Tasks & Add Task Manually Buttons */}
            <div className="bg-gradient-to-r from-[#181924] to-[#252838] p-5 rounded-3xl text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#8875E8]/30 text-[#A594F9] text-[10px] font-mono font-bold">
                    SMART TASK ASSIGNMENT
                  </span>
                  <span className="text-[11px] font-mono text-white/60">
                    Phase {activePhaseIndex + 1} Active
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-white">
                  Assign Tasks with Concept Selector
                </h3>
                <p className="text-xs text-white/70">
                  Select your concept focus (AI, Database, UI, Security, DevOps) or add custom tasks without duplicates.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenConceptModal(activePhaseIndex)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#6875E8] hover:bg-[#5563D6] text-white text-xs font-mono font-bold transition-all shadow-subtle"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>ASSIGN AI CONCEPT TASKS</span>
                </button>

                <button
                  onClick={() => {
                    setManualPhaseId(activePhaseIndex);
                    setIsManualTaskModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-all border border-white/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD MANUALLY</span>
                </button>
              </div>
            </div>

            {/* Phase Selector Tabs & Add Milestone Button */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#8E90A2] uppercase tracking-wider">
                  Roadmap Milestone Phases ({phasesList.length}):
                </span>
                <button
                  onClick={() => setIsAddPhaseModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#6875E8] hover:text-[#5563D6] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ ADD MILESTONE PHASE</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {phasesList.map((phase, pIdx) => {
                  const phaseTasks = tasks.filter(t => t.phaseId === pIdx);
                  const phaseCompleted = phaseTasks.filter(t => t.completed).length;
                  const isSelected = activePhaseIndex === pIdx;

                  return (
                    <button
                      key={pIdx}
                      onClick={() => setActivePhaseIndex(pIdx)}
                      className={`p-4 rounded-3xl border text-left transition-all space-y-2 ${
                        isSelected
                          ? 'bg-[#181924] text-white border-[#181924] shadow-card ring-2 ring-[#6875E8]/40'
                          : 'bg-white text-[#181924] border-[#E5E0D6] hover:border-[#6875E8]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-bold uppercase ${isSelected ? 'text-[#8FA6DD]' : 'text-[#8E90A2]'}`}>
                          {phase.phase}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-white/10 text-white' : 'bg-[#F7F4EE] text-[#555768]'
                        }`}>
                          {phase.duration}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-base line-clamp-1">
                        {phase.title}
                      </h4>

                      {/* Mini Progress */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10px] font-mono opacity-80">
                          <span>{phaseCompleted}/{phaseTasks.length} Tasks</span>
                          <span>{phaseTasks.length > 0 ? Math.round((phaseCompleted / phaseTasks.length) * 100) : 0}%</span>
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#4FA89B] rounded-full transition-all"
                            style={{ width: `${phaseTasks.length > 0 ? (phaseCompleted / phaseTasks.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Phase Task Board */}
            {phasesList[activePhaseIndex] && (
              <SlideUp key={activePhaseIndex} delay={0.05}>
                <div className="bg-white rounded-3xl border border-[#E5E0D6] p-7 shadow-card space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D6] pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#6875E8]/10 text-[#6875E8]">
                          ACTIVE WORKFLOW MILESTONE
                        </span>
                        <span className="text-xs font-mono text-[#8E90A2]">
                          Est: {phasesList[activePhaseIndex].duration}
                        </span>
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-[#181924]">
                        {phasesList[activePhaseIndex].title}
                      </h3>
                    </div>

                    <div className="p-3 bg-[#F7F4EE] rounded-2xl border border-[#E5E0D6] text-xs font-mono">
                      <span className="text-[#8E90A2] text-[10px] uppercase block">Target Deliverable:</span>
                      <strong className="text-[#181924]">{phasesList[activePhaseIndex].deliverable}</strong>
                    </div>
                  </div>

                  {/* Task Search & Filter Bar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#F7F4EE] p-3 rounded-2xl border border-[#E5E0D6]">
                    <div className="relative flex-1 w-full">
                      <Search className="w-3.5 h-3.5 text-[#8E90A2] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks in this phase..."
                        className="w-full bg-white pl-9 pr-3 py-1.5 rounded-xl border border-[#E5E0D6] text-xs font-mono outline-none text-[#181924]"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={filterConceptId}
                        onChange={(e) => setFilterConceptId(e.target.value)}
                        className="bg-white px-3 py-1.5 rounded-xl border border-[#E5E0D6] text-xs font-mono text-[#555768] outline-none"
                      >
                        <option value="all">All Concepts</option>
                        {CONCEPT_CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>{c.shortLabel}</option>
                        ))}
                      </select>

                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="bg-white px-3 py-1.5 rounded-xl border border-[#E5E0D6] text-xs font-mono text-[#555768] outline-none"
                      >
                        <option value="all">All Priorities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  {/* Task Items Checklist */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8E90A2] block">
                        Phase Checklist ({activePhaseTasks.length} of {tasks.filter(t => t.phaseId === activePhaseIndex).length}):
                      </span>

                      <button
                        onClick={() => handleOpenConceptModal(activePhaseIndex)}
                        className="text-xs font-mono text-[#6875E8] hover:underline flex items-center gap-1 font-bold"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>+ Add AI Concept Tasks</span>
                      </button>
                    </div>

                    {activePhaseTasks.length === 0 ? (
                      <div className="p-8 text-center bg-[#F7F4EE] rounded-2xl border border-[#E5E0D6] space-y-3">
                        <CheckSquare className="w-8 h-8 text-[#8E90A2] mx-auto opacity-50" />
                        <h4 className="font-serif font-bold text-base text-[#181924]">No Tasks in this Filter View</h4>
                        <p className="text-xs text-[#555768] max-w-sm mx-auto">
                          Assign tasks tailored to your concept or add a manual task using the buttons below.
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <button
                            onClick={() => handleOpenConceptModal(activePhaseIndex)}
                            className="px-4 py-2 rounded-xl bg-[#6875E8] text-white text-xs font-mono font-bold"
                          >
                            Assign Concept Tasks
                          </button>
                        </div>
                      </div>
                    ) : (
                      activePhaseTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            task.completed
                              ? 'bg-[#F7F4EE]/60 border-[#E5E0D6] text-[#8E90A2]'
                              : 'bg-[#FCFAF6] hover:bg-white border-[#E5E0D6] text-[#181924] shadow-subtle'
                          }`}
                        >
                          {editingTaskId === task.id ? (
                            // Inline Edit Form
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="w-full bg-white px-3 py-2 rounded-xl border border-[#6875E8] text-xs font-mono text-[#181924] outline-none"
                              />
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {(['High', 'Medium', 'Low'] as const).map(p => (
                                    <button
                                      key={p}
                                      type="button"
                                      onClick={() => setEditingPriority(p)}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${
                                        editingPriority === p
                                          ? p === 'High' ? 'bg-[#E96B7A] text-white' : p === 'Medium' ? 'bg-[#E8B653] text-white' : 'bg-[#4FA89B] text-white'
                                          : 'bg-[#F7F4EE] text-[#555768]'
                                      }`}
                                    >
                                      {p}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSaveEditTask(task.id)}
                                    className="px-3 py-1 rounded-xl bg-[#181924] text-white text-xs font-mono font-bold"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingTaskId(null)}
                                    className="px-3 py-1 rounded-xl bg-[#F7F4EE] text-[#555768] text-xs font-mono"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Normal Task Display
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div 
                                onClick={() => handleToggleTask(task.id)}
                                className="flex items-start gap-3 cursor-pointer flex-1"
                              >
                                <div className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
                                  task.completed ? 'bg-[#4FA89B] border-[#4FA89B] text-white' : 'border-[#8E90A2] bg-white'
                                }`}>
                                  {task.completed && <Check className="w-3.5 h-3.5" />}
                                </div>
                                <div className="space-y-1">
                                  <span className={`text-xs font-medium leading-relaxed block ${task.completed ? 'line-through opacity-70' : ''}`}>
                                    {task.title}
                                  </span>
                                  {task.description && (
                                    <p className="text-[11px] text-[#8E90A2] leading-normal line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pl-8 sm:pl-0">
                                {task.conceptLabel && (
                                  <span 
                                    className="text-[9px] font-mono px-2 py-0.5 rounded-md font-bold text-white shadow-subtle"
                                    style={{ backgroundColor: task.badgeColor || '#6875E8' }}
                                  >
                                    {task.conceptLabel}
                                  </span>
                                )}

                                {task.suggestedByAI && (
                                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-[#8875E8]/10 text-[#8875E8] border border-[#8875E8]/20 font-bold">
                                    AI
                                  </span>
                                )}

                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold ${
                                  task.priority === 'High' ? 'bg-[#E96B7A]/10 text-[#E96B7A]' : task.priority === 'Medium' ? 'bg-[#E8B653]/10 text-[#E8B653]' : 'bg-[#4FA89B]/10 text-[#4FA89B]'
                                }`}>
                                  {task.priority}
                                </span>

                                {/* Edit & Delete Actions */}
                                <div className="flex items-center gap-1 border-l border-[#E5E0D6] pl-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingTaskId(task.id);
                                      setEditingTitle(task.title);
                                      setEditingPriority(task.priority);
                                    }}
                                    className="p-1 text-[#8E90A2] hover:text-[#181924] rounded-lg hover:bg-white"
                                    title="Edit task"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteTask(task.id, e)}
                                    className="p-1 text-[#8E90A2] hover:text-[#E96B7A] rounded-lg hover:bg-white"
                                    title="Delete task"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Custom Task Input Bar */}
                  <form onSubmit={handleInlineAddTask} className="pt-3 border-t border-[#E5E0D6] space-y-2">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        value={inlineTaskInput}
                        onChange={(e) => setInlineTaskInput(e.target.value)}
                        placeholder="Add custom task to this milestone checklist..."
                        className="flex-1 w-full bg-[#F7F4EE] px-4 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono text-[#181924] outline-none focus:border-[#6875E8]"
                      />

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Concept Selector */}
                        <select
                          value={inlineConceptId}
                          onChange={(e) => setInlineConceptId(e.target.value)}
                          className="bg-[#F7F4EE] px-3 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono text-[#555768] outline-none cursor-pointer"
                        >
                          {CONCEPT_CATEGORIES.map(c => (
                            <option key={c.id} value={c.id}>{c.shortLabel}</option>
                          ))}
                        </select>

                        {/* Priority Selector */}
                        <select
                          value={inlinePriority}
                          onChange={(e) => setInlinePriority(e.target.value as any)}
                          className="bg-[#F7F4EE] px-3 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono text-[#555768] outline-none cursor-pointer"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>

                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#181924] text-white text-xs font-mono font-bold hover:bg-[#6875E8] transition-colors shrink-0 shadow-subtle"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>ADD TASK</span>
                        </button>
                      </div>
                    </div>

                    {inlineFeedback && (
                      <div className={`p-2 rounded-xl text-xs font-mono flex items-center gap-2 ${
                        inlineFeedback.type === 'error' ? 'bg-[#E96B7A]/10 text-[#E96B7A]' : inlineFeedback.type === 'warning' ? 'bg-[#E8B653]/10 text-[#E8B653]' : 'bg-[#4FA89B]/10 text-[#4FA89B]'
                      }`}>
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{inlineFeedback.message}</span>
                      </div>
                    )}
                  </form>

                </div>
              </SlideUp>
            )}

          </div>

          {/* Right Column: AI Workflow Suggestions & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Concept Quick-Launch Card */}
            <div className="bg-white rounded-3xl border border-[#E5E0D6] p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E0D6] pb-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-[#6875E8]" />
                  <h4 className="font-serif font-bold text-lg text-[#181924]">
                    Concept Categories
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-[#8E90A2]">8 PILLARS</span>
              </div>

              <p className="text-xs text-[#555768]">
                Click any concept to review and assign tailored tasks to Phase {activePhaseIndex + 1}:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {CONCEPT_CATEGORIES.map(concept => (
                  <button
                    key={concept.id}
                    onClick={() => {
                      setModalSelectedConceptId(concept.id);
                      setModalTargetPhase(activePhaseIndex);
                      setIsConceptModalOpen(true);
                      triggerConceptTasksGeneration(concept.id, '', activePhaseIndex);
                    }}
                    className="p-3 rounded-2xl bg-[#F7F4EE] hover:bg-[#181924] hover:text-white border border-[#E5E0D6] text-left transition-all group space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: concept.badgeColor }}
                      />
                      <span className="text-[9px] font-mono opacity-60 group-hover:text-white">
                        ASSIGN →
                      </span>
                    </div>
                    <div className="font-serif font-bold text-xs line-clamp-1 group-hover:text-white">
                      {concept.shortLabel}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Workflow Suggestions Card */}
            <div className="bg-white rounded-3xl border border-[#E5E0D6] p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E0D6] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6875E8]" />
                  <h4 className="font-serif font-bold text-lg text-[#181924]">
                    AI Workflow Suggestions
                  </h4>
                </div>
                <Badge variant="purple">LIVE</Badge>
              </div>

              <div className="space-y-3">
                {researchSolution.suggestions.slice(0, 3).map((sug) => {
                  const alreadyExists = isTaskDuplicate(tasks, sug.actionableStep);
                  return (
                    <div key={sug.id} className="p-4 bg-[#F7F4EE] rounded-2xl border border-[#E5E0D6] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold uppercase text-[#6875E8]">
                          {sug.categoryLabel}
                        </span>
                        <span className="text-[9px] font-mono text-[#4FA89B] font-bold">
                          {sug.impact}
                        </span>
                      </div>

                      <h5 className="font-serif font-bold text-sm text-[#181924]">
                        {sug.title}
                      </h5>

                      <p className="text-[11px] text-[#555768] line-clamp-2">
                        {sug.actionableStep}
                      </p>

                      <button
                        onClick={() => handleAddAiSuggestionToPhase(sug.actionableStep, activePhaseIndex, sug.categoryLabel)}
                        disabled={alreadyExists}
                        className={`w-full py-1.5 rounded-xl border text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1 mt-1 ${
                          alreadyExists
                            ? 'bg-white/60 text-[#8E90A2] border-[#E5E0D6] cursor-not-allowed'
                            : 'bg-white hover:bg-[#181924] hover:text-white border-[#E5E0D6] text-[#181924]'
                        }`}
                      >
                        {alreadyExists ? <Check className="w-3 h-3 text-[#4FA89B]" /> : <Plus className="w-3 h-3" />}
                        <span>{alreadyExists ? 'ALREADY IN ROADMAP' : `ADD TO PHASE ${activePhaseIndex + 1}`}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Export Summary Card */}
            <div className="p-6 bg-[#181924] text-white rounded-3xl shadow-card space-y-4">
              <div className="flex items-center gap-2 text-[#4FA89B] font-mono font-bold text-xs uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>COMPLETE RESEARCH DOSSIER</span>
              </div>

              <h4 className="font-serif text-xl font-bold">
                Export Ready Package
              </h4>

              <p className="text-xs text-[#8E90A2] leading-relaxed">
                Includes Problem Validation, Open-Source Stack, Multi-Phase Roadmap ({tasks.length} Checklist Items), Code Snippets (Python/TS/SQL/Docker), and Risk Mitigations.
              </p>

              <button
                onClick={handleDownloadMarkdown}
                className="w-full py-3 rounded-2xl bg-[#4FA89B] hover:bg-[#3D8F83] text-white font-mono font-bold text-xs transition-all shadow-subtle flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD RESEARCH DOSSIER (.MD)</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: CONCEPT SELECTOR & SMART TASK ASSIGNMENT MODAL
          ───────────────────────────────────────────────────────────── */}
      {isConceptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E5E0D6] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-[#E5E0D6] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6875E8]/10 text-[#6875E8]">
                    STEP 1: SELECT CONCEPT & PHASE
                  </span>
                  <span className="text-xs font-mono text-[#8E90A2]">
                    Tailored AI Generator
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#181924]">
                  Which Concept Do You Need to Include?
                </h3>
              </div>
              <button
                onClick={() => setIsConceptModalOpen(false)}
                className="p-2 text-[#8E90A2] hover:text-[#181924] rounded-full hover:bg-[#F7F4EE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Concept Categories Grid */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-[#181924] block">
                Choose Concept Type:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CONCEPT_CATEGORIES.map((c) => {
                  const isSelected = modalSelectedConceptId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setModalSelectedConceptId(c.id);
                        triggerConceptTasksGeneration(c.id, modalCustomConceptText, modalTargetPhase);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all space-y-1 ${
                        isSelected
                          ? 'bg-[#181924] text-white border-[#181924] shadow-subtle ring-2 ring-[#6875E8]'
                          : 'bg-[#F7F4EE] hover:bg-white text-[#181924] border-[#E5E0D6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: c.badgeColor }} 
                        />
                        {isSelected && <Check className="w-3 h-3 text-[#4FA89B]" />}
                      </div>
                      <div className="font-serif font-bold text-xs line-clamp-1">
                        {c.shortLabel}
                      </div>
                      <div className={`text-[10px] line-clamp-2 leading-tight ${isSelected ? 'text-white/70' : 'text-[#8E90A2]'}`}>
                        {c.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Concept Input if Selected */}
            {modalSelectedConceptId === 'custom_concept' && (
              <div className="space-y-1.5 p-3.5 bg-[#F7F4EE] rounded-2xl border border-[#E5E0D6]">
                <label className="text-xs font-mono font-bold text-[#181924] block">
                  Specify Custom Concept / Feature Name:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={modalCustomConceptText}
                    onChange={(e) => setModalCustomConceptText(e.target.value)}
                    placeholder="e.g., 'Stripe Metered Billing', 'Bluetooth Sensor Sync', 'HIPAA Audit Logs'..."
                    className="flex-1 bg-white px-3.5 py-2 rounded-xl border border-[#E5E0D6] text-xs font-mono text-[#181924] outline-none focus:border-[#6875E8]"
                  />
                  <button
                    type="button"
                    onClick={() => triggerConceptTasksGeneration('custom_concept', modalCustomConceptText, modalTargetPhase)}
                    className="px-4 py-2 rounded-xl bg-[#6875E8] text-white text-xs font-mono font-bold"
                  >
                    Generate
                  </button>
                </div>
              </div>
            )}

            {/* Target Phase & Priority Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#181924] block">
                  Target Milestone Phase:
                </label>
                <select
                  value={modalTargetPhase}
                  onChange={(e) => {
                    const nextPhase = parseInt(e.target.value, 10);
                    setModalTargetPhase(nextPhase);
                    triggerConceptTasksGeneration(modalSelectedConceptId, modalCustomConceptText, nextPhase);
                  }}
                  className="w-full bg-[#F7F4EE] px-4 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono font-bold text-[#181924] outline-none"
                >
                  {phasesList.map((p, idx) => (
                    <option key={idx} value={idx}>
                      {p.phase}: {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#181924] block">
                  Default Task Priority:
                </label>
                <div className="flex items-center gap-2">
                  {(['High', 'Medium', 'Low'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setModalPriority(p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                        modalPriority === p
                          ? p === 'High' ? 'bg-[#E96B7A] text-white' : p === 'Medium' ? 'bg-[#E8B653] text-white' : 'bg-[#4FA89B] text-white'
                          : 'bg-[#F7F4EE] text-[#555768] hover:bg-[#E5E0D6]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated Tasks Preview with Selection Checklist */}
            <div className="space-y-3 pt-2 border-t border-[#E5E0D6]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#181924]">
                  Generated Concept Tasks ({selectedConceptTaskIds.length} of {generatedConceptTasks.length} selected):
                </span>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setSelectedConceptTaskIds(generatedConceptTasks.map(g => g.id))}
                    className="text-[#6875E8] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#8E90A2]">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedConceptTaskIds([])}
                    className="text-[#8E90A2] hover:text-[#181924]"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {generatedConceptTasks.map((task) => {
                  const isSelected = selectedConceptTaskIds.includes(task.id);
                  const isDuplicate = isTaskDuplicate(tasks, task.title);

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        if (isDuplicate) return;
                        setSelectedConceptTaskIds(prev =>
                          prev.includes(task.id) ? prev.filter(id => id !== task.id) : [...prev, task.id]
                        );
                      }}
                      className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 transition-all ${
                        isDuplicate 
                          ? 'bg-[#F7F4EE]/60 border-[#E5E0D6] opacity-60 cursor-not-allowed'
                          : isSelected
                            ? 'bg-[#FCFAF6] border-[#6875E8] shadow-subtle cursor-pointer'
                            : 'bg-white border-[#E5E0D6] hover:bg-[#F7F4EE] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#6875E8] border-[#6875E8] text-white' : 'border-[#8E90A2] bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-medium text-[#181924] block">
                            {task.title}
                          </span>
                          <span className="text-[11px] text-[#555768] block">
                            {task.description}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isDuplicate ? (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-[#E8B653]/10 text-[#E8B653] font-bold border border-[#E8B653]/20">
                            ALREADY IN ROADMAP
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-md font-bold text-white" style={{ backgroundColor: task.badgeColor }}>
                            {task.conceptLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E0D6]">
              <button
                type="button"
                onClick={() => setIsConceptModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-[#F7F4EE] hover:bg-[#E5E0D6] text-xs font-mono font-bold text-[#555768]"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleAssignSelectedConceptTasks}
                disabled={selectedConceptTaskIds.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#6875E8] hover:bg-[#5563D6] text-white text-xs font-mono font-bold transition-all shadow-subtle disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>ASSIGN ({selectedConceptTaskIds.length}) TASKS TO PHASE {modalTargetPhase + 1}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: DEDICATED MANUAL TASK CREATION MODAL
          ───────────────────────────────────────────────────────────── */}
      {isManualTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5E0D6] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-[#E5E0D6] pb-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#181924]/10 text-[#181924]">
                  MANUAL TASK ENTRY
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#181924]">
                  Add Task to Roadmap
                </h3>
              </div>
              <button
                onClick={() => setIsManualTaskModalOpen(false)}
                className="p-2 text-[#8E90A2] hover:text-[#181924] rounded-full hover:bg-[#F7F4EE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualModalSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#181924] block">
                  Task Title: *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={manualTitle}
                  onChange={(e) => {
                    setManualTitle(e.target.value);
                    if (manualModalError) setManualModalError(null);
                  }}
                  placeholder="e.g., Integrate Supabase Realtime WebSocket listener on order updates..."
                  className="w-full bg-[#F7F4EE] px-4 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono text-[#181924] outline-none focus:border-[#6875E8]"
                />
                {manualTitle && isTaskDuplicate(tasks, manualTitle) && (
                  <p className="text-[11px] font-mono text-[#E8B653]">
                    ⚠️ A similar task is already present in the roadmap.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#181924] block">
                  Detailed Notes / Acceptance Criteria (Optional):
                </label>
                <textarea
                  rows={2}
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Additional context or technical deliverable specification..."
                  className="w-full bg-[#F7F4EE] px-4 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono text-[#181924] outline-none focus:border-[#6875E8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#181924] block">
                    Target Milestone Phase:
                  </label>
                  <select
                    value={manualPhaseId}
                    onChange={(e) => setManualPhaseId(parseInt(e.target.value, 10))}
                    className="w-full bg-[#F7F4EE] px-3.5 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono text-[#181924] outline-none"
                  >
                    {phasesList.map((p, idx) => (
                      <option key={idx} value={idx}>
                        {p.phase}: {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#181924] block">
                    Concept Tag:
                  </label>
                  <select
                    value={manualConceptId}
                    onChange={(e) => setManualConceptId(e.target.value)}
                    className="w-full bg-[#F7F4EE] px-3.5 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono text-[#181924] outline-none"
                  >
                    {CONCEPT_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.shortLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#181924] block">
                  Priority:
                </label>
                <div className="flex items-center gap-2">
                  {(['High', 'Medium', 'Low'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setManualPriority(p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                        manualPriority === p
                          ? p === 'High' ? 'bg-[#E96B7A] text-white' : p === 'Medium' ? 'bg-[#E8B653] text-white' : 'bg-[#4FA89B] text-white'
                          : 'bg-[#F7F4EE] text-[#555768] hover:bg-[#E5E0D6]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {manualModalError && (
                <div className="p-3 bg-[#E96B7A]/10 text-[#E96B7A] rounded-xl text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{manualModalError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E0D6]">
                <button
                  type="button"
                  onClick={() => setIsManualTaskModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-[#F7F4EE] hover:bg-[#E5E0D6] text-xs font-mono font-bold text-[#555768]"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={!manualTitle.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#181924] hover:bg-[#6875E8] text-white text-xs font-mono font-bold transition-all shadow-subtle disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>SAVE TASK TO PHASE {manualPhaseId + 1}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: ADD MILESTONE PHASE MODAL
          ───────────────────────────────────────────────────────────── */}
      {isAddPhaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5E0D6] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-[#E5E0D6] pb-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6875E8]/10 text-[#6875E8]">
                  NEW MILESTONE
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#181924]">
                  Add Roadmap Phase
                </h3>
              </div>
              <button
                onClick={() => setIsAddPhaseModalOpen(false)}
                className="p-2 text-[#8E90A2] hover:text-[#181924] rounded-full hover:bg-[#F7F4EE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomPhase} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#181924] block">
                  Phase Title: *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newPhaseTitle}
                  onChange={(e) => setNewPhaseTitle(e.target.value)}
                  placeholder="e.g., Post-Launch Growth, Enterprise SSO & Billing Integration..."
                  className="w-full bg-[#F7F4EE] px-4 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono text-[#181924] outline-none focus:border-[#6875E8]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#181924] block">
                  Estimated Timeline / Duration:
                </label>
                <input
                  type="text"
                  value={newPhaseDuration}
                  onChange={(e) => setNewPhaseDuration(e.target.value)}
                  placeholder="e.g., Days 10–14, 2 Weeks..."
                  className="w-full bg-[#F7F4EE] px-4 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono text-[#181924] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#181924] block">
                  Target Milestone Deliverable:
                </label>
                <textarea
                  rows={2}
                  value={newPhaseDeliverable}
                  onChange={(e) => setNewPhaseDeliverable(e.target.value)}
                  placeholder="e.g., Multi-tenant enterprise tenant isolation verified with automated billing webhooks..."
                  className="w-full bg-[#F7F4EE] px-4 py-2.5 rounded-2xl border border-[#E5E0D6] text-xs font-mono text-[#181924] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E0D6]">
                <button
                  type="button"
                  onClick={() => setIsAddPhaseModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-[#F7F4EE] hover:bg-[#E5E0D6] text-xs font-mono font-bold text-[#555768]"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={!newPhaseTitle.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#6875E8] hover:bg-[#5563D6] text-white text-xs font-mono font-bold transition-all shadow-subtle disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>CREATE PHASE</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
