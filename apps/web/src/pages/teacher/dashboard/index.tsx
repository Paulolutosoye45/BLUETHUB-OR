import Activity from "@/pages/teacher/dashboard/activity"
import Recordedclass from "@/pages/teacher/dashboard/recorded-class"
import { EllipsisVertical, Menu } from "lucide-react"
import TeacherAppBar from "@/pages/teacher/dashboard/teacher-app-bar"
import TodayClasses from "./today-classes"
import AssessmentSubmissions from "./assessment-submissions"
import PendingReviews from "./pending-reviews"
import UpcomingDeadlines from "./upcoming-deadlines"
import PendingUploadsCard from "./pending-uploads-card"
import { useState } from "react"


const TeacherDashboard = () => {
  const [_, setIsOpen]= useState(false)
  return (
    <div className="">
      <div className="lg:rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 bg-chestnut">
          <div className="flex gap-2 items-center">
            <Menu className="lg:hidden text-white" onClick={() => setIsOpen(true)} />
            <span className="text-white font-semibold text-base">Dashboard</span>
          </div>
          <button className="text-white">
            <EllipsisVertical size={18} />
          </button>
        </div>

        <div className="bg-white p-2 space-y-4 pb-4">
          <TeacherAppBar />
          <PendingUploadsCard />
          <Activity />

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left column */}
            <div className="space-y-4 flex-1">
              <TodayClasses />
              <AssessmentSubmissions />
            </div>

            {/* Right column */}
            <div className="space-y-4 lg:w-[30%] shrink-0">
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