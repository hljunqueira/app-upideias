import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envPaths = ['.env.local', 'apps/web/.env.local'];
const env = {};
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    fs.readFileSync(p, 'utf8').split('\n').forEach(l => {
      const parts = l.trim().split('=');
      if (parts.length >= 2) {
        const k = parts[0].trim();
        const v = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        if (!env[k]) env[k] = v;
      }
    });
  }
}

const url = env.NEXT_PUBLIC_SUPABASE_URL || 'https://api.upideias.com';
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function run() {
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log('=== PROFILES ===', pErr || '');
  if (profiles && profiles.length > 0) {
    console.log('PROFILE KEYS:', Object.keys(profiles[0]));
  }

  const testQuery = await supabase
    .from('profiles')
    .select('id, name, email, plan, status, instagram_handle, created_at')
    .eq('id', '00fd084b-78e5-4528-8a7c-655ffce860cd')
    .maybeSingle();
  console.log('CORRECTED QUERY RESULT:', testQuery);
}

run().catch(console.error);
