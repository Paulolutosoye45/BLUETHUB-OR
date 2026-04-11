import SchoolRef from "@/component/school-ref"
import SideBar from "@/pages/admin/side-bar"
import AdminTabMenu from "@/pages/admin/tab-menu"
import schoolImage from "@/assets/png/School.png"
import { Outlet } from "react-router-dom"

const AdminLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar — desktop only (≥1024px) */}
            <div className="hidden lg:block">
                <SideBar />
            </div>

            {/* Main content column */}
            <div className="flex flex-col flex-1 min-h-screen overflow-hidden bg-[#9C94AB40]
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-400">

                {/* Tab menu — tablet only (768px – 1023px) */}
                <div className="block lg:hidden">
                    <AdminTabMenu schoolLogoUrl={schoolImage} />
                </div>

                <div className="flex-1 overflow-y-auto">
                    <SchoolRef
                        className="min-h-full"
                        contentClassName=""
                        mode="wallpaper"
                    >
                        <Outlet />
                    </SchoolRef>
                </div>
            </div>
        </div>
    )
}

export default AdminLayout