import { NavLink, useNavigate } from "react-router-dom";

import bluethub from "@/assets/png/bluethub.png";
import arrowMenu from "@/assets/svg/arrow_menu_close.svg";
import arrowMenuOpen from "@/assets/svg/arrow_menu_open.svg";
import { isTeacherRoleData, useAuthContext } from "@/contexts/auth-context";
import { TACADEMICLINKS } from "@/shared/constant";
import { localData } from "@/utils";
import type { NavItem } from "@/pages/admin/side-bar";
import settingsIcon from "@/assets/svg/settings.svg";
import logoutIcon from "@/assets/svg/logout.svg";
import dashboardIcon from "@/assets/svg/element-4.svg";
import messageIcon from "@/assets/svg/message.svg";
import calendarIcon from "@/assets/svg/calendar.svg";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { schoolInfo } from "@/services";

// ── Chevron Icon ──────────────────────────────────────────────────────────────
const ChevronIcon = ({ open }: { open: boolean }) => (
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

const MAIN_LINKS: NavItem[] = [
  { name: "Dashboard", icons: dashboardIcon, path: "/teacher" },
  { name: "Message", icons: messageIcon, path: "/teacher/message" },
  { name: "Calendar", icons: calendarIcon, path: "/teacher/calendar" },
];

const OTHER_LINKS: NavItem[] = [
  { name: "Settings", icons: settingsIcon, path: "/teacher/settings" },
  { name: "Log Out", icons: logoutIcon, path: "/" },
];

function ProfileCard({ isCollapsed }: { isCollapsed: boolean }) {
  const { user } = useAuthContext()
  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Teacher Name";
  const role = `${user?.roleName || "Teacher"}`;
  const roleData = user?.roleData;
  const classroom = (roleData && isTeacherRoleData(roleData))
    ? roleData.classrooms[0]
    : undefined;
  const className = classroom?.className;
  const subjects = classroom?.subjects;
  const subjectNames = subjects?.slice(0,2).map((s) => s.subjectName).join(" · ");
  const subject = subjectNames ? `${subjectNames}` : className ?? "";
  const classLabel = className ? ` ${className}` : "No class assigned";

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  // Usage
  const initials = getInitials(user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "WA"); // "Mrs. Adaeze Funmi" → "MA"

  if (isCollapsed) {
    return (
      <div className="flex justify-center py-2 px-2">
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-2 mb-1 rounded-xl bg-[#292382] p-2 text-white">
      <div className="flex items-start gap-2">
        <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold truncate">{name}</p>
          <p className="text-[9px] opacity-70 truncate">{role}</p>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
        <span className="bg-white/20 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
          {classLabel}
        </span>
        <span className="text-[10px] opacity-70 truncate">{subject}</span>
      </div>
    </div>
  );
}

// ── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, isCollapsed }: { label: string; isCollapsed: boolean
 }) {
  if (isCollapsed) return <div className="my-1 border-t border-[#29238215]" />;
  return (
    <p className="px-3 mb-1 text-[9px] font-bold tracking-widest text-[#29238260] uppercase">
      {label}
    </p>
  );
}

// ── Nav Link Item ─────────────────────────────────────────────────────────────
function NavItem({
  link,
  isCollapsed,
  onNavigate,
  isOpen,
  onToggle,
}: {
  link: NavItem;
  isCollapsed: boolean;
  onNavigate?: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  if (link.children) {
    return (
      <div>
        <button
          type="button"
          onClick={onToggle}
          className={[
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer group",
            isOpen ? "bg-[#292382] text-white" : "text-[#292382] hover:bg-[#29238210]",
            isCollapsed ? "justify-center" : "justify-between",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <img
              src={link.icons}
              alt={link.name}
              className={`w-[18px] h-[18px] shrink-0 object-contain transition-all ${
                isOpen ? "brightness-0 invert" : "opacity-60 group-hover:opacity-100"
              }`}
            />
            {!isCollapsed && (
              <span className={`text-xs font-medium truncate ${isOpen ? "text-white" : "text-[#292382]"}`}>
                {link.name}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <span className={isOpen ? "text-white" : "text-[#292382] opacity-60"}>
              <ChevronIcon open={!!isOpen} />
            </span>
          )}
        </button>

        <div
          style={{ display: !isCollapsed && isOpen ? "block" : "none" }}
          className="mt-1 ml-9 border-l-2 border-[#29238225] pl-3 space-y-0.5"
        >
          {link.children.map((child) => (
            <NavLink
              key={child.name}
              to={child.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  "block text-xs py-1.5 px-3 rounded-lg font-medium transition-all duration-150",
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

  return (
    <NavLink
      to={link.path!}
      end={link.path === "/teacher"}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer group",
          isActive ? "bg-[#292382] text-white" : "text-[#292382] hover:bg-[#29238210]",
          isCollapsed ? "justify-center" : "",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <img
            src={link.icons}
            alt={link.name}
            className={`w-[16px] h-[16px] shrink-0 object-contain transition-all ${
isActive ? "brightness-0 invert" : "opacity-60 group-hover:opacity-100"
              }`}
          />
          {!isCollapsed && (
            <span
              className={`text-[11px] font-medium truncate ${isActive ? "text-white" :  "text-[#292382]"
                }`}
            >
              {link.name}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ── NavContent ────────────────────────────────────────────────────────────────
export interface NavContentProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  onNavigate?: () => void;
  onLogout: () => void;
}

export const NavContent = ({
  isCollapsed,
  //   setIsCollapsed,
  onNavigate,
  onLogout,
}: NavContentProps) => {
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

  const handleDropdownClick = (idx: number) => {
    if (isCollapsed) {
      return;
    }
    setOpenDropdownIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="flex flex-col gap-2 pb-4">
      {/* Profile card */}
      <ProfileCard isCollapsed={isCollapsed} />

      {/* MAIN MENU */}
      <section className="px-0">
        <SectionLabel label="Main Menu" isCollapsed={isCollapsed} />
        <div className="px-3 space-y-0.5">
          {MAIN_LINKS.map((link) => (
            <NavItem key={link.name} link={link} isCollapsed={isCollapsed} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-4 border-t border-[#29238215]" />

      {/* ACADEMIC */}
      <section className="px-0">
        <div className="px-3 space-y-0.5">
          {TACADEMICLINKS.map((link, idx) => (
            <NavItem
              key={link.name}
              link={link}
              isCollapsed={isCollapsed}
              onNavigate={onNavigate}
              isOpen={openDropdownIndex === idx}
              onToggle={() => handleDropdownClick(idx)}
            />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-4 border-t border-[#29238215]" />

      {/* OTHER */}
      <section className="px-3 space-y-0.5">
        {OTHER_LINKS.map((link) => {
          const isLogout = link.name === "Log Out";
          return (
            <NavLink
              key={link.name}
              to={link.path!}
              onClick={isLogout ? onLogout : onNavigate}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer group",
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
                    className={`w-[16px] h-[16px] shrink-0 object-contain ${isLogout
                      ? "opacity-80"
                      : isActive
                        ? "brightness-0 invert"
                        : "opacity-60 group-hover:opacity-100"
                      }`}
                  />
                  {!isCollapsed && (
                    <span
                      className={`text-[11px] font-medium ${isLogout ? "text-red-500" :
 isActive ? "text-white" : "text-[#292382]"
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
      </section>
    </div>
  );
};

// ── TeacherSidebar ────────────────────────────────────────────────────────────
const TeacherSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
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


  const handleSetCollapsed = (v: boolean) => {
    setIsCollapsed(v);
    localData.save("navVNextT", v);
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
      {/* Header: logo + collapse toggle */}
      <div
        className={`flex items-center px-3 py-2 border-b border-[#29238210] shrink-0 ${isCollapsed ? "justify-center" : "justify-between"
          }`}
      >
        {!isCollapsed && (
          <img src={bluethub} alt="Bluethub" className="h-5 shrink-0" />
        )}

         {!isCollapsed && (<h2 className="text-chestnut font-medium text-[10px]">{school.schoolName}</h2>)}
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
        className="flex-1 overflow-y-auto overflow-x-hidden py-2
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

export default TeacherSidebar;

interface IMobileTeacherNav {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MobileTeacherNav = ({ isOpen, setIsOpen }: IMobileTeacherNav) => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const school = localData.retrieve("schoolInfo") as schoolInfo
  const drawerRef = useRef<HTMLDivElement>(null);

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
        aria-hidden="true"
        className={[
          "lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={[
          "lg:hidden fixed top-0 left-0 z-50 h-full w-[272px] bg-white flex flex-col shadow-xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Header: logo + close */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#29238210] shrink-0">
          
          <img src={bluethub} alt="Bluethub" className="h-5" />
          <h2 className="text-chestnut font-medium text-[10px]">{school.schoolName}</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#29238210] text-[#292382] transition-colors"
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable nav — reuses exact same NavContent as desktop */}
        <div
          className="flex-1 overflow-y-auto py-2
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-track]:bg-transparent
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
}