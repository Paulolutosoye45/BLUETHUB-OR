import SchoolRef from "@/component/school-ref"
import SideBar, { MobileNav } from "@/pages/admin/side-bar"
// import AdminTabMenu from "@/pages/admin/tab-menu"
// import schoolImage from "@/assets/png/School.png"
import { Outlet } from "react-router-dom"

const AdminLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* ── Desktop sidebar ─────────────────────── */}
            <div className="hidden lg:flex h-full">
                <SideBar />
            </div>
            <div>
                <MobileNav />
            </div>

            {/* ── Main content ────────────────────────── */}
            <div
                className="flex flex-col flex-1 m bg-[#9C94AB40]
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-gray-400"
            >
                <div className=" overflow-y-auto">
                    <SchoolRef
                        className="min-h-full"
                        contentClassName=""
                        mode="wallpaper"
                    >
                        <div className="max-w-7xl mx-auto h-screen transition-all p-2 duration-300 border-none  overflow-y-auto ">
                            <Outlet />
                        </div>
                    </SchoolRef>
                </div>
            </div>

            {/* ── Mobile drawer + FAB (rendered outside flex row so it overlays) ── */}

        </div>
    );
};

export default AdminLayout;