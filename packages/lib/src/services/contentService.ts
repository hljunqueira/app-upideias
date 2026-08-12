import { ContentIdea, ContentCalendar, ContentApproval, ContentLibrary } from '@up-analytics/types';
import { supabase } from '../supabase';

export async function createContentIdea(idea: Omit<ContentIdea, 'id' | 'created_at' | 'updated_at'>): Promise<ContentIdea> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('content_ideas')
    .insert({
      ...idea,
      user_id: user?.id || idea.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Erro ao criar ideia de conteúdo');
  return data as ContentIdea;
}

export async function updateContentIdea(id: string, data: Partial<ContentIdea>): Promise<void> {
  await supabase
    .from('content_ideas')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
}

export async function addContentToCalendar(item: Omit<ContentCalendar, 'id' | 'created_at' | 'updated_at'>): Promise<ContentCalendar> {
  const { data, error } = await supabase
    .from('content_calendar')
    .insert({
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Erro ao agendar post no calendário');
  return data as ContentCalendar;
}

export async function updateCalendarStatus(id: string, status: string): Promise<void> {
  await supabase
    .from('content_calendar')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
}

export async function requestApproval(ideaId: string): Promise<ContentApproval> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('content_approvals')
    .insert({
      user_id: user?.id,
      content_idea_id: ideaId,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Erro ao solicitar aprovação');
  return data as ContentApproval;
}

export async function approveContent(approvalId: string): Promise<void> {
  await supabase
    .from('content_approvals')
    .update({ status: 'approved', approved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', approvalId);
}

export async function rejectContent(approvalId: string, comment: string): Promise<void> {
  await supabase
    .from('content_approvals')
    .update({ status: 'rejected', client_comment: comment, updated_at: new Date().toISOString() })
    .eq('id', approvalId);
}

export async function requestContentChanges(approvalId: string, comment: string): Promise<void> {
  await supabase
    .from('content_approvals')
    .update({ status: 'changes_requested', client_comment: comment, updated_at: new Date().toISOString() })
    .eq('id', approvalId);
}

export async function saveToContentLibrary(item: Omit<ContentLibrary, 'id' | 'created_at' | 'updated_at'>): Promise<ContentLibrary> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('content_library')
    .insert({
      ...item,
      user_id: user?.id || item.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Erro ao salvar na biblioteca');
  return data as ContentLibrary;
}

