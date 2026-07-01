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
  progress?: number;
  lessonsCompleted?: number;
  topicsRemaining?: number;
}

function CourseHero({
  department = "SCIENCE DEPARTMENT",
  title = "Basic Science",
  teacher = "Mr. Emeka Nwosu",
  icon = "🔬",
  topics = 6,
  lessons = 18,
  pdfs = 5,
  quizzes = 8,
  progress = 50,
  lessonsCompleted = 7,
  topicsRemaining = 3,
}: CourseHeroProps) {
  return (
    <div>
      {/* Hero Banner */}
      <div className="relative bg-[#4F61E8] px-6 pt-8 pb-16 overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute right-0 top-0 w-52 h-52 rounded-full bg-white/10 translate-x-10 -translate-y-10" />

        {/* Subject icon */}
        <div className="absolute right-6 top-6 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl z-10">
          {icon}
        </div>

        {/* Text */}
        <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-2">
          {department}
        </p>
        <h1 className="text-white text-xl font-extrabold mb-1">{title}</h1>
        <p className="text-white/80 text-sm mb-6">{teacher}</p>

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

         {/* Progress Card — overlaps the banner */}
      <div className=" mt-5 mx-2 rounded-2xl bg-white shadow-md py-4 px-3 border ">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-800">Course progress</span>
          <span className="text-sm font-bold text-[#4F61E8]">{progress}%</span>
        </div>
        {/* Bar */}
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#4F61E8] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">
          {lessonsCompleted} of {lessons} lessons completed · {topicsRemaining} topics remaining
        </p>
      </div>
    </div>
  );
}

export default CourseHero;