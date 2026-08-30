import { FileText, Plus, Star, Timer } from "lucide-react";

interface CourseHeroProps {
  department?: string;
  title?: string;
  teacher?: string;
  icon?: string;
  topics?: number;
  lessons?: number;
  pdfs?: number;
  quizzes?: number;
}

function CourseHero({
  department = "",
  title = "Subject",
  teacher = "",
  icon = "📚",
  topics = 0,
  lessons = 0,
  pdfs = 0,
  quizzes = 0,
}: CourseHeroProps) {
  return (
    <div>
      {/* Hero Banner */}
      <div className="relative bg-[#4F61E8] px-6 pt-8 pb-8 overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute right-0 top-0 w-52 h-52 rounded-full bg-white/10 translate-x-10 -translate-y-10" />

        {/* Subject icon */}
        <div className="absolute right-6 top-6 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl z-10">
          {icon}
        </div>

        {/* Text */}
        {department && (
          <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-2">
            {department}
          </p>
        )}
        <h1 className="text-white text-xl font-extrabold mb-1">{title}</h1>
        {teacher && <p className="text-white/80 text-sm mb-6">{teacher}</p>}

        {/* Stat pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: <Plus size={14} />, label: `${topics} Topics` },
            { icon: <Timer size={14} />, label: `${lessons} Lessons` },
            { icon: <FileText size={14} />, label: `${pdfs} PDFs` },
            { icon: <Star size={14} />, label: `${quizzes} Quizzes` },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/40 text-white text-sm font-medium bg-white/10 backdrop-blur"
            >
              {icon}
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CourseHero;