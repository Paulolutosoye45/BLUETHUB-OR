import { NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth-context";

import elementIcon from "@/assets/svg/element-4.svg";
import studentIcon from "@/assets/svg/student.svg";
import teacherIcon from "@/assets/svg/teacher.svg";
import coursesIcon from "@/assets/svg/courses.svg";
import classIcon from "@/assets/svg/class.svg";
import settingsIcon from "@/assets/svg/settings.svg";
import logoutIcon from "@/assets/svg/logout.svg";

interface AdminTabMenuProps {
  schoolLogoUrl: string;
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: elementIcon, path: "/admin", exact: true },
  { id: "students",  label: "Students",  icon: studentIcon,  path: "/admin/registration/student", exact: false },
  { id: "teachers",  label: "Teachers",  icon: teacherIcon,  path: "/admin/registration/teacher", exact: false },
  { id: "courses",   label: "Courses",   icon: coursesIcon,  path: "/admin/registration/courses", exact: false },
  { id: "classes",   label: "Classes",   icon: classIcon,    path: "/admin/registration/class",   exact: false },
];

const AdminTabMenu = ({ schoolLogoUrl }: AdminTabMenuProps) => {
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white w-full border-b border-gray-200 shadow-sm">
      {/* ── Top bar: logo · user · actions ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src={schoolLogoUrl}
            alt="School Logo"
            loading="lazy"
            className="h-10 w-auto object-contain"
          />
          <div className="leading-tight">
            <p className="text-[11px] font-medium text-[#29238280] font-poppins">
              Welcome back,
            </p>
            <p className="text-sm font-semibold text-chestnut font-poppins capitalize">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <NavLink
            to="/admin/settings"
            className="p-2 rounded-lg hover:bg-[#29238214]"
            title="Settings"
          >
            <img src={settingsIcon} alt="Settings" className="w-5 h-5 object-contain" />
          </NavLink>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50"
            aria-label="Log out"
            title="Log out"
          >
            <img src={logoutIcon} alt="Log out" className="w-5 h-5 object-contain" />
          </button>
        </div>
      </div>

      {/* ── Horizontal tab bar ── */}
      <div
        className="flex items-center overflow-x-auto
          [&::-webkit-scrollbar]:h-0
          [&::-webkit-scrollbar]:w-0"
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            end={tab.exact}
            className={({ isActive }) =>
              `flex items-center gap-2 px-5 py-3 text-sm font-medium font-poppins
               whitespace-nowrap border-b-2 shrink-0 select-none
               ${
                 isActive
                   ? "border-chestnut text-chestnut"
                   : "border-transparent text-[#29238280] hover:text-chestnut"
               }`
            }
          >
            {({ isActive }) => (
              <>
                <img
                  src={tab.icon}
                  alt=""
                  aria-hidden="true"
                  className={`w-4 h-4 object-contain ${isActive ? "" : "opacity-50"}`}
                />
                {tab.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default AdminTabMenu;
