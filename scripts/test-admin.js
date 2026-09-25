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

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

console.log('Testing with Admin Secret Key against:', url);
const supabaseAdmin = createClient(url, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  // Test if admin client can insert without RLS
  const { data: profs } = await supabaseAdmin.from('profiles').select('id').limit(1);
  const ownerId = profs?.[0]?.id;
  console.log('Admin ownerId:', ownerId);

  const { data: proj, error: projErr } = await supabaseAdmin.from('projects').insert({
    owner_id: ownerId,
    title: 'Admin Created Project Verification',
    project_type: 'product',
    category: 'Technology',
    problem_title: 'Verifying Admin Secret Key Insertion',
    solution_description: 'Direct insertion via admin service client bypasses RLS',
    validation_score: 80
  }).select().single();

  console.log('Project inserted with admin secret key:', proj?.id, 'Error:', projErr);
}

main();
