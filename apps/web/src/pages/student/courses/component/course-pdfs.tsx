
import { Download } from "lucide-react";

type FileItem = {
  id: string;
  icon: "PDF";
  iconBg: string;
  title: string;
  subtitle: string;
};

const files: FileItem[] = [
  {
    id: "1",
    icon: "PDF",
    iconBg: "bg-amber-400",
    title: "Topic 1 — Living Things Notes",
    subtitle: "Mr. Emeka Nwosu  ·  1.2 MB  ·  14 pages",
  },
  {
    id: "2",
    icon: "PDF",
    iconBg: "bg-green-700",
    title: "Solar System  — Diagram Guide",
    subtitle: "Mr. Emeka Nwosu  ·  1.2 MB  ·  14 pages",
  },
  {
    id: "3",
    icon: "PDF",
    iconBg: "bg-indigo-500",
    title: "Matter & Materials — Full Notes",
    subtitle: "Mr. Emeka Nwosu  ·  1.6 MB  ·  18 pages",
  },
  {
    id: "4",
    icon: "PDF",
    iconBg: "bg-rose-500",
    title: "Past Questions — Basic Science 2026",
    subtitle: "Exam Prep  ·  3.1 MB  ·  24 pages",
  },
  {
    id: "5",
    icon: "PDF",
    iconBg: "bg-green-700",
    title: "Environment & Body Systems Notes",
    subtitle: "Mr. Emeka Nwosu  ·  1.9 MB  ·  20 pages",
  },
];

const CoursePDFs = () => {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-800">
            Study Materials &amp; PDFs
          </h2>
          <span className="text-sm font-semibold text-amber-500">
            5 Files
          </span>
        </div>

        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${file.iconBg}`}
              >
                <span className="text-xs font-bold text-white">
                  {file.icon}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {file.title}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {file.subtitle}
                </p>
              </div>

              <button
                type="button"
                aria-label={`Download ${file.title}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-400 transition hover:bg-indigo-200"
              >
                <Download size={16} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CoursePDFs