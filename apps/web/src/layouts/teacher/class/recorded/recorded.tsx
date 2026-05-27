// import RecordedAppbar from "@/pages/teacher/recorded/recorded-bar"
import { MobileTeacherNav } from "@/pages/teacher/dashboard/side-bar"
import { useState } from "react";
import { Outlet } from "react-router-dom"

const RecordedLayout = () => {
    const[mobileNavOpen, setMobileNavOpen] = useState(false);
    return (
        <div>
            <div>
                <MobileTeacherNav isOpen={mobileNavOpen} setIsOpen={setMobileNavOpen} />
            </div>
            <div>
                <Outlet context={{ openMobileNav: () => setMobileNavOpen(true) }} />
            </div>
        </div>
    )
}

export default RecordedLayout