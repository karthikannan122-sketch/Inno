import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          process.env[key.trim()] = values.join('=').trim();
        }
      }
    }
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// Use PUBLISHABLE (anon) key just like the browser frontend!
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

console.log('Testing with Supabase URL:', url);
console.log('Anon key exists:', Boolean(key));

const supabase = createClient(url, key);

async function testFrontendCreate() {
  try {
    // 1. Get session (if any)
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session user:', session?.user?.id || 'none (guest)');

    // 2. Fetch profiles
    const { data: profilesList, error: profErr } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(3);
    
    console.log('Profiles found:', profilesList, 'Error:', profErr);

    const ownerId = profilesList?.[0]?.id;
    console.log('Using ownerId:', ownerId);

    // 3. Try to insert project with anon client
    const { data: dbProject, error: dbError } = await supabase
      .from('projects')
      .insert({
        owner_id: ownerId,
        title: 'Test Web Submission Innovation',
        project_type: 'product',
        category: 'Technology',
        problem_title: 'Testing the frontend submit problem statement',
        problem_description: 'Testing the frontend submit problem statement in detail',
        solution_description: 'Testing the solution architecture description',
        target_audience: 'Engineers and Innovators',
        value_proposition: 'Fast and reliable submission',
        differentiation: 'Integrated validation engine',
        live_url: 'https://example.com',
        cover_image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
        status: 'under_review',
        validation_status: 'idea',
        visibility: 'public',
        current_version: 1,
        validation_score: 50
      })
      .select()
      .single();

    console.log('Insert project result:', dbProject, 'Error:', dbError);

    if (dbError) {
      console.error('FAILED TO INSERT PROJECT:', dbError);
    } else {
      console.log('SUCCESS! Created project ID:', dbProject.id);

      // Check tags insert
      const { data: tagsRes, error: tagsErr } = await supabase.from('project_tags').insert([
        { project_id: dbProject.id, tag: 'Technology' },
        { project_id: dbProject.id, tag: 'product' }
      ]).select();
      console.log('Tags insert result:', tagsRes, 'Error:', tagsErr);

      // Check versions insert
      const { data: verRes, error: verErr } = await supabase.from('project_versions').insert({
        project_id: dbProject.id,
        version_number: 'v1.0',
        title: 'Initial Concept: ' + dbProject.title,
        description: dbProject.solution_description,
        changes_summary: 'Project concept created and submitted for validation.',
        validation_score: 50
      }).select();
      console.log('Versions insert result:', verRes, 'Error:', verErr);
    }
  } catch (err) {
    console.error('Exception caught:', err);
  }
}

testFrontendCreate();
