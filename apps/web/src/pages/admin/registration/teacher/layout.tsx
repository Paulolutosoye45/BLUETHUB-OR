import { Outlet } from "react-router-dom"
import { MobileNav } from "../../side-bar"
import { useState } from "react";

const Teacherlayout = () => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    return (
        <div>
            <div>
                <MobileNav isOpen={mobileNavOpen} setIsOpen={setMobileNavOpen} />
            </div>
            <div className="flex-1 overflow-hidden">
                <Outlet context={{ openMobileNav: () => setMobileNavOpen(true) }} />
            </div>
        </div>
    )
}

export default Teacherlayout