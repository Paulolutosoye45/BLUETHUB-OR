import { useState } from "react";
import { Outlet } from "react-router-dom"
import { MobileNav } from "../../side-bar";

const AdminLayout = () => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    return (
        <div>
            <div>
                <div>
                    <MobileNav isOpen={mobileNavOpen} setIsOpen={setMobileNavOpen} />
                </div>
                <div>
                    <Outlet context={{ openMobileNav: () => setMobileNavOpen(true) }} />
                </div>
            </div>
        </div>
    )
}

export default AdminLayout