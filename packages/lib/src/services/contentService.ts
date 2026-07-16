import { ContentIdea, ContentCalendar, ContentApproval, ContentLibrary } from '@up-analytics/types';

export async function createContentIdea(idea: Omit<ContentIdea, 'id' | 'created_at' | 'updated_at'>): Promise<ContentIdea> {
  return {
    ...idea,
    id: Math.random().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function updateContentIdea(id: string, data: Partial<ContentIdea>): Promise<void> {
  // Simulates updating
}

export async function addContentToCalendar(item: Omit<ContentCalendar, 'id' | 'created_at' | 'updated_at'>): Promise<ContentCalendar> {
  return {
    ...item,
    id: Math.random().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function updateCalendarStatus(id: string, status: string): Promise<void> {
  // Simulates updating status
}

export async function requestApproval(ideaId: string): Promise<ContentApproval> {
  return {
    id: Math.random().toString(),
    user_id: 'd30349b1-5911-4700-8438-e67c9c049ee6',
    client_id: null,
    content_idea_id: ideaId,
    status: 'pending',
    client_comment: null,
    approved_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function approveContent(approvalId: string): Promise<void> {
  // Simulates approvals
}

export async function rejectContent(approvalId: string, comment: string): Promise<void> {
  // Simulates rejection
}

export async function requestContentChanges(approvalId: string, comment: string): Promise<void> {
  // Simulates requesting changes
}

export async function saveToContentLibrary(item: Omit<ContentLibrary, 'id' | 'created_at' | 'updated_at'>): Promise<ContentLibrary> {
  return {
    ...item,
    id: Math.random().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
