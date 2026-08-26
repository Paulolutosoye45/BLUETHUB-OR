import { useState } from "react";
import { Outlet } from "react-router-dom";
import ParentSideBar, { MobileParentNav, ParentMobileMenuButton } from "@/pages/parent/component/side-bar";
import { ParentChildrenProvider } from "@/contexts/parent-children-context";

const ParentLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <ParentChildrenProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <ParentSideBar />
        <MobileParentNav isOpen={mobileNavOpen} setIsOpen={setMobileNavOpen} />

        <div className="flex-1 h-screen overflow-y-auto">
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-30">
            <ParentMobileMenuButton onClick={() => setMobileNavOpen(true)} />
            <span className="text-sm font-semibold text-[#12122A]">Bluethub</span>
          </div>
          <Outlet context={{ openMobileNav: () => setMobileNavOpen(true) }} />
        </div>
      </div>
    </ParentChildrenProvider>
  );
};

export default ParentLayout;
