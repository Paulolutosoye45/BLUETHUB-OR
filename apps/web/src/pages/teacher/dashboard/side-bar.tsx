import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import bluethub from "@/assets/png/bluethub.png";
import arrowMenu from "@/assets/svg/arrow_menu_close.svg";
import arrowMenuOpen from "@/assets/svg/arrow_menu_open.svg";
import { useAuthContext } from "@/contexts/auth-context";
import { TACADEMICLINKS } from "@/shared/constant";
import { localData } from "@/utils";

const TeacherSidebar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthContext();
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const saved = localData.retrieve<boolean>("navVNextT");
        if (saved !== null) {
            setIsCollapsed(saved);
        }
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            localData.save("navVNextT", next);
            return next;
        });
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <aside
            className={[
                "h-full bg-white border-r border-[#29238210] flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
                isCollapsed ? "w-[68px]" : "w-[252px]",
            ].join(" ")}
        >
            <div
                className={[
                    "flex items-center px-4 py-4 border-b border-[#29238210] shrink-0",
                    isCollapsed ? "justify-center" : "justify-between",
                ].join(" ")}
            >
                {!isCollapsed && (
                    <div className="flex items-center gap-2 min-w-0">
                        <img src={bluethub} alt="Bluethub" className="h-7 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-[#292382] opacity-60 truncate">
                                Teacher Portal
                            </p>
                            <p className="text-[13px] font-bold text-[#292382] truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                        </div>
                    </div>
                )}
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#29238210] transition-colors shrink-0"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <img
                        src={isCollapsed ? arrowMenuOpen : arrowMenu}
                        alt="toggle"
                        className="w-4 h-4"
                    />
                </button>
            </div>

            <div
                className="flex-1 overflow-y-auto overflow-x-hidden py-4
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-[#29238230]"
            >
                <section className="px-3">
                    <div className="space-y-1">
                        {TACADEMICLINKS.map((link, idx) => (
                            <NavLink
                                key={link.name + idx}
                                to={link.path}
                                end={link.path === "/teacher"}
                                className={({ isActive }) =>
                                    [
                                        "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer group",
                                        isActive
                                            ? "bg-[#292382] text-white"
                                            : "text-[#292382] hover:bg-[#29238210]",
                                        isCollapsed ? "justify-center" : "",
                                    ].join(" ")
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <img
                                            src={link.icons}
                                            alt={link.name}
                                            className={`w-[18px] h-[18px] shrink-0 object-contain ${isActive ? "brightness-0 invert" : "opacity-70 group-hover:opacity-100"}`}
                                        />
                                        {!isCollapsed && (
                                            <span className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-[#292382]"}`}>
                                                {link.name}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </section>
            </div>

            <div className="px-3 py-4 border-t border-[#29238210]">
                <button
                    type="button"
                    onClick={handleLogout}
                    className={[
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-red-500 hover:bg-red-50",
                        isCollapsed ? "justify-center" : "",
                    ].join(" ")}
                >
                    <span className="text-sm font-medium">{isCollapsed ? "Out" : "Log Out"}</span>
                </button>
            </div>
        </aside>
    );
};

type MobileTeacherNavProps = {
    isOpen: boolean;
    setIsOpen: (next: boolean) => void;
};

export const MobileTeacherNav = ({ isOpen, setIsOpen }: MobileTeacherNavProps) => {
    const navigate = useNavigate();
    const { logout } = useAuthContext();

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate("/");
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed left-5 top-3 z-40 w-12 h-12 rounded-2xl bg-[#292382] text-white flex items-center justify-center"
                aria-label="Open teacher navigation"
            >
                Menu
            </button>

            <div
                className={[
                    "lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-200",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
                ].join(" ")}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            <aside
                className={[
                    "lg:hidden fixed top-0 left-0 z-50 h-full w-[280px] bg-white border-r border-[#29238210] flex flex-col transition-transform duration-300",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
            >
                <div className="flex items-center justify-between px-4 py-4 border-b border-[#29238210]">
                    <img src={bluethub} alt="Bluethub" className="h-7" />
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="text-[#292382] text-sm font-semibold"
                    >
                        Close
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {TACADEMICLINKS.map((link, idx) => (
                        <NavLink
                            key={link.name + idx}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                [
                                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                                    isActive ? "bg-[#292382] text-white" : "text-[#292382] hover:bg-[#29238210]",
                                ].join(" ")
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <img
                                        src={link.icons}
                                        alt={link.name}
                                        className={`w-[18px] h-[18px] shrink-0 object-contain ${isActive ? "brightness-0 invert" : "opacity-70"}`}
                                    />
                                    <span className="text-sm font-medium truncate">{link.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                <div className="px-3 py-4 border-t border-[#29238210]">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-red-500 hover:bg-red-50"
                    >
                        <span className="text-sm font-medium">Log Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default TeacherSidebar;
