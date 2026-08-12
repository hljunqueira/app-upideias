"use client";

export interface LessonAttachment {
  id: string;
  title: string;
  url: string;
  type: "pdf" | "prompt" | "link";
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  videoUrl: string;
  videoProvider: "youtube" | "cloudflare" | "vimeo" | "panda" | "mp4" | "hls";
  durationMinutes: number;
  isFreePreview: boolean;
  xpPoints: number;
  attachments?: LessonAttachment[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Trail {
  id: string;
  name: string;
  description: string;
  color: string;
  badge: string;
  recommendedOrder: number;
  videoIntroUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  track: string; // Trilha principal ex: "Fundamentos", "Criadores de Conteúdo", etc.
  tag: string; // Ex: "Estratégia", "Reels", "Vendas", "Copy"
  lessonInfo: string;
  progress: number;
  thumbnailUrl: string;
  videoTeaserUrl?: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  xpReward: number;
  isLandingPageFeatured: boolean;
  isRecommendedFirst: boolean;
  accessTier: "Grátis" | "Plano Pro" | "VIP Exclusivo";
  orderIndex: number;
  status: "published" | "draft";
  modulesCount: number;
  lessonsCount: number;
  createdAt: string;
}

export interface StudentWatchLog {
  id: string;
  studentName: string;
  studentEmail: string;
  avatarUrl: string;
  courseTitle: string;
  lessonTitle: string;
  progressPercent: number;
  watchedAt: string;
}

const COURSES_STORAGE_KEY = "up_creator_courses_data_v2";
const TRAILS_STORAGE_KEY = "up_creator_trails_data_v2";

export const INITIAL_TRAILS: Trail[] = [];

export const INITIAL_COURSES: Course[] = [];

export const INITIAL_STUDENT_LOGS: StudentWatchLog[] = [];

// --- HELPER DE CURSOS ---
export function getStoredCourses(): Course[] {
  if (typeof window === "undefined") return INITIAL_COURSES;
  try {
    const data = localStorage.getItem(COURSES_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(INITIAL_COURSES));
      return INITIAL_COURSES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Erro ao carregar cursos do localStorage", e);
    return INITIAL_COURSES;
  }
}

export function saveStoredCourses(courses: Course[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
    window.dispatchEvent(new CustomEvent("up_courses_updated"));
  } catch (e) {
    console.error("Erro ao salvar cursos no localStorage", e);
  }
}

// --- HELPER DE TRILHAS ---
export function getStoredTrails(): Trail[] {
  if (typeof window === "undefined") return INITIAL_TRAILS;
  try {
    const data = localStorage.getItem(TRAILS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(TRAILS_STORAGE_KEY, JSON.stringify(INITIAL_TRAILS));
      return INITIAL_TRAILS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Erro ao carregar trilhas do localStorage", e);
    return INITIAL_TRAILS;
  }
}

export function saveStoredTrails(trails: Trail[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TRAILS_STORAGE_KEY, JSON.stringify(trails));
    window.dispatchEvent(new CustomEvent("up_trails_updated"));
  } catch (e) {
    console.error("Erro ao salvar trilhas no localStorage", e);
  }
}

// --- INTEGRAÇÃO COM SUPABASE POSTGRESQL ---
import { supabase } from "@up-analytics/lib";

export async function fetchCoursesFromDb(): Promise<Course[]> {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data) {
      return getStoredCourses();
    }

    const mapped: Course[] = data.map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description || "",
      track: c.track,
      tag: c.tag || "Geral",
      lessonInfo: c.lesson_info || "Módulo 1 • Aula 1",
      progress: c.progress || 0,
      thumbnailUrl: c.thumbnail_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
      videoTeaserUrl: c.video_teaser_url || undefined,
      level: c.level || "Iniciante",
      xpReward: c.xp_reward || 350,
      isLandingPageFeatured: c.is_landing_page_featured ?? true,
      isRecommendedFirst: c.is_recommended_first ?? false,
      accessTier: c.access_tier || "Grátis",
      orderIndex: c.order_index || 1,
      status: c.status || "published",
      modulesCount: c.modules_count || 1,
      lessonsCount: c.lessons_count || 4,
      createdAt: c.created_at || new Date().toISOString()
    }));

    saveStoredCourses(mapped);
    return mapped;
  } catch {
    return getStoredCourses();
  }
}

export async function fetchTrailsFromDb(): Promise<Trail[]> {
  try {
    const { data, error } = await supabase
      .from("learning_trails")
      .select("*")
      .order("recommended_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return getStoredTrails();
    }

    return data.map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description || "",
      color: t.color || "#ff5368",
      badge: t.badge || "Essencial",
      recommendedOrder: t.recommended_order || 1,
      videoIntroUrl: t.video_intro_url || undefined
    }));
  } catch {
    return getStoredTrails();
  }
}

export async function saveCourseToDb(course: Course): Promise<void> {
  saveStoredCourses([course, ...getStoredCourses().filter(c => c.id !== course.id)]);
  try {
    await supabase.from("courses").upsert({
      id: course.id,
      title: course.title,
      description: course.description,
      track: course.track,
      tag: course.tag,
      lesson_info: course.lessonInfo,
      progress: course.progress,
      thumbnail_url: course.thumbnailUrl,
      video_teaser_url: course.videoTeaserUrl,
      level: course.level,
      xp_reward: course.xpReward,
      is_landing_page_featured: course.isLandingPageFeatured,
      is_recommended_first: course.isRecommendedFirst,
      access_tier: course.accessTier,
      order_index: course.orderIndex,
      status: course.status,
      modules_count: course.modulesCount,
      lessons_count: course.lessonsCount
    });
  } catch (e) {
    console.error("Erro ao salvar curso no Supabase", e);
  }
}

export async function deleteCourseFromDb(id: string): Promise<void> {
  const current = getStoredCourses();
  const filtered = current.filter((c) => c.id !== id);
  saveStoredCourses(filtered);
  try {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      console.error("Erro Supabase ao remover curso:", error);
    }
  } catch (e) {
    console.error("Erro ao remover curso do Supabase:", e);
  }
}

export async function toggleLandingFeaturedInDb(id: string, currentFeatured: boolean): Promise<void> {
  const newFeatured = !currentFeatured;
  const updated = getStoredCourses().map(c => c.id === id ? { ...c, isLandingPageFeatured: newFeatured } : c);
  saveStoredCourses(updated);
  try {
    await supabase.from("courses").update({ is_landing_page_featured: newFeatured }).eq("id", id);
  } catch (e) {
    console.error("Erro ao alternar destaque do curso no Supabase", e);
  }
}
