import NavbarStats from "@/component/performance-navbar-stats";
import PerformanceOverview from "./performance-overview";

const GradesProgress = () => {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col gap-4 overflow-y-auto rounded-md border border-white/70 bg-white/55 p-3 backdrop-blur-xl transition-all duration-300 md:p-5 lg:p-6">
      <h2 className="text-lg font-bold text-slate-800">Grades & Progress</h2>
      <NavbarStats />
      <PerformanceOverview />
    </div>
  );
};

export default GradesProgress;
