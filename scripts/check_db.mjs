import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envFiles = ['.env.local', '.env.production.local', '.env.production', '.env'];
  const env = {};
  for (const f of envFiles) {
    const fullPath = path.resolve(process.cwd(), f);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!env[key]) env[key] = val;
        }
      }
    }
  }
  return env;
}

async function inspectDb() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL || 'https://api.upideias.com';
  const key = env.SUPABASE_SERVICE_ROLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg2NTA0NzMwLCJleHAiOjE5NDQxODQ3MzB9.vOqyYLQPBKVOWIshQvk0ImybA7gZh4ehXqRgSTeB-90';

  console.log('=== CONEXAO COM BANCO VIA NODE ===');
  console.log('URL:', url);
  console.log('Chave presente:', !!key, key ? `(inicia com ${key.slice(0, 10)}...)` : '');

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // 1. Tabela plans
  console.log('\n=== TABELA: plans ===');
  const { data: plans, error: errPlans } = await supabase.from('plans').select('*');
  if (errPlans) {
    console.error('Erro ao consultar plans:', errPlans);
  } else {
    console.log(`Encontrados ${plans.length} registros:`);
    plans.forEach(p => {
      console.log(`- ID: ${p.id} | Slug: ${p.slug} | Nome: ${p.name} | Mensal: R$ ${p.monthly_price_cents/100} | Anual: R$ ${p.annual_price_cents/100} | Featured: ${p.is_featured}`);
    });
    if (plans.length > 0) {
      console.log('Colunas de plans:', Object.keys(plans[0]));
    }
  }

  // 2. Tabela plan_limits
  console.log('\n=== TABELA: plan_limits ===');
  const { data: limits, error: errLimits } = await supabase.from('plan_limits').select('*');
  if (errLimits) {
    console.error('Erro ao consultar plan_limits:', errLimits);
  } else {
    console.log(`Encontrados ${limits.length} registros de limites:`);
    limits.forEach(l => {
      console.log(`- Plan ID: ${l.plan_id} | IG: ${l.max_instagram_accounts} | Historico: ${l.history_days}d | Clientes: ${l.max_clients} | IA: ${l.max_ai_requests_month} | Zap: ${l.max_whatsapp_messages_month}`);
    });
    if (limits.length > 0) {
      console.log('Colunas de plan_limits:', Object.keys(limits[0]));
    }
  }

  // 3. Tabela profiles
  console.log('\n=== TABELA: profiles ===');
  const { data: profiles, error: errProfiles } = await supabase.from('profiles').select('*').limit(5);
  if (errProfiles) {
    console.error('Erro ao consultar profiles:', errProfiles);
  } else if (profiles.length > 0) {
    console.log('Colunas de profiles:', Object.keys(profiles[0]));
    console.log('Existe has_used_upgrade_discount em profiles?:', 'has_used_upgrade_discount' in profiles[0]);
    profiles.forEach(p => {
      console.log(`- ID: ${p.id} | Email: ${p.email} | Plano: ${p.plan} | Status: ${p.status} | has_used_upgrade_discount: ${p.has_used_upgrade_discount}`);
    });
  } else {
    console.log('Tabela profiles esta vazia.');
  }

  // 4. Tabela subscriptions
  console.log('\n=== TABELA: subscriptions ===');
  const { data: subs, error: errSubs } = await supabase.from('subscriptions').select('*').limit(5);
  if (errSubs) {
    console.error('Erro ao consultar subscriptions:', errSubs);
  } else if (subs.length > 0) {
    console.log('Colunas de subscriptions:', Object.keys(subs[0]));
    subs.forEach(s => {
      console.log(`- ID: ${s.id} | Plan: ${s.plan_name} | Status: ${s.status} | Amount: ${s.amount || s.amount_cents}`);
    });
  } else {
    console.log('Nenhuma subscription encontrada.');
  }

  // 5. Tabela courses e lessons
  console.log('\n=== TABELA: courses & lessons ===');
  const { data: courses, error: errCourses } = await supabase.from('courses').select('*').limit(2);
  if (!errCourses && courses && courses.length > 0) {
    console.log('Colunas de courses:', Object.keys(courses[0]));
    console.log('Campos de XP em courses:', Object.keys(courses[0]).filter(k => k.toLowerCase().includes('xp')));
  }
  const { data: lessons, error: errLessons } = await supabase.from('lessons').select('*').limit(2);
  if (!errLessons && lessons && lessons.length > 0) {
    console.log('Colunas de lessons:', Object.keys(lessons[0]));
    console.log('Campos de XP em lessons:', Object.keys(lessons[0]).filter(k => k.toLowerCase().includes('xp')));
  }

  // 6. Verificar tabelas de whatsapp e ai
  console.log('\n=== TABELAS EXTRAS: whatsapp_messages / automation_events ===');
  const { data: zapData, error: errZap } = await supabase.from('whatsapp_messages').select('id').limit(1);
  console.log('whatsapp_messages existe?:', !errZap, errZap ? errZap.message : `Encontrado (count: ${zapData?.length})`);

  const { data: autoEvents, error: errAuto } = await supabase.from('automation_events').select('id').limit(1);
  console.log('automation_events existe?:', !errAuto, errAuto ? errAuto.message : `Encontrado (count: ${autoEvents?.length})`);
}

inspectDb().catch(console.error);
