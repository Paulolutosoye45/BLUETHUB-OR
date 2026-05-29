// AdminLayout.tsx
import SchoolRef from "@/component/school-ref";
import SideBar, { MobileNav } from "@/pages/admin/side-bar";
import { useState } from "react";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex h-full shrink-0">
        <SideBar />
      </aside>

      <div>
        <MobileNav isOpen={mobileNavOpen} setIsOpen={setMobileNavOpen} />
      </div>

      {/* ── Main scrollable content ── */}
      <main
        className="flex-1 overflow-y-auto bg-[#9C94AB40]
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-gray-400"
      >
        <SchoolRef mode="wallpaper" className="min-h-full">
          <div className="max-w-7xl mx-auto  md:p-4 lg:p-6 transition-all duration-300">
            <Outlet context={{ openMobileNav: () => setMobileNavOpen(true) }} />
          </div>
        </SchoolRef>
      </main>

    </div>
  );
};

export default AdminLayout;