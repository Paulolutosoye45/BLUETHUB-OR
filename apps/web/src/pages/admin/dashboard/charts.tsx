import { TrendingUp, BookCheck, ClipboardList, Award } from "lucide-react";

// Enrollment trend data (last 6 months)
const enrollmentData = [
  { month: "Nov", students: 980 },
  { month: "Dec", students: 1020 },
  { month: "Jan", students: 1080 },
  { month: "Feb", students: 1110 },
  { month: "Mar", students: 1190 },
  { month: "Apr", students: 1240 },
];

const maxStudents = Math.max(...enrollmentData.map((d) => d.students));

// Subject performance
const subjectPerformance = [
  { subject: "Mathematics", score: 78, color: "bg-chestnut" },
  { subject: "English", score: 85, color: "bg-blue-500" },
  { subject: "Basic Science", score: 72, color: "bg-emerald-500" },
  { subject: "French", score: 60, color: "bg-violet-500" },
  { subject: "Social Studies", score: 68, color: "bg-amber-500" },
];

// Recent activity
const recentActivity = [
  {
    icon: BookCheck,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Lesson approved",
    desc: "Introduction to Algebra — JSS 2A",
    time: "2 hrs ago",
  },
  {
    icon: ClipboardList,
    iconBg: "bg-chestnut/10",
    iconColor: "text-chestnut",
    title: "New syllabus submitted",
    desc: "Biology Term 2 — SSS 1A",
    time: "5 hrs ago",
  },
  {
    icon: Award,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Assessment completed",
    desc: "End-of-term quiz — JSS 3B",
    time: "Yesterday",
  },
  {
    icon: TrendingUp,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    title: "Enrollment milestone",
    desc: "1,240 students this term",
    time: "2 days ago",
  },
];

const Charts = () => {
  return (
    <section className="font-poppins space-y-3">
      {/* Top row: enrollment chart + subject performance */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">

        {/* Enrollment bar chart — takes 3/5 */}
        <div className="md:col-span-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-900">Student Enrollment</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              +26.5%
            </span>
          </div>

          {/* Bar chart */}
          <div className="flex items-end justify-between gap-2 h-36">
            {enrollmentData.map((d) => {
              const heightPct = Math.round((d.students / maxStudents) * 100);
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-gray-500 font-medium">{d.students >= 1000 ? `${(d.students / 1000).toFixed(1)}k` : d.students}</span>
                  <div className="w-full rounded-t-lg bg-chestnut/15 relative overflow-hidden" style={{ height: "96px" }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-chestnut rounded-t-lg transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject performance — takes 2/5 */}
        <div className="md:col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-900">Subject Performance</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Average scores this term</p>
          </div>
          <div className="space-y-3.5">
            {subjectPerformance.map((s) => (
              <div key={s.subject}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 font-medium">{s.subject}</span>
                  <span className="text-xs font-semibold text-gray-700">{s.score}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${s.color} transition-all duration-500`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: recent activity */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-[11px] text-chestnut font-medium hover:underline">View all</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {recentActivity.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{item.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">{item.desc}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Charts;
