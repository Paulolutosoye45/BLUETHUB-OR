import NavbarStats from "@/component/performance-navbar-stats";
import PerformanceOverview from "./performance-overview";

const AdminAnalytics = () => {
  return (
    <div className="font-poppins w-full">
      <div className="backdrop-blur-sm lg:rounded-2xl border border-white/20 overflow-hidden">
        <div className="flex items-center px-5 h-14 bg-chestnut">
          <span className="text-white font-semibold text-base">School Analytics</span>
        </div>
        <div className="flex flex-col gap-4 p-4 md:p-6 bg-white/70 backdrop-blur-sm">
          <NavbarStats />
          <PerformanceOverview />
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
