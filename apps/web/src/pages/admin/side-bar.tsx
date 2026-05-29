/**
 * SideBar.tsx — Bluethub Admin Navigation
 *
 * Features:
 *  - Collapsible desktop sidebar (persisted to localStorage)
 *  - Dropdown support for links with children (e.g. Registration)
 *  - Mobile: full-screen slide-in drawer triggered by a floating hamburger FAB
 *  - Smooth CSS transitions, no layout jank
 *  - Matches existing Bluethub color tokens (chestnut, #292382, etc.)
 */

import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

// ─── Asset imports ────────────────────────────────────────────────────────────
// Replace these with your actual asset imports
import bluethub from "@/assets/png/bluethub.png";
import arrowMenu from "@/assets/svg/arrow_menu_open.svg";
import arrowMenuOpen from "@/assets/svg/arrow_menu_close.svg";
import registrationIcon from "@/assets/svg/registration.svg";
import dashboardIcon from "@/assets/svg/element-4.svg";
import messageIcon from "@/assets/svg/message.svg";
import studentIcon from "@/assets/svg/student.svg";
import teacherIcon from "@/assets/svg/teacher.svg";
import coursesIcon from "@/assets/svg/courses.svg";
import libraryIcon from "@/assets/svg/library.svg";
import classIcon from "@/assets/svg/class.svg";
import lessonIcon from "@/assets/svg/lesson.svg";
import settingsIcon from "@/assets/svg/settings.svg";
import logoutIcon from "@/assets/svg/logout.svg";
import { useAuthContext } from "@/contexts/auth-context";
import { localData } from "@/utils";
import type { schoolInfo } from "@/services";

// ─── Nav data ─────────────────────────────────────────────────────────────────

export interface NavChild {
    name: string;
    path: string;
}

export interface NavItem {
    name: string;
    icons: string;
    path?: string;
    children?: NavChild[];
}

const navLink: NavItem[] = [
    { name: "Dashboard", icons: dashboardIcon, path: "/admin" },
    { name: "Message", icons: messageIcon, path: "/admin/message" },
];

const ACADEMICLINKS: NavItem[] = [
    {
        name: "Registration",
        icons: registrationIcon,
        children: [
            { name: "Register Admin", path: "/admin/registration/admin" },
            { name: "Admin Permissions", path: "/admin/registration/admin-permissions" },
            { name: "Register Student", path: "/admin/registration/student" },
            { name: "Register Teacher", path: "/admin/registration/Teacher" },
            { name: "Register Subject", path: "/admin/registration/courses" },
            { name: "Register Class", path: "/admin/registration/class" },
        ],
    },
    { name: "Student", icons: studentIcon, path: "/admin/student" },
    { name: "Teacher", icons: teacherIcon, path: "/admin/teacher" },
    { name: "Courses", icons: coursesIcon, path: "/admin/courses" },
    { name: "Library", icons: libraryIcon, path: "/admin/library" },
    { name: "Class", icons: classIcon, path: "/admin/class" },
    { name: "Lesson Approval", icons: lessonIcon, path: "/admin/lesson-approval" },
];

const other_menu_Link: NavItem[] = [
    { name: "Settings", icons: settingsIcon, path: "/admin/settings" },
    { name: "Log Out", icons: logoutIcon, path: "/" },
];

// ─── Chevron icon (inline SVG to avoid asset dep) ────────────────────────────

export const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
            flexShrink: 0,
        }}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

export const HamburgerIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

export const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// ─── Shared nav content ───────────────────────────────────────────────────────

export interface NavContentProps {
    isCollapsed: boolean;
    setIsCollapsed: (v: boolean) => void;
    onNavigate?: () => void; // called after any navigation (closes mobile drawer)
    onLogout: () => void;
}

export const NavContent = ({ isCollapsed, setIsCollapsed, onNavigate, onLogout }: NavContentProps) => {
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

    const handleDropdownClick = (idx: number) => {
        if (isCollapsed) {
            // Expand sidebar first, then open dropdown
            setIsCollapsed(false);
            setOpenDropdownIndex(idx);
            return;
        }
        setOpenDropdownIndex((prev) => (prev === idx ? null : idx));
    };

    // const sectionLabel = (full: string, short: string) =>
    //     isCollapsed ? (
    //         <p className="text-[10px] font-bold tracking-widest text-center text-[#29238280] mb-3 uppercase">
    //             {short}
    //         </p>
    //     ) : (
    //         <p className="text-[11px] font-bold tracking-widest text-[#29238280] mb-3 uppercase">
    //             {full}
    //         </p>
    //     );

    return (
        <div className="flex flex-col gap-8 pb-6">
            {/* ── MAIN MENU ── */}
            <section className="px-3">
                <div className="space-y-1">
                    {navLink.map((link, idx) => (
                        <NavLink
                            key={link.name + idx}
                            to={link.path!}
                            end={link.path === "/admin"}
                            onClick={onNavigate}
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

            {/* ── ACADEMIC MANAGEMENT ── */}
            <section className="px-3">
                <div className="space-y-1">
                    {ACADEMICLINKS.map((link, idx) => {
                        const isOpen = openDropdownIndex === idx;

                        if (link.children) {
                            return (
                                <div key={link.name + idx}>
                                    {/* Dropdown trigger */}
                                    <button
                                        type="button"
                                        onClick={() => handleDropdownClick(idx)}
                                        className={[
                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer group",
                                            isOpen
                                                ? "bg-[#292382] text-white"
                                                : "text-[#292382] hover:bg-[#29238210]",
                                            isCollapsed ? "justify-center" : "justify-between",
                                        ].join(" ")}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={link.icons}
                                                alt={link.name}
                                                className={`w-[18px] h-[18px] shrink-0 object-contain ${isOpen ? "brightness-0 invert" : "opacity-70 group-hover:opacity-100"}`}
                                            />
                                            {!isCollapsed && (
                                                <span className={`text-sm font-medium ${isOpen ? "text-white" : "text-[#292382]"}`}>
                                                    {link.name}
                                                </span>
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <span className={isOpen ? "text-white" : "text-[#292382] opacity-60"}>
                                                <ChevronIcon open={isOpen} />
                                            </span>
                                        )}
                                    </button>

                                    {/* Dropdown children — animated */}
                                    <div
                                        style={{
                                            display: !isCollapsed && isOpen ? "block" : "none",
                                        }}
                                        className="mt-1 ml-9 border-l-2 border-[#29238225] pl-3 space-y-0.5"
                                    >
                                        {link.children.map((child, cIdx) => (
                                            <NavLink
                                                key={child.name + cIdx}
                                                to={child.path}
                                                onClick={onNavigate}
                                                className={({ isActive }) =>
                                                    [
                                                        "block text-[13px] py-2 px-3 rounded-lg font-medium transition-all duration-150",
                                                        isActive
                                                            ? "bg-[#292382] text-white"
                                                            : "text-[#292382] opacity-80 hover:opacity-100 hover:bg-[#29238212]",
                                                    ].join(" ")
                                                }
                                            >
                                                {child.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        // Regular link
                        return (
                            <NavLink
                                key={link.name + idx}
                                to={link.path!}
                                onClick={onNavigate}
                                className={({ isActive }) =>
                                    [
                                        "flex items-center gap-3 px-3 py-2.5 rounded-[4px] transition-all duration-200 cursor-pointer group",
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
                        )
                    })}
                </div>
            </section>


            {/* ── OTHER MENU ── */}
            <section className="px-3">
                <div className="space-y-1">
                    {other_menu_Link.map((link, idx) => {
                        const isLogout = link.name === "Log Out";
                        return (
                            <NavLink
                                key={link.name + idx}
                                to={link.path!}
                                onClick={isLogout ? onLogout : onNavigate}
                                className={({ isActive }) =>
                                    [
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group",
                                        isLogout
                                            ? "hover:bg-red-50"
                                            : isActive
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
                                            className={`w-[18px] h-[18px] shrink-0 object-contain ${isLogout ? "opacity-80" : isActive ? "brightness-0 invert" : "opacity-70 group-hover:opacity-100"
                                                }`}
                                        />
                                        {!isCollapsed && (
                                            <span
                                                className={`text-sm font-medium ${isLogout ? "text-red-500" : isActive ? "text-white" : "text-[#292382]"
                                                    }`}
                                            >
                                                {link.name}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

// ─── Desktop SideBar ──────────────────────────────────────────────────────────

const SideBar = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuthContext();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
     const school = localData.retrieve("schoolInfo") as schoolInfo

    useEffect(() => {
        const saved = localData.retrieve<boolean>("navVNextT");
        if (saved !== null) setIsCollapsed(saved);
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

    const handleSetCollapsed = (v: boolean) => {
        setIsCollapsed(v);
        localData.save("navVNextT", v);
    };

    return (
        <aside
            className={[
                "h-full bg-white border-r border-[#29238210] flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
                isCollapsed ? "w-[68px]" : "w-[252px]",
            ].join(" ")}
        >
            {/* Header */}
            <div
                className={`flex items-center px-4 py-4 border-b border-[#29238210] shrink-0 ${isCollapsed ? "justify-center" : "justify-between"
                    }`}
            >
                {!isCollapsed && (
                    <div className="flex items-center gap-2 min-w-0">
                        <img src={bluethub} alt="Bluethub" className="h-7 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-[#292382] opacity-60 truncate">
                                {school.schoolName ? school.schoolName:  "BB"}
                            </p>
                            <p className="text-[13px] font-bold text-[#292382] truncate">{ user?.roleName ? user.roleName : "Administrator"}</p>
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

            {/* Scrollable nav */}
            <div
                className="flex-1 overflow-y-auto overflow-x-hidden py-4
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-[#29238230]"
            >
                <NavContent
                    isCollapsed={isCollapsed}
                    setIsCollapsed={handleSetCollapsed}
                    onLogout={handleLogout}
                />
            </div>
        </aside>
    );
};

// ─── Mobile Navigation (Drawer + FAB) ────────────────────────────────────────
interface IMobileNav  {
 isOpen: boolean;
 setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MobileNav = ({isOpen, setIsOpen}:IMobileNav ) => {
    const navigate = useNavigate();
    const { logout, user } = useAuthContext();
    const drawerRef = useRef<HTMLDivElement>(null);
    const school = localData.retrieve("schoolInfo") as schoolInfo

    const handleLogout = () => {
        logout();
        navigate("/");
        setIsOpen(false);
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <>

            {/* Backdrop */}
            <div
                className={[
                    "lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
                ].join(" ")}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={[
                    "lg:hidden fixed top-0 left-0 z-50 h-full w-[280px] bg-white flex flex-col transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-[#29238210] shrink-0">
                    <div className="flex items-center gap-2">
                        <img src={bluethub} alt="Bluethub" className="h-7" />
                        <div>
                            <p className="text-[10px] font-semibold text-[#292382] opacity-60">
                                {school.schoolName ? school.schoolName:  "BB"}
                            </p>
                            <p className="text-[13px] font-bold text-[#292382]">{ user?.roleName ? user.roleName : "Administrator"}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#29238210] text-[#292382] transition-colors"
                        aria-label="Close navigation"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Drawer nav */}
                <div
                    className="flex-1 overflow-y-auto py-4
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-[#29238230]"
                >
                    <NavContent
                        isCollapsed={false}
                        setIsCollapsed={() => { }}
                        onNavigate={() => setIsOpen(false)}
                        onLogout={handleLogout}
                    />
                </div>
            </div>
        </>
    );
};

export default SideBar;