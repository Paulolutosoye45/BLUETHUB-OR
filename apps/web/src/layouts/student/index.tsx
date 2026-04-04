;
import StudentSideBar from "@/pages/student/component/side-bar";
import { Outlet } from "react-router-dom";

const StudentsLayout = () => {
  return (
    <section className="flex h-screen overflow-hidden">
      <div className="shrink-0 z-20">
        <StudentSideBar />
      </div>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </section>
  );
};

export default StudentsLayout;
