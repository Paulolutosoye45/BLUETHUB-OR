import TitleBar from "@/shared/title-bar"
import { Outlet } from "react-router-dom"

const StudenLayout = () => {
    return (
        <div className="p-4">
            <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">
                <TitleBar
                    title="Student Details"
                    linkBtn="Edit Profile"
                    linkBtnLink="edit"
                />
                <div className="flex-1 p-8 min-h-screen bg-white/70 backdrop-blur-sm">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default StudenLayout