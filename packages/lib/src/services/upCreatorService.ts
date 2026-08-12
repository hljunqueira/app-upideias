import { UpCreatorCourse, UpCreatorLesson, UpCreatorProgress } from '@up-analytics/types';
import { supabase } from '../supabase';

export async function getCourses(): Promise<UpCreatorCourse[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('order_index', { ascending: true });

  if (error || !data) return [];
  return data.map((c: any) => ({
    id: c.id,
    title: c.title,
    description: c.description || '',
    thumbnail_url: c.thumbnail_url || '',
    category: c.track || c.category || 'Geral',
    required_feature_key: c.required_feature_key || 'up_creator_basic',
    order_index: c.order_index || 1,
    is_active: c.status !== 'draft',
    created_at: c.created_at || new Date().toISOString(),
    updated_at: c.updated_at || new Date().toISOString()
  })) as UpCreatorCourse[];
}

export async function getCourse(id: string): Promise<UpCreatorCourse | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    thumbnail_url: data.thumbnail_url || '',
    category: data.track || data.category || 'Geral',
    required_feature_key: data.required_feature_key || 'up_creator_basic',
    order_index: data.order_index || 1,
    is_active: data.status !== 'draft',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString()
  } as UpCreatorCourse;
}

export async function getLesson(id: string): Promise<UpCreatorLesson | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    course_id: data.course_id,
    title: data.title,
    description: data.description || '',
    video_url: data.video_url || '',
    thumbnail_url: data.thumbnail_url || '',
    duration_seconds: (data.duration_minutes || 10) * 60,
    material_url: data.material_url || null,
    required_feature_key: data.required_feature_key || 'up_creator_basic',
    order_index: data.order_index || 1,
    is_active: true,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString()
  } as UpCreatorLesson;
}

export async function markLessonCompleted(userId: string, lessonId: string): Promise<void> {
  await supabase.from('user_lesson_progress').upsert({
    user_id: userId,
    lesson_id: lessonId,
    completed: true,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export async function updateLessonProgress(userId: string, lessonId: string, watchedSeconds: number): Promise<void> {
  await supabase.from('user_lesson_progress').upsert({
    user_id: userId,
    lesson_id: lessonId,
    watched_seconds: watchedSeconds,
    updated_at: new Date().toISOString()
  });
}

// Admin management
export async function createCourse(course: Omit<UpCreatorCourse, 'id' | 'created_at' | 'updated_at'>): Promise<UpCreatorCourse> {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      track: course.category,
      order_index: course.order_index,
      status: course.is_active ? 'published' : 'draft'
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Erro ao criar curso');
  return getCourse(data.id) as Promise<UpCreatorCourse>;
}

export async function updateCourse(id: string, data: Partial<UpCreatorCourse>): Promise<UpCreatorCourse> {
  await supabase
    .from('courses')
    .update({
      title: data.title,
      description: data.description,
      thumbnail_url: data.thumbnail_url,
      track: data.category,
      order_index: data.order_index,
      status: data.is_active ? 'published' : 'draft'
    })
    .eq('id', id);

  return (await getCourse(id))!;
}

export async function createLesson(lesson: Omit<UpCreatorLesson, 'id' | 'created_at' | 'updated_at'>): Promise<UpCreatorLesson> {
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      course_id: lesson.course_id,
      title: lesson.title,
      description: lesson.description,
      video_url: lesson.video_url,
      thumbnail_url: lesson.thumbnail_url,
      duration_minutes: Math.ceil(lesson.duration_seconds / 60),
      order_index: lesson.order_index
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Erro ao criar aula');
  return (await getLesson(data.id))!;
}

export async function updateLesson(id: string, data: Partial<UpCreatorLesson>): Promise<UpCreatorLesson> {
  await supabase
    .from('lessons')
    .update({
      title: data.title,
      description: data.description,
      video_url: data.video_url,
      thumbnail_url: data.thumbnail_url,
      duration_minutes: data.duration_seconds ? Math.ceil(data.duration_seconds / 60) : undefined,
      order_index: data.order_index
    })
    .eq('id', id);

  return (await getLesson(id))!;
}

