import { Users, GraduationCap, BookOpen, School, Video } from "lucide-react";

const stats = [
  {
    label: "Total Students",
    value: "1,240",
    change: "+12%",
    positive: true,
    icon: GraduationCap,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    accent: "text-blue-600",
  },
  {
    label: "Total Teachers",
    value: "86",
    change: "+3%",
    positive: true,
    icon: Users,
    bg: "bg-chestnut/10",
    iconColor: "text-chestnut",
    accent: "text-chestnut",
  },
  {
    label: "Active Classes",
    value: "24",
    change: "This term",
    positive: null,
    icon: School,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    accent: "text-emerald-600",
  },
  {
    label: "Subjects",
    value: "38",
    change: "+2 new",
    positive: true,
    icon: BookOpen,
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    accent: "text-violet-600",
  },
  {
    label: "Live Lessons",
    value: "5",
    change: "Today",
    positive: null,
    icon: Video,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    accent: "text-amber-600",
  },
];

const SchoolProgress = () => {
  return (
    <section className="font-poppins mb-6">
      {/* mobile: horizontal scroll carousel → sm: 2-col → md: 3-col → lg: 5-col */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-[13px] p-4 shadow-sm border border-gray-100 flex flex-col gap-3"
            >
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <Icon className={stat.iconColor} size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-none">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
              <p className={`text-[11px] font-medium ${stat.positive === true ? "text-emerald-600"
                  : stat.positive === false ? "text-red-500"
                    : "text-gray-400"
                }`}>
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SchoolProgress;
