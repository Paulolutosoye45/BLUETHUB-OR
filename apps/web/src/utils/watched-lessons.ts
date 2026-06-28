const STORAGE_KEY = "bluethub-watched-lessons";

const getWatched = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const markLessonWatched = (lessonId: string) => {
  const watched = getWatched();
  if (!watched.includes(lessonId)) {
    watched.push(lessonId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
  }
};

export const isLessonWatched = (lessonId: string): boolean => {
  return getWatched().includes(lessonId);
};
