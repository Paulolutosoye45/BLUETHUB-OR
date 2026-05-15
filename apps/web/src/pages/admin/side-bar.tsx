import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronDown, LogOut, Settings } from "lucide-react";
import bluethub from "@/assets/png/bluethub.png";
import { localData } from "@/utils";
import { ACADEMICLINKS, navLink } from "@/shared/constant";
import { useAuthContext } from "@/contexts/auth-context";
import type { SchoolInfo } from "@/services";

const SideBar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const schoolProfile = localData.retrieve("schoolInfo") as SchoolInfo | null;

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      localData.save("navVNextT", !prev);
      return !prev;
    });
  };

  useEffect(() => {
    const saved = localData.retrieve<boolean>("navVNextT");
    if (saved !== null) setIsCollapsed(saved);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const schoolInitial = schoolProfile?.schoolName?.[0]?.toUpperCase() ?? "S";

  return (
    <aside
      className={`
        relative flex flex-col h-full bg-white border-r border-gray-100
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-[72px]" : "w-[240px]"}
        [&::-webkit-scrollbar]:w-0
      `}
    >
      {/* ── Logo / School ──────────────────────────────────── */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 ${isCollapsed ? "justify-center" : ""}`}>
        {!isCollapsed && (
          <>
            {schoolProfile?.logoUrl ? (
              <img src={schoolProfile.logoUrl} alt="logo" className="w-8 h-8 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-chestnut flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">{schoolInitial}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate leading-tight">
                {schoolProfile?.schoolName ?? "School"}
              </p>
              <p className="text-[10px] text-chestnut font-medium mt-0.5">Administrator</p>
            </div>
          </>
        )}

        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-chestnut flex items-center justify-center">
            <span className="text-white text-xs font-bold">{schoolInitial}</span>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ────────────────────────────────── */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-[60px] z-10 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-chestnut hover:border-chestnut transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* ── Scrollable content ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-6
        [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-gray-200">

        {/* Main Menu */}
        <nav className="px-3">
          {!isCollapsed && (
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
              Main
            </p>
          )}
          <ul className="space-y-0.5">
            {navLink.map((link, idx) => (
              <li key={link.name + idx}>
                <NavLink
                  to={link.path}
                  end={link.path === "/admin"}
                  title={isCollapsed ? link.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                    ${isActive
                      ? "bg-chestnut text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                    ${isCollapsed ? "justify-center" : ""}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <img
                        src={link.icons}
                        alt={link.name}
                        className={`w-4.5 h-4.5 shrink-0 object-contain ${isActive ? "brightness-0 invert" : "opacity-70 group-hover:opacity-100"}`}
                        style={{ width: 18, height: 18 }}
                      />
                      {!isCollapsed && <span className="truncate">{link.name}</span>}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Academic Management */}
        <nav className="px-3">
          {!isCollapsed && (
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
              Academic
            </p>
          )}
          <ul className="space-y-0.5">
            {ACADEMICLINKS.map((link, idx) => {
              const isOpen = openDropdownIndex === idx;

              if (link.children) {
                return (
                  <li key={link.name + idx}>
                    <button
                      onClick={() => {
                        if (isCollapsed) {
                          setIsCollapsed(false);
                          setOpenDropdownIndex(idx);
                        } else {
                          setOpenDropdownIndex((prev) => (prev === idx ? null : idx));
                        }
                      }}
                      title={isCollapsed ? link.name : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                        ${isOpen ? "bg-chestnut/10 text-chestnut" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                        ${isCollapsed ? "justify-center" : "justify-between"}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={link.icons}
                          alt={link.name}
                          className={`shrink-0 object-contain ${isOpen ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
                          style={{ width: 18, height: 18 }}
                        />
                        {!isCollapsed && <span className="truncate">{link.name}</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>

                    {!isCollapsed && isOpen && (
                      <ul className="mt-1 ml-4 pl-3 border-l-2 border-chestnut/15 space-y-0.5">
                        {link.children.map((child, cIdx) => (
                          <li key={child.name + cIdx}>
                            <NavLink
                              to={child.path}
                              className={({ isActive }) =>
                                `block text-xs py-2 px-3 rounded-lg font-medium transition-colors
                                ${isActive
                                  ? "bg-chestnut text-white"
                                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                }`
                              }
                            >
                              {child.name}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={link.name + idx}>
                  <NavLink
                    to={link.path ?? "/"}
                    title={isCollapsed ? link.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                      ${isActive ? "bg-chestnut text-white shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                      ${isCollapsed ? "justify-center" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <img
                          src={link.icons}
                          alt={link.name}
                          className={`shrink-0 object-contain ${isActive ? "brightness-0 invert" : "opacity-70 group-hover:opacity-100"}`}
                          style={{ width: 18, height: 18 }}
                        />
                        {!isCollapsed && <span className="truncate">{link.name}</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className={`border-t border-gray-100 p-3 space-y-0.5`}>
        {/* User info */}
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-chestnut/10 flex items-center justify-center shrink-0">
              <span className="text-chestnut text-xs font-semibold">
                {[user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("") || "AD"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-gray-400 truncate">Admin</p>
            </div>
          </div>
        )}

        <NavLink
          to="/admin/settings"
          title={isCollapsed ? "Settings" : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
            ${isActive ? "bg-chestnut text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}
            ${isCollapsed ? "justify-center" : ""}`
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          title={isCollapsed ? "Log Out" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all
            ${isCollapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>

      {/* ── Bluethub watermark ─────────────────────────────── */}
      {!isCollapsed && (
        <div className="px-4 pb-4 flex items-center justify-center">
          <img src={bluethub} alt="bluethub" className="h-5 opacity-30" />
        </div>
      )}
    </aside>
  );
};

export default SideBar;
