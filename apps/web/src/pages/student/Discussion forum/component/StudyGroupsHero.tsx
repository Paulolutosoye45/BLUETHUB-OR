import { Plus } from "lucide-react";

interface StudyGroupsHeroProps {
  studentName?: string;
  track?: string;
  active?: number;
  dueToday?: number;
  avgScore?: number;
  done?: number;
  onCreateForum?: () => void;
}

function StudyGroupsHero({
  studentName = "Adaeze Okafor",
  track = "SS2 Science Track",
  active = 3,
  dueToday = 2,
  avgScore = 76,
  done = 8,
  onCreateForum,
}: StudyGroupsHeroProps) {
  const stats = [
    { value: active, label: "Active" },
    { value: dueToday, label: "Due Today" },
    { value: `${avgScore}%`, label: "Avg Score" },
    { value: done, label: "Done" },
  ];

  return (
    <div className="relative bg-[#4F61E8] rounded-2xl px-4 py-6 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/10 translate-x-16 -translate-y-10 pointer-events-none" />
      <div className="absolute right-16 bottom-0 w-32 h-32 rounded-full bg-white/10 translate-y-10 pointer-events-none" />

      {/* Eyebrow */}
      <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-2">
        {studentName} · {track}
      </p>

      {/* Title */}
      <h2 className="text-white text-2xl font-extrabold mb-1">
        Study Groups &amp; Forums
      </h2>
      <p className="text-white/70 text-sm mb-5 leading-relaxed">
        Create a group, invite classmates, solve problems together — and call your teacher when you're stuck.
      </p>

      {/* Stats */}
      <div className="flex gap-2 mb-5">
        {stats.map(({ value, label }) => (
          <div
            key={label}
            className="flex-1 bg-white/15 backdrop-blur rounded-xl px-3 py-3 text-center"
          >
            <p className="text-white font-extrabold text-lg leading-none">{value}</p>
            <p className="text-white/60 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onCreateForum}
        className="flex items-center gap-2 bg-white text-[#4F61E8] font-semibold text-sm px-5 py-3 rounded-full hover:bg-indigo-50 transition-colors"
      >
        <Plus size={16} />
        Create New Discussion Forum
      </button>
    </div>
  );
}

export default StudyGroupsHero;