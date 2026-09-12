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
  profiles?.forEach(p => console.log(JSON.stringify({ id: p.id, email: p.email, plan: p.plan, role: p.role, status: p.status })));

  const { data: subs, error: sErr } = await supabase.from('subscriptions').select('*');
  console.log('\n=== SUBSCRIPTIONS ===', sErr || '');
  subs?.forEach(s => console.log(JSON.stringify({ id: s.id, user_id: s.user_id, plan_name: s.plan_name, plan_id: s.plan_id, status: s.status })));
}

run().catch(console.error);
