import Activity from "@/pages/teacher/dashboard/activity"
import Recordedclass from "@/pages/teacher/dashboard/recorded-class"
import { Menu } from "lucide-react"
import TeacherAppBar from "@/pages/teacher/dashboard/teacher-app-bar"
import TodayClasses from "./today-classes"
import AssessmentSubmissions from "./assessment-submissions"
import PendingReviews from "./pending-reviews"
import UpcomingDeadlines from "./upcoming-deadlines"
import PendingUploadsCard from "./pending-uploads-card"
import { useOutletContext } from "react-router-dom";
import NavbarStats from "@/component/performance-navbar-stats";
import PerformanceOverview from "./performance-overview";


const TeacherDashboard = () => {

  const { openMobileNav } = useOutletContext<{ openMobileNav: () => void }>();
  return (
    <div className="">
      <div className="lg:rounded-2xl overflow-hidden">
        <div className="flex lg:hidden items-center justify-between px-4 py-2 bg-chestnut">
          <div className="flex gap-2 items-center">
            <Menu className="lg:hidden text-white" onClick={openMobileNav} />
            <span className="text-white font-medium md:py-2 text-sm">Dashboard</span>
          </div>
        </div>

        <div className="bg-white p-3 md:p-4 space-y-2 pb-2">
          <TeacherAppBar />
          <NavbarStats />
          <PendingUploadsCard />
          <Activity />
          <PerformanceOverview />

          <div className="flex flex-col lg:flex-row gap-2">
            {/* Left column */}
            <div className="space-y-2 flex-1">
              <TodayClasses />
              <AssessmentSubmissions />
            </div>

            {/* Right column */}
            <div className="space-y-2 lg:w-[30%] shrink-0">
              <PendingReviews />
              <Recordedclass />
              <UpcomingDeadlines />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard