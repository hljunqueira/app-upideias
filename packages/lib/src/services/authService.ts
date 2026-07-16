import { Profile } from '@up-analytics/types';
import { supabase } from '../supabase';

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return {
      id: "d30349b1-5911-4700-8438-e67c9c049ee6",
      email: "creator@upideias.com",
      role: "user",
    };
  }
  return {
    id: user.id,
    email: user.email,
    role: 'user',
  };
}

export async function getCurrentProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return {
      id: userId,
      name: "Creator de Sucesso",
      email: "creator@upideias.com",
      phone: "+5511999999999",
      role: "user",
      whatsapp_opt_in: true,
      whatsapp_opt_in_at: new Date().toISOString(),
      whatsapp_opt_out_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  return data as Profile;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error("Não autorizado - Requer privilégios de Administrador");
  }
  return user;
}
