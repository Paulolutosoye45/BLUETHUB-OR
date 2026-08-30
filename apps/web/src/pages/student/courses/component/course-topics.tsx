import AllTopics from "./all-topics"
import type { CoursesTopic } from "./topic-card";
import type { StudentLessonMedia, StudentPublishedLesson } from "@/services/student";

function inferMediaType(media: StudentLessonMedia[] = []): "Video" | "Reading" | "PDF" {
  if (media.some((m) => /video/i.test(m.mediaType ?? "") || /mp4|mov|webm|mkv/i.test(m.fileExtension ?? "")))
    return "Video";
  if (media.some((m) => /pdf/i.test(m.mediaType ?? "") || /pdf/i.test(m.fileExtension ?? "")))
    return "PDF";
  return "Reading";
}

// We don't have a "watched" signal for lesson content in this endpoint — every
// topic/subtopic is rendered as Not Started rather than inventing progress.
function buildTopics(lessons: StudentPublishedLesson[]): CoursesTopic[] {
  const byTopic = new Map<string, StudentPublishedLesson[]>();
  lessons.forEach((lesson) => {
    const key = lesson.topicId || lesson.topicName || "untitled";
    if (!byTopic.has(key)) byTopic.set(key, []);
    byTopic.get(key)!.push(lesson);
  });

  return Array.from(byTopic.entries()).map(([topicId, topicLessons]) => ({
    id: topicId,
    title: topicLessons[0].topicName || "Untitled Topic",
    icon: "📘",
    iconBg: "bg-indigo-50",
    subtopicCount: topicLessons.length,
    status: "Not Started" as const,
    progress: 0,
    subtopics: topicLessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.subTopic || lesson.subTopicName || "Lesson",
      type: inferMediaType(lesson.media),
      done: false,
    })),
  }));
}

const CourseTopics = ({ lessons }: { lessons: StudentPublishedLesson[] }) => {
  const topics = buildTopics(lessons);
  return (
    <div className="min-h-screen">
      <AllTopics topics={topics} totalLessons={lessons.length} />
    </div>
  )
}

export default CourseTopics
