import { Menu } from "lucide-react";

export function StudentMobileHeader({
  studentName,
  className,
  initials,
  openMobileNav,
  stats,
}: {
  studentName: string;
  className: string;
  initials: string;
  openMobileNav: () => void;
  stats: { classesLeft: number; quizzesDue: number; assignments: number };
}) {
  const firstName = studentName.split(" ")[0];

  const today = new Date();

  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="md:hidden rounded-md bg-gradient-to-r from-[#3246c5] via-[#4F61E8] to-[#6e7df0] px-4 pt-4 pb-6">
      {/* Top nav row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="rounded-full bg-white/15 p-2"
          onClick={openMobileNav}
        >
          <Menu className="text-white w-5 h-5" />
        </button>
        <div className="flex items-center  gap-[5px]">

          <div>
            <h2 className="text-white font-semibold text-sm leading-[16px]">
              {studentName}
            </h2>
            <h4 className="font-medium text-[10px] leading-[14px] text-white/70">
              {className}
            </h4>
          </div>
        </div>

        <div className="flex items-center justify-center h-[38px] w-[38px] rounded-full bg-white/15 uppercase text-white font-semibold text-xs leading-5">
          {initials}
        </div>
      </div>

      {/* Hero card */}
      <div className="mt-4 rounded-[16px] bg-white/10 px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-1">
          This Week
        </p>
        <p className="text-white font-bold text-lg leading-snug">
          {greeting()}, {firstName}!👋
        </p>

        {/* Stat pills */}
        <div className="flex flex-wrap   gap-2 mt-3">
          <span className="rounded-full bg-white/20 px-3 py-1 text-white text-xs font-medium">
            {stats.classesLeft} classes left
          </span>
          <span className="rounded-full bg-[#F5A623] px-3 py-1 text-white text-xs font-medium">
            {stats.quizzesDue} quizzes due
          </span>
          <span className="rounded-full bg-[#E85D75] px-3 py-1 text-white text-xs font-medium">
            {stats.assignments} assignments
          </span>
        </div>
      </div>
    </div>
  );
}