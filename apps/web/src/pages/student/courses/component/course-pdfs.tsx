import { Download, FileText } from "lucide-react";
import type { StudentLessonMedia, StudentPublishedLesson } from "@/services/student";

function isPdf(media: StudentLessonMedia): boolean {
  return /pdf/i.test(media.mediaType ?? "") || /pdf/i.test(media.fileExtension ?? "");
}

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

interface PdfEntry {
  key: string;
  title: string;
  subtitle: string;
  url: string;
}

const CoursePDFs = ({ lessons }: { lessons: StudentPublishedLesson[] }) => {
  const files: PdfEntry[] = lessons.flatMap((lesson) =>
    (lesson.media ?? [])
      .filter(isPdf)
      .map((m, idx) => ({
        key: `${lesson.id}-${m.mediaId ?? m.lessonContentId ?? idx}`,
        title: m.mediaName || `${lesson.topicName} — ${lesson.subTopic}`,
        subtitle: [lesson.teacherName, formatSize(m.fileSizeBytes)].filter(Boolean).join(" · "),
        url: m.url,
      }))
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-800">
            Study Materials &amp; PDFs
          </h2>
          <span className="text-sm font-semibold text-amber-500">
            {files.length} File{files.length === 1 ? "" : "s"}
          </span>
        </div>

        {files.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <FileText className="w-8 h-8 text-slate-300" />
            <p className="text-sm text-slate-400">No PDF materials uploaded for this subject yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <a
                key={file.key}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm hover:shadow transition"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500">
                  <span className="text-xs font-bold text-white">PDF</span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {file.title}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {file.subtitle}
                  </p>
                </div>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-400">
                  <Download size={16} strokeWidth={2.5} />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursePDFs
