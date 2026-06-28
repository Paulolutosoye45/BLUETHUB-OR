import NavbarStats from "@/component/performance-navbar-stats";
import PerformanceOverview from "./performance-overview";

const TeacherAnalytics = () => {
  return (
    <div>
      <div className="lg:rounded-2xl overflow-hidden">
        <div className="flex items-center px-6 py-5 bg-chestnut">
          <span className="text-white font-semibold text-base">My Analytics</span>
        </div>
        <div className="bg-white p-2 space-y-4 pb-4">
          <NavbarStats />
          <PerformanceOverview />
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalytics;
