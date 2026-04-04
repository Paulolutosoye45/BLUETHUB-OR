import TitleBar from "@/shared/title-bar"
import { Outlet } from "react-router-dom"

const CourseLayout = () => {
    return (
        <div className="p-4">
            <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">
                <TitleBar
                    title="Register Course"
                />
                <div className="flex-1 py-8 min-h-screen bg-white/70 backdrop-blur-sm">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default CourseLayout