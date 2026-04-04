import Activity from "@/pages/teacher/dashboard/activity"
import RecentActivity from "@/pages/teacher/dashboard/recent-activity"
import Recordedclass from "@/pages/teacher/dashboard/recorded-class"
import Assignment from "@/pages/teacher/dashboard/table"
import TeacherAppBar from "@/pages/teacher/dashboard/teacher-app-bar"


const TeacherDashboard = () => {
  return (
    <div className="min-h-screen px-4 py-6 ">
      <TeacherAppBar />
      {/* Top summary cards */}
      <div className="mt-6">
        <Activity />
      </div>

      {/* Recorded Class & Assignment Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        <Recordedclass />
        <Assignment />
      </div>

      {/* Recent Activity */}
      <div className="mt-4">
        <RecentActivity />
      </div>
    </div>
  )
}

export default TeacherDashboard