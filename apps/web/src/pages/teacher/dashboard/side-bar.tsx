// TeacherSidebar.tsx
import { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import bluethub from "@/assets/png/bluethub.png";
import arrowMenu from "@/assets/svg/arrow_menu_close.svg";
import arrowMenuOpen from "@/assets/svg/arrow_menu_open.svg";
import { localData } from "@/utils";
import { type NavItem } from "@/pages/admin/side-bar";
import dashboardIcon from "@/assets/svg/element-4.svg";
import messageIcon from "@/assets/svg/message.svg";
import calendarIcon from "@/assets/svg/calendar.svg";
import settingsIcon from "@/assets/svg/settings.svg";
import logoutIcon from "@/assets/svg/logout.svg";
import { useAuthContext } from "@/contexts/auth-context";
import MonitorPlayIcon from "@/assets/svg/monitor_play.svg";
import BookTextIcon from "@/assets/svg/jam_book.svg";
import studentIcon from "@/assets/svg/student.svg";
import coursesIcon from "@/assets/svg/courses.svg";
import classIconIcon from "@/assets/svg/class.svg";
import AssignmentIcon from "@/assets/svg/assignment.svg";
import UploadIcon from "@/assets/svg/upload.svg";
import PlayIcon from "@/assets/svg/play.svg";
import QuizzesIcon from "@/assets/svg/quizzes.svg";
import libraryIcon from "@/assets/svg/library.svg";
// import { useTeacherProfile } from "@/hooks/use-teacher-profile"; // adjust to your actual hook

const MAIN_LINKS: NavItem[] = [
  { name: "Dashboard", icons: dashboardIcon, path: "/teacher" },
  { name: "Message", icons: messageIcon, path: "/teacher/message" },
  { name: "Calendar", icons: calendarIcon, path: "/teacher/calendar" },
];

const ACADEMIC_LINKS: NavItem[] = [
  { icons: studentIcon, name: "Student", path: "/teacher/student" },
  { icons: coursesIcon, name: "Courses", path: "/teacher/courses" },
  { icons: classIconIcon, name: "Class", path: "/teacher/class" },
  { icons: MonitorPlayIcon, name: "Recorded Class", path: "/teacher/recorded-class" },
  { icons: AssignmentIcon, name: "Question/Assessment", path: "/teacher/assessment" },
  { icons: BookTextIcon, name: "My Lesson", path: "/teacher/my-lessons" },
  {
    icons: UploadIcon,
    name: "Submit Lesson",
    path: "/teacher/submit-lesson",
  },
  {
    icons: libraryIcon,
    name: "My Lessons",
    path: "/teacher/my-lessons",
  },
  {
    icons: PlayIcon,
    name: "Start Class",
    path: "/teacher/start-class",
  },
  {
    icons: UploadIcon,
    name: "My Drafts",
    path: "/teacher/drafts",
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

const OTHER_LINKS: NavItem[] = [
  { name: "Settings", icons: settingsIcon, path: "/teacher/settings" },
  { name: "Log Out", icons: logoutIcon, path: "/" },
];

// ── Profile Card ──────────────────────────────────────────────────────────────
interface ProfileCardProps {
  isCollapsed: boolean;
  initials: string;
  name: string;
  role: string;
  classLabel: string;
  subject: string;
}

function ProfileCard({
  isCollapsed,
  initials,
  name,
  role,
  classLabel,
  subject,
}: ProfileCardProps) {

  if (isCollapsed) {
    return (
      <div className="flex justify-center py-3 px-2">
        <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 mb-2 rounded-xl bg-[#292382] p-3 text-white">
      <div className="flex items-start gap-2.5">
        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold truncate">{name}</p>
          <p className="text-[11px] opacity-70 truncate">{role}</p>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
        <span className="bg-white/20 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
          {classLabel}
        </span>
        <span className="text-[11px] opacity-70 truncate">{subject}</span>
      </div>
    </div>
  );
}

// ── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, isCollapsed }: { label: string; isCollapsed: boolean }) {
  if (isCollapsed) return <div className="my-2 border-t border-[#29238215]" />;
  return (
    <p className="px-3 mb-2 text-[10px] font-bold tracking-widest text-[#29238260] uppercase">
      {label}
    </p>
  );
}

// ── Nav Link Item ─────────────────────────────────────────────────────────────
function NavItem({
  link,
  isCollapsed,
  onNavigate,
}: {
  link: NavItem;
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={link.path!}
      end={link.path === "/teacher"}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer group",
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
            className={`w-[18px] h-[18px] shrink-0 object-contain transition-all ${isActive ? "brightness-0 invert" : "opacity-60 group-hover:opacity-100"
              }`}
          />
          {!isCollapsed && (
            <span
              className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-[#292382]"
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
  onNavigate,
  onLogout,
}: NavContentProps) => {
  const { user } = useAuthContext()

  const name = `${user?.firstName} ${user?.lastName}`
  const role = user?.roleName ? user?.roleName : "Teacher"
  // First classroom
  const classroom = user?.roleData?.classrooms[0];

 const classLabel = classroom?.className ?? "";
const subject = classroom?.subjects.map((s) => s.subjectName).join(" · ") ?? "";

  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((n) => n![0].toUpperCase())
    .join("") || "AD";

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Profile card */}
      <ProfileCard initials={initials} classLabel={classLabel} subject={subject} name={name} role={role} isCollapsed={isCollapsed} />

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
          {ACADEMIC_LINKS.map((link) => (
            <NavItem key={link.name} link={link} isCollapsed={isCollapsed} onNavigate={onNavigate} />
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer group",
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
                    className={`w-[18px] h-[18px] shrink-0 object-contain ${isLogout
                        ? "opacity-80"
                        : isActive
                          ? "brightness-0 invert"
                          : "opacity-60 group-hover:opacity-100"
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
      {/* Header: logo + collapse toggle */}
      <div
        className={`flex items-center px-4 py-4 border-b border-[#29238210] shrink-0 ${isCollapsed ? "justify-center" : "justify-between"
          }`}
      >
        {!isCollapsed && (
 <div className="flex items-center gap-2 min-w-0">
                        <img src={bluethub} alt="Bluethub" className="h-6 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-[#292382] opacity-60 truncate">
                                
                            </p>
                            <p className="text-[13px] font-bold text-[#292382] truncate">{school.schoolName ? school.schoolName:  "BB"}</p>
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


// Add these imports to TeacherSidebar.tsx
import { X } from "lucide-react";
import type { schoolInfo } from "@/services";

interface IMobileTeacherNav {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MobileTeacherNav = ({ isOpen, setIsOpen }: IMobileTeacherNav) => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
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
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#29238210] shrink-0">
          <img src={bluethub} alt="Bluethub" className="h-6" />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#29238210] text-[#292382] transition-colors"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable nav — reuses exact same NavContent as desktop */}
        <div
          className="flex-1 overflow-y-auto py-4
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
};

export default TeacherSidebar;