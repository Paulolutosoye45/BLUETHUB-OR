;
import StudentSideBar, { MobileStudentNav } from "@/pages/student/component/side-bar";
import { useState } from "react";
import { Outlet } from "react-router-dom";

const StudentsLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex h-full">
        <StudentSideBar />
      </div>
      <div>
        <MobileStudentNav isOpen={mobileNavOpen} setIsOpen={setMobileNavOpen} />
      </div>
      <div className="max-w-7xl mx-auto h-screen transition-all p-2 duration-300 border-none  overflow-y-auto">
        <Outlet context={{ openMobileNav: () => setMobileNavOpen(true) }} />
      </div>
    </div>
  );
};

export default StudentsLayout;
