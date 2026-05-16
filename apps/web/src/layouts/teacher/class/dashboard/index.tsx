import SchoolRef from "@/component/school-ref"
// import { MobileNav } from "@/pages/admin/side-bar"
import TeacherSidebar, { MobileTeacherNav } from "@/pages/teacher/dashboard/side-bar"
import { useState } from "react";
import { Outlet } from "react-router-dom"

const TeacherLayout = () => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    return (
        <div className="flex h-screen overflow-hidden">
            <div className="hidden lg:flex h-full">
                <TeacherSidebar />
            </div>
            <div>
                <MobileTeacherNav isOpen={mobileNavOpen} setIsOpen={setMobileNavOpen} />
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
                    <div className="max-w-7xl mx-auto h-screen transition-all p-2 duration-300 border-none  overflow-y-auto">
                        <Outlet context={{ openMobileNav: () => setMobileNavOpen(true) }} />
                    </div>
                </SchoolRef>
            </div>
        </div>
    )
}

export default TeacherLayout