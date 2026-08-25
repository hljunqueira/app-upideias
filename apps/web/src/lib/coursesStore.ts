import { supabase } from "@up-analytics/lib";

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
  track: string;
  tag: string;
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

// --- HELPER DE CURSOS (SUPABASE DIRETO) ---
export async function fetchCoursesFromDb(): Promise<Course[]> {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data) {
      return [];
    }

    const mapped: Course[] = data.map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description || "",
      track: (c.track || "Geral").trim(),
      tag: c.tag || "Geral",
      lessonInfo: c.lesson_info || `${c.modules_count || 1} Módulo(s)`,
      progress: c.progress || 0,
      thumbnailUrl: c.thumbnail_url || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop",
      videoTeaserUrl: c.video_teaser_url || undefined,
      level: (c.level as any) || "Iniciante",
      xpReward: c.xp_reward || 350,
      isLandingPageFeatured: c.is_landing_page_featured ?? true,
      isRecommendedFirst: c.is_recommended_first ?? false,
      accessTier: (c.access_tier as any) || "Grátis",
      orderIndex: c.order_index || 1,
      status: (c.status as any) || "published",
      modulesCount: c.modules_count || 1,
      lessonsCount: c.lessons_count || 1,
      createdAt: c.created_at || new Date().toISOString()
    }));

    return mapped;
  } catch (e) {
    console.error("Erro ao buscar cursos do Supabase:", e);
    return [];
  }
}

export async function saveCourseToDb(course: Course): Promise<{ success: boolean; error?: string }> {
  try {
    const fallbackThumb =
      course.thumbnailUrl && course.thumbnailUrl.trim().length > 0
        ? course.thumbnailUrl
        : "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop";

    const { error } = await supabase.from("courses").upsert({
      id: course.id,
      title: course.title,
      description: course.description,
      track: course.track.trim(),
      tag: course.tag,
      lesson_info: course.lessonInfo,
      progress: course.progress,
      thumbnail_url: fallbackThumb,
      video_teaser_url: course.videoTeaserUrl,
      level: course.level,
      xp_reward: course.xpReward,
      is_landing_page_featured: course.isLandingPageFeatured,
      is_recommended_first: course.isRecommendedFirst,
      access_tier: course.accessTier,
      order_index: course.orderIndex,
      status: course.status,
      modules_count: course.modulesCount,
      lessons_count: course.lessonsCount,
      created_at: course.createdAt
    });

    if (error) {
      console.error("Erro ao salvar curso no Supabase:", error);
      return { success: false, error: error.message || "Erro ao salvar no banco de dados" };
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("up_courses_updated"));
    }

    return { success: true };
  } catch (e: any) {
    console.error("Erro ao salvar curso no Supabase:", e);
    return { success: false, error: e?.message || "Exceção inesperada ao salvar curso" };
  }
}

export async function deleteCourseFromDb(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Deletar aulas e módulos vinculados
    await supabase.from("lessons").delete().eq("course_id", id);
    await supabase.from("modules").delete().eq("course_id", id);
    // 2. Deletar curso
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      console.error("Erro Supabase ao remover curso:", error);
      return { success: false, error: error.message };
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("up_courses_updated"));
    }

    return { success: true };
  } catch (e: any) {
    console.error("Erro ao remover curso do Supabase:", e);
    return { success: false, error: e?.message };
  }
}

export async function toggleLandingFeaturedInDb(id: string, currentFeatured: boolean): Promise<void> {
  const newFeatured = !currentFeatured;
  try {
    const { error } = await supabase.from("courses").update({ is_landing_page_featured: newFeatured }).eq("id", id);
    if (!error && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("up_courses_updated"));
    }
  } catch (e) {
    console.error("Erro ao alternar destaque do curso no Supabase:", e);
  }
}

// --- HELPER DE TRILHAS (SUPABASE DIRETO) ---
export async function fetchTrailsFromDb(): Promise<Trail[]> {
  try {
    const { data, error } = await supabase
      .from("learning_trails")
      .select("*")
      .order("recommended_order", { ascending: true });

    if (error || !data) {
      return [];
    }

    const mapped: Trail[] = data.map((t: any) => ({
      id: t.id,
      name: (t.name || "").trim(),
      description: t.description || "",
      color: t.color || "#ff5368",
      badge: t.badge || "Essencial",
      recommendedOrder: t.recommended_order || 1,
      videoIntroUrl: t.video_intro_url || undefined
    }));

    return mapped;
  } catch (e) {
    console.error("Erro ao buscar trilhas no Supabase:", e);
    return [];
  }
}

export async function saveTrailToDb(trail: Trail): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("learning_trails").upsert({
      id: trail.id,
      name: trail.name.trim(),
      description: trail.description,
      color: trail.color,
      badge: trail.badge,
      recommended_order: trail.recommendedOrder,
      video_intro_url: trail.videoIntroUrl
    });

    if (error) {
      console.error("Erro ao salvar trilha no Supabase:", error);
      return { success: false, error: error.message };
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("up_trails_updated"));
    }

    return { success: true };
  } catch (e: any) {
    console.error("Erro ao salvar trilha no Supabase:", e);
    return { success: false, error: e?.message };
  }
}

export async function deleteTrailFromDb(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("learning_trails").delete().eq("id", id);
    if (error) {
      console.error("Erro Supabase ao remover trilha:", error);
      return { success: false, error: error.message };
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("up_trails_updated"));
    }

    return { success: true };
  } catch (e: any) {
    console.error("Erro ao remover trilha do Supabase:", e);
    return { success: false, error: e?.message };
  }
}

// --- HELPER DE MÓDULOS E AULAS SUPABASE ---
export async function fetchModulesFromDb(courseId: string): Promise<Module[]> {
  try {
    const { data: dbModules, error: modErr } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true });

    if (modErr || !dbModules) {
      return [];
    }

    const { data: dbLessons } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true });

    const lessonsList = dbLessons || [];

    const mapped: Module[] = dbModules.map((m: any) => {
      const moduleLessons: Lesson[] = lessonsList
        .filter((l: any) => l.module_id === m.id)
        .map((l: any) => ({
          id: l.id,
          moduleId: l.module_id,
          title: l.title,
          description: l.description || "",
          videoUrl: l.video_url || "",
          videoProvider: l.video_provider || "youtube",
          durationMinutes: l.duration_minutes || 10,
          isFreePreview: l.is_free_preview ?? false,
          xpPoints: l.xp_points || 50
        }));

      return {
        id: m.id,
        courseId: m.course_id,
        title: m.title,
        description: m.description || "",
        order: m.order_index || 1,
        lessons: moduleLessons
      };
    });

    return mapped;
  } catch (e) {
    console.error("Erro ao buscar módulos no Supabase:", e);
    return [];
  }
}

export async function saveModuleToDb(module: Module): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("modules").upsert({
      id: module.id,
      course_id: module.courseId,
      title: module.title,
      description: module.description,
      order_index: module.order
    });

    if (error) {
      console.error("Erro ao salvar módulo no Supabase:", error);
      return { success: false, error: error.message };
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("up_modules_updated"));
    }

    return { success: true };
  } catch (e: any) {
    console.error("Erro ao salvar módulo no Supabase:", e);
    return { success: false, error: e?.message };
  }
}

export async function deleteModuleFromDb(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await supabase.from("lessons").delete().eq("module_id", id);
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) {
      console.error("Erro ao remover módulo do Supabase:", error);
      return { success: false, error: error.message };
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("up_modules_updated"));
    }

    return { success: true };
  } catch (e: any) {
    console.error("Erro ao remover módulo do Supabase:", e);
    return { success: false, error: e?.message };
  }
}

export async function saveLessonToDb(lesson: Lesson, courseId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("lessons").upsert({
      id: lesson.id,
      module_id: lesson.moduleId,
      course_id: courseId,
      title: lesson.title,
      description: lesson.description,
      video_url: lesson.videoUrl,
      video_provider: lesson.videoProvider,
      duration_minutes: lesson.durationMinutes,
      is_free_preview: lesson.isFreePreview,
      xp_points: lesson.xpPoints
    });

    if (error) {
      console.error("Erro ao salvar aula no Supabase:", error);
      return { success: false, error: error.message };
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("up_modules_updated"));
    }

    return { success: true };
  } catch (e: any) {
    console.error("Erro ao salvar aula no Supabase:", e);
    return { success: false, error: e?.message };
  }
}

export async function deleteLessonFromDb(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) {
      console.error("Erro ao remover aula do Supabase:", error);
      return { success: false, error: error.message };
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("up_modules_updated"));
    }

    return { success: true };
  } catch (e: any) {
    console.error("Erro ao remover aula do Supabase:", e);
    return { success: false, error: e?.message };
  }
}
