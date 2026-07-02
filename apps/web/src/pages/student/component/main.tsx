import StudentAppBar from "./app-bar";
import Assignment from "./assignment";
import ExtracurricularActivity from "./extra-curricular-activity";
import MyCourse from "./my-course";
import Notification from "./notification";
import QuickAction from "./quick-action";
import UpcomingClass from "./up-coming-class";
// import NavbarStats from "@/component/performance-navbar-stats";
import PerformanceOverview from "./performance-overview";


const StudentIndex = () => {
  return (
    <div
      className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col space-y-4 overflow-y-auto rounded-md border border-white/70 bg-white/55 backdrop-blur-xl transition-all duration-300 md:p-3 lg:p-4
  [&::-webkit-scrollbar]:w-1
  [&::-webkit-scrollbar]:h-2.5 
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-slate-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-slate-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 "
    >
      <StudentAppBar />
      {/* <NavbarStats /> */}
      <ExtracurricularActivity />
      <PerformanceOverview />

      <section className="mt-3 grid  gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.92fr)]">
        <div className="space-y-4 min-w-0">
          <MyCourse />
          <Assignment />
        </div>

        <aside className="space-y-4 min-w-0">
          <UpcomingClass />
          <Notification />
          <QuickAction />
        </aside>
      </section>
    </div>
  );
};

export default StudentIndex;
