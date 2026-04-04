import SchoolRef from "@/component/school-ref"
import SideBar from "@/pages/admin/side-bar"
import { Outlet } from "react-router-dom"

const AdminLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <div>
                <SideBar />
            </div>
            <div className="flex-1 min-h-screen overflow-y-auto bg-[#9C94AB40]
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-400">

                <SchoolRef
                    className="min-h-full"
                    contentClassName=""
                    mode="wallpaper"
                >
                    <Outlet />
                </SchoolRef>
            </div>
        </div>
    )
}

export default AdminLayout