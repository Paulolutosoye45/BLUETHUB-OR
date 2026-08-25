// AdminLayout.tsx
import SchoolRef from "@/component/school-ref";
import SideBar, { MobileNav } from "@/pages/admin/side-bar";
import type { schoolInfo } from "@/services";
import { localData } from "@/utils";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  useEffect(() => {
    const schLogo: schoolInfo | null = localData.retrieve("schoolInfo");
    if(!schLogo?.logoUrl) {
        navigate("/admin/school-branding")
    }
  }, [])
  
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
          <div className="">
            <Outlet context={{ openMobileNav: () => setMobileNavOpen(true) }} />
          </div>
        </SchoolRef>
      </main>

    </div>
  );
};

export default AdminLayout;