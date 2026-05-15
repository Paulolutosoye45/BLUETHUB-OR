import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import bluethub from "@/assets/png/bluethub.png";
import arrowMenu from "@/assets/svg/arrow_menu_close.svg";
import arrowMenuOpen from "@/assets/svg/arrow_menu_open.svg";
import { localData } from "@/utils";
import { token } from "@/utils";
import { TACADEMICLINKS, TnavLink, Tother_menu_Link } from "@/shared/constant";
import { useAuthContext } from "@/contexts/auth-context";
import {  ChevronIcon, type NavItem } from "@/pages/admin/side-bar";
import dashboardIcon from "@/assets/svg/element-4.svg";
import messageIcon from "@/assets/svg/message.svg";
import settingsIcon from "@/assets/svg/settings.svg";
import logoutIcon from "@/assets/svg/logout.svg";
import { useAuthContext } from "@/contexts/auth-context";
import MonitorPlayIcon from "@/assets/svg/monitor_play.svg";
import UploadIcon from "@/assets/svg/upload.svg";
import BookTextIcon from "@/assets/svg/jam_book.svg"
import studentIcon from "@/assets/svg/student.svg";
import coursesIcon from "@/assets/svg/courses.svg";
import classIconIcon from "@/assets/svg/class.svg";
import AssignmentIcon from "@/assets/svg/assignment.svg";


const navLink: NavItem[] = [
    { name: "Dashboard", icons: dashboardIcon, path: "/admin" },
    { name: "Message", icons: messageIcon, path: "/admin/message" },
];

    const navigate = useNavigate();
    const { user } = useAuthContext();
    const isHeadTeacher = user?.roleName === "HeadTeacher";
    const [isCollapsed, setIsCollapsed] = useState<boolean | null>();

const other_menu_Link: NavItem[] = [
    { name: "Settings", icons: settingsIcon, path: "/admin/settings" },
    { name: "Log Out", icons: logoutIcon, path: "/" },
];

const ACADEMICLINKS: NavItem[] = [
    {
        icons: studentIcon,
        name: "Student",
        path: "/teacher/student",
    },

    {
        icons: coursesIcon,
        name: "Courses",
        path: "/teacher/courses",
    },
    {
        icons: classIconIcon,
        name: "Class",
        path: "/teacher/class",
    },
    {
        icons: MonitorPlayIcon,
        name: "Recorded Class ",
        path: "/teacher/recorded-class",
    },

    {
        icons: UploadIcon,
        name: "Submit Lesson",
        path: "/teacher/submit-lesson",
    },
    {
        icons: AssignmentIcon,
        name: "Question/Assessment",
        path: "/teacher/assessment",
    },
    {
        icons: BookTextIcon,
        name: "My Syllabus",
        path: "/teacher/syllabus",
    },
];


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

                <div className="mb-7 space-y-2">
                    {TACADEMICLINKS.map((link, idx) => (
                        <NavLink
                            key={link.name + idx}
                            to={link.path}
                            end={link.path === "/teacher"}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors cursor-pointer ${isActive
                                    ? "bg-chestnut text-white"
                                    : ""
                                }${isCollapsed ? " justify-center" : ""}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <img
                                        src={link.icons}
                                        alt={link.name}
                                        className={`w-5 h-5 object-contain ${isActive ? "filter brightness-0 invert" : ""
                                            }`}
                                    />
                                    {!isCollapsed && (
                                        <h2
                                            className={`text-sm font-medium ${isActive ? "text-white" : "text-chestnut/50"
                                                }`}
                                        >
                                            {link.name}
                                        </h2>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                    {isHeadTeacher && (
                        <NavLink
                            to="/teacher/approvals"
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors cursor-pointer ${isActive
                                    ? "bg-chestnut text-white"
                                    : ""
                                }${isCollapsed ? " justify-center" : ""}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <img
                                        src={AssignmentIcon}
                                        alt="Approvals"
                                        className={`w-5 h-5 object-contain ${isActive ? "filter brightness-0 invert" : ""}`}
                                    />
                                    {!isCollapsed && (
                                        <h2 className={`text-sm font-medium ${isActive ? "text-white" : "text-chestnut/50"}`}>
                                            Approvals
                                        </h2>
                                    )}
                                </>
                            )}
                        </NavLink>
                    )}
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
                        );
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



const TeacherSidebar = () => {
    const navigate = useNavigate();
    const { logout } = useAuthContext();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

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
                                Greenfieldcollege
                            </p>
                            <p className="text-[13px] font-bold text-[#292382] truncate">Administrator</p>
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
}

export default TeacherSidebar