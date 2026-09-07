import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    'https://api.upideias.com';
  const supabaseUrl = rawUrl.replace(/^["']|["']$/g, '').trim();

  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const serviceRoleKey = rawKey.replace(/^["']|["']$/g, '').trim();

  if (!serviceRoleKey) {
    throw new Error('[AdminClient] Configuração ausente: SUPABASE_SERVICE_ROLE_KEY é obrigatória no ambiente servidor.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
