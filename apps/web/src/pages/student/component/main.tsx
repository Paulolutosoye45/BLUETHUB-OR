import StudentAppBar from "./app-bar";
import Assignment from "./assignment";
import ExtracurricularActivity from "./extra-curricular-activity";
import MyCourse from "./my-course";
import Notification from "./notification";
import QuickAction from "./quick-action";
import UpcomingClass from "./up-coming-class";


const StudentIndex = () => {
  return (
    <div
      className="px-2 h-screen transition-all duration-300 border-none 
  overflow-y-auto 
  [&::-webkit-scrollbar]:w-1
  [&::-webkit-scrollbar]:h-2.5 
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-400
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
    >
      <StudentAppBar />
      <ExtracurricularActivity />

      {/* Main Content Section */}
      <section className="flex flex-col lg:flex-row gap-4 my-6">
        {/* Left Section */}
        <div className="flex-3 space-y-6 min-w-0">
          <MyCourse />
          <Assignment />
        </div>

        {/* Right Sidebar */}
        <aside className="flex-[1.2] space-y-6 min-w-70">
          <UpcomingClass />
          <Notification />
          <QuickAction />
        </aside>
      </section>
    </div>
  );
};

export default StudentIndex;
