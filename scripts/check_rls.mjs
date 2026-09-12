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
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const adminClient = createClient(url, serviceKey);

async function testRLS() {
  console.log('Testing RLS policies on profiles and subscriptions:');
  const { data: users, error: uErr } = await adminClient.auth.admin.listUsers();
  console.log('Auth users count:', users?.users?.length);
  
  for (const u of users?.users || []) {
    console.log(`User: ${u.email} (${u.id})`);
    
    // Query with adminClient
    const { data: pAdmin } = await adminClient.from('profiles').select('id, plan, role').eq('id', u.id).maybeSingle();
    console.log('  Admin client profile:', pAdmin);

    // Query subscriptions
    const { data: sAdmin } = await adminClient.from('subscriptions').select('*').eq('user_id', u.id);
    console.log('  Admin client subscriptions:', sAdmin);
  }
}

testRLS().catch(console.error);
