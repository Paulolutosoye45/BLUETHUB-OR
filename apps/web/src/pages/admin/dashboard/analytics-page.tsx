import SchoolProgress from "./school-progress";
import { TeacherActivity } from "./component/teacher-activity";
import { ClassroomPerformance } from "./component/classroom-performance";
import Charts from "./charts";

const AdminAnalytics = () => {
  return (
    <div className="font-poppins w-full">
      <div className="backdrop-blur-sm lg:rounded-2xl border border-white/20 overflow-hidden">
        <div className="flex items-center px-5 h-14 bg-chestnut">
          <span className="text-white font-semibold text-base">School Analytics</span>
        </div>
        <div className="flex flex-col gap-4 p-4 md:p-6 bg-white/70 backdrop-blur-sm">
          <SchoolProgress />
          <TeacherActivity />
          <Charts />
          <ClassroomPerformance />
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
