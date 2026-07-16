import { UpCreatorCourse, UpCreatorLesson, UpCreatorProgress } from '@up-analytics/types';

// Mock DB store for Creator Cursos
let coursesDb: UpCreatorCourse[] = [
  {
    id: 'aa782ff1-789a-41ab-85b4-c38d47be4401',
    title: 'Dominando o Instagram',
    description: 'Aprenda os segredos do algoritmo e como estruturar sua marca.',
    thumbnail_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80',
    category: 'Fundamentos',
    required_feature_key: 'up_creator_basic',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'aa782ff1-789a-41ab-85b4-c38d47be4402',
    title: 'Estratégia e Métricas de Alto Impacto',
    description: 'Como analisar dados de forma inteligente para converter seguidores em vendas.',
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
    category: 'Estratégia',
    required_feature_key: 'up_creator_intermediate',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'aa782ff1-789a-41ab-85b4-c38d47be4403',
    title: 'SaaS e Escala para Agências',
    description: 'Como gerenciar múltiplos clientes e estruturar relatórios automatizados de alto nível.',
    thumbnail_url: 'https://images.unsplash.com/photo-1552581230-c01bc0d4842d?auto=format&fit=crop&w=400&q=80',
    category: 'Agências',
    required_feature_key: 'up_creator_full',
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

let lessonsDb: UpCreatorLesson[] = [
  {
    id: '11aa2ff1-789a-41ab-85b4-c38d47be4421',
    course_id: 'aa782ff1-789a-41ab-85b4-c38d47be4401',
    title: 'Introdução ao Algoritmo',
    description: 'Como funciona o algoritmo do Instagram atualmente.',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80',
    duration_seconds: 600,
    material_url: 'https://pdf-manual.com/1.pdf',
    required_feature_key: 'up_creator_basic',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '11aa2ff1-789a-41ab-85b4-c38d47be4422',
    course_id: 'aa782ff1-789a-41ab-85b4-c38d47be4401',
    title: 'Construindo o Posicionamento Estratégico',
    description: 'Estratégias práticas para encontrar a voz e tom da sua marca.',
    video_url: 'https://www.w3schools.com/html/movie.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80',
    duration_seconds: 920,
    material_url: null,
    required_feature_key: 'up_creator_basic',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export async function getCourses(): Promise<UpCreatorCourse[]> {
  return coursesDb.filter(c => c.is_active);
}

export async function getCourse(id: string): Promise<UpCreatorCourse | null> {
  return coursesDb.find(c => c.id === id && c.is_active) || null;
}

export async function getLesson(id: string): Promise<UpCreatorLesson | null> {
  return lessonsDb.find(l => l.id === id && l.is_active) || null;
}

export async function markLessonCompleted(userId: string, lessonId: string): Promise<void> {
  // Simulates progress logging
}

export async function updateLessonProgress(userId: string, lessonId: string, watchedSeconds: number): Promise<void> {
  // Simulates updating watched seconds
}

// Admin management
export async function createCourse(course: Omit<UpCreatorCourse, 'id' | 'created_at' | 'updated_at'>): Promise<UpCreatorCourse> {
  const newCourse: UpCreatorCourse = {
    ...course,
    id: Math.random().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  coursesDb.push(newCourse);
  return newCourse;
}

export async function updateCourse(id: string, data: Partial<UpCreatorCourse>): Promise<UpCreatorCourse> {
  coursesDb = coursesDb.map(c => c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c);
  return coursesDb.find(c => c.id === id)!;
}

export async function createLesson(lesson: Omit<UpCreatorLesson, 'id' | 'created_at' | 'updated_at'>): Promise<UpCreatorLesson> {
  const newLesson: UpCreatorLesson = {
    ...lesson,
    id: Math.random().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  lessonsDb.push(newLesson);
  return newLesson;
}

export async function updateLesson(id: string, data: Partial<UpCreatorLesson>): Promise<UpCreatorLesson> {
  lessonsDb = lessonsDb.map(l => l.id === id ? { ...l, ...data, updated_at: new Date().toISOString() } : l);
  return lessonsDb.find(l => l.id === id)!;
}
