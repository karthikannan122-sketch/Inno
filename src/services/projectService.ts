import { supabase, isSupabaseConfigured, STORAGE_KEYS } from '../lib/supabase';
import { Project, ProjectVersion, ProjectRelationship } from '../types/database';
import { SEED_PROJECTS, SEED_VERSIONS, SEED_RELATIONSHIPS } from '../data/seedData';

export const projectService = {
  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching projects from Supabase:', error);
        return [];
      }
      return data || [];
    }
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return stored ? JSON.parse(stored) : SEED_PROJECTS;
  },

  async getProjectById(id: string): Promise<Project | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    }
    const projects = await this.getProjects();
    return projects.find(p => p.id === id) || null;
  },

  async createProject(projectData: Partial<Project>): Promise<{ data: Project | null; error: string | null }> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();
      return { data, error: error ? error.message : null };
    }
    const projects = await this.getProjects();
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      current_version: 1,
      readiness_score: 70,
      reviews_count: 0,
      perspectives_count: 0,
      owner_id: projectData.owner_id || 'current',
      title: projectData.title || 'Untitled Innovation',
      project_type: projectData.project_type || 'idea',
      category: projectData.category || 'Technology',
      problem_title: projectData.problem_title || '',
      problem_description: projectData.problem_description || '',
      solution_description: projectData.solution_description || '',
      target_audience: projectData.target_audience || '',
      value_proposition: projectData.value_proposition || '',
      differentiation: projectData.differentiation || '',
      status: projectData.status || 'under_review',
      visibility: projectData.visibility || 'public',
      tags: projectData.tags || [],
      ...projectData
    } as Project;

    const updated = [newProject, ...projects];
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
    return { data: newProject, error: null };
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<{ error: string | null }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      return { error: error ? error.message : null };
    }
    const projects = await this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      return { error: null };
    }
    return { error: 'Project not found' };
  }
};
