import { Plus, University } from "lucide-react";

interface HeroStat {
  value: string;
  label: string;
}

const STATS: HeroStat[] = [
  { value: "248",    label: "Schools"  },
  { value: "41.2K", label: "Students" },
  { value: "3,180", label: "Teachers" },
  { value: "₦12.4M",label: "MRR"     },
];

interface PanelHeroBannerProps {
  adminName?: string;
  date?: string;
  subtitle?: string;
  onRegisterSchool?: () => void;
}

export function PanelHeroBanner({
  onRegisterSchool,

}: PanelHeroBannerProps) {

   const today = new Date();

  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };
  return (
    <div className="relative font-space-grotesk bg-gradient-to-br from-[#1a1d2e] via-[#292382] to-[#4F61E8] rounded-2xl px-6 py-[28px] overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute right-0 top-0 w-56 h-56 rounded-full bg-white/5 translate-x-20 -translate-y-16 pointer-events-none" />
      <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-white/5 translate-y-10 pointer-events-none" />

      <div className="flex items-center justify-between gap-4 relative z-10 font-space-grotesk">
        <div>
          {/* Eyebrow */}
          <p className="text-white/40 text-[10px] font-space-grotesk font-semibold tracking-widest uppercase mb-1">
            Bluetthub Admin Console · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h2 className="text-white text-xl font-extrabold mb-0.5 font-space-grotesk">
            {greeting()}, Super Admin 👋
          </h2>
          <p className="text-white/50 text-xs mb-5 font-space-grotesk">Platform is healthy · 248 active schools · 14 new registrations this week</p>

          {/* Stats row */}
          <div className="grid grid-cols-4 bg-[#00000033] border border-[#FFFFFF14]">
            {STATS.map((s) => (
              <div key={s.label} className="border-r border-[#FFFFFF1A] py-[20px] px-5">
                <p className="text-white font-extrabold text-base leading-none font-space-grotesk">{s.value}</p>
                <p className="text-white/40 text-[10px] mt-0.5 font-space-grotesk">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-[20px] flex-shrink-0">
          <button
            onClick={onRegisterSchool}
            className="flex items-center border border-[#FFFFFF26] font-space-grotesk gap-1.5 bg-[#FFFFFF26] text-white font-semibold text-xs px-4 py-2.5 rounded-md cursor-pointer transition-colors whitespace-nowrap"
          >
            <Plus size={13} className="font-space-grotesk" /> Register New School
          </button>
          <div className="w-[74px] h-[74px] border border-[#FFFFFF2E] rounded-full bg-[#FFFFFF26] flex items-center justify-center text-xl">
            <University className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}