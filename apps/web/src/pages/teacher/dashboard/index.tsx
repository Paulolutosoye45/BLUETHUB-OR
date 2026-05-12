import Activity from "@/pages/teacher/dashboard/activity"
import Recordedclass from "@/pages/teacher/dashboard/recorded-class"
import { EllipsisVertical } from "lucide-react"
import TeacherAppBar from "@/pages/teacher/dashboard/teacher-app-bar"
import TodayClasses from "./today-classes"
import AssessmentSubmissions from "./assessment-submissions"
import PendingReviews from "./pending-reviews"
import UpcomingDeadlines from "./upcoming-deadlines"


const TeacherDashboard = () => {
  return (
    <div className="">
      <div className="rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 bg-chestnut">
          <h3 className="text-white font-semibold text-sm">Dashboard</h3>
          <button className="text-white">
            <EllipsisVertical size={18} />
          </button>
        </div>

        <div className="bg-white p-2 space-y-4 pb-4">
          <TeacherAppBar />
          <Activity />

          <div className="flex gap-4">
            {/* Left column */}
            <div className="space-y-4 flex-1">
              <TodayClasses />
              <AssessmentSubmissions />
            </div>

            {/* Right column */}
            <div className="space-y-4 shrink-0">
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