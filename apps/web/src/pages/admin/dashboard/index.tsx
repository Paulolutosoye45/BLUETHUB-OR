// AdminDashboard.tsx
import { Bell, EllipsisVertical, Menu } from "lucide-react";
import AdminAppbar from "./app-bar";
import Charts from "./charts";
import SchoolProgress from "./school-progress";
import { SchoolAtAGlance } from "./component/school-at-a-glance";
import { RecentActivity } from "./component/recent-activity";
import { PendingLessonApprovals } from "./component/pending-lesson-approvals";
import { MobileNav } from "../side-bar";
import { useState } from "react";

const AdminDashboard = () => {
  const [isOpen, setIsOpen]= useState(false)
  return (
    <div className="font-poppins w-full">
      <MobileNav isOpen={isOpen} setIsOpen={setIsOpen}/>
      <div className="backdrop-blur-sm md:rounded-2xl border border-white/20 overflow-hidden">

        {/* ── Top Nav ── */}
        <div className="flex items-center justify-between px-5 h-14 bg-chestnut">
          <div className="flex gap-2 items-center">
            <Menu className="lg:hidden text-white" onClick={() => setIsOpen(true)} />
            <span className="text-white font-semibold text-base">Dashboard</span>
          </div>
          <EllipsisVertical className="text-white hidden md:block" />
          <div className="flex gap-[3px] md:hidden items-center justify-between ">
             <div className="w-full h-full px-2.5 py-2 rounded-full flex items-center justify-center bg-[#FFFFFF80]">
              <span className="text-white font-medium text-xs leading-5">Co</span>
             </div>
             <div className="w-full h-full p-2 rounded-full flex items-center justify-center bg-white">
              <Bell className="text-chestnut" />
             </div>
          </div>

        </div>

        {/* ── Page Body ── */}
        <div className="flex flex-col gap-4 p-4 md:p-6 bg-white/70 backdrop-blur-sm">
          <AdminAppbar />
          <SchoolProgress />
          <Charts />

          {/* ── Bottom section: stacked on mobile, side-by-side on md+ ── */}
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="w-full lg:flex-1 min-w-0">
              <PendingLessonApprovals />
            </div>
            <div className="flex flex-col gap-4 w-full lg:w-[38%] lg:shrink-0">
              <SchoolAtAGlance />
              <RecentActivity />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;