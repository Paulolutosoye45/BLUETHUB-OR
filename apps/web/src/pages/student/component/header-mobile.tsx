import { ChevronRight, LogOutIcon, Menu, Settings, User } from "lucide-react";
import Spinner from "@/assets/svg/Spinner.svg?react";
import test_profile from "@/assets/png/test_profile.png"
import Notification from "@/assets/svg/notifyme.svg?react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@bluethub/ui-kit"
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";


export function StudentMobileHeader({
  studentName,
  className,
  initials,
  openMobileNav,
  stats,
}: {
  studentName: string;
  className: string;
  initials: string;
  openMobileNav: () => void;
  stats: { classesLeft: number; quizzesDue: number; assignments: number };
}) {
  const firstName = studentName.split(" ")[0];
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const [notificationStatus, setNotificationStatus] = useState<string>('')

  const today = new Date();

  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="md:hidden rounded-md bg-gradient-to-r from-[#3246c5] via-[#4F61E8] to-[#6e7df0] px-4 pt-4 pb-6">
      {/* Top nav row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="rounded-full bg-white/15 p-2"
          onClick={openMobileNav}
        >
          <Menu className="text-white w-5 h-5" />
        </button>
        <div className="flex items-center  gap-[5px]">

          <div>
            <h2 className="text-white font-semibold text-sm leading-[16px]">
              {studentName}
            </h2>
            <h4 className="font-medium text-[10px] leading-[14px] text-white/70">
              {className}
            </h4>
          </div>
        </div>


       <DropdownMenu>
  <DropdownMenuTrigger asChild className="border-none cursor-pointer">
    <div className="flex items-center justify-center h-9 w-9 sm:h-[38px] sm:w-[38px] rounded-full bg-white/15 uppercase text-white font-semibold text-xs leading-5">
      {initials}
    </div>
  </DropdownMenuTrigger>

  <DropdownMenuContent
    side="bottom"
    align="end"
    sideOffset={8}
    avoidCollisions={false}
    className="w-[90vw] max-w-77 sm:w-77 h-auto max-h-[85vh] sm:h-96 rounded-2xl px-4 sm:px-5 py-2.5 border border-white overflow-y-auto"
  >
    <DropdownMenuLabel className="flex items-center gap-3 sm:gap-4">
      <div className="flex justify-center items-center bg-[#D9D9D9] rounded-full border-2 border-[#34A9FF] shrink-0">
        <img
          src={test_profile}
          alt=""
          className="object-cover rounded-full size-14 sm:size-17.5"
        />
      </div>
      <div className="min-w-0">
        <p className="capitalize font-poppins font-normal text-sm leading-4.5 text-[#1F2937] truncate">
          {studentName}
        </p>
        <p className="font-poppins font-normal text-xs leading-4.5 text-[#6B7280] truncate">
          {className}
        </p>
      </div>
    </DropdownMenuLabel>

    <DropdownMenuSeparator className="border border-[#E5E7EB]" />

    <DropdownMenuGroup className="space-y-1.5 sm:space-y-2">

      {/* Profile */}
      <DropdownMenuItem className="p-2 sm:p-2.5">
        <Link to="/student/profile" className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2.5">
            <User className="size-5 sm:size-6" />
            <Link to="/student/profile" className="text-blck-b2 font-poppins text-sm leading-5">
              My Profile
            </Link>
          </div>
          <ChevronRight className="size-5 sm:size-6" />
        </Link>
      </DropdownMenuItem>

      {/* Settings */}
      <DropdownMenuItem className="p-2 sm:p-2.5">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2.5">
            <Settings className="size-5 sm:size-6 text-[#3A3A3ABF]/75%" />
            <p className="text-blck-b2 font-poppins text-sm leading-5">Settings</p>
          </div>
          <ChevronRight className="size-5 sm:size-6" />
        </div>
      </DropdownMenuItem>

      {/* Performance */}
      <DropdownMenuItem className="p-2 sm:p-2.5">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2.5">
            <Spinner className="size-5 sm:size-6 text-[#3A3A3ABF]/75%" />
            <p className="text-blck-b2 font-poppins text-sm leading-5">My Performance</p>
          </div>
          <ChevronRight className="size-5 sm:size-6" />
        </div>
      </DropdownMenuItem>

      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="p-2 sm:p-2.5 cursor-pointer">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2.5">
              <Notification className="size-5 text-gray-600" />
              <p className="text-blck-b2 font-poppins text-sm leading-5">Notification</p>
            </div>
            <p className="font-poppins text-xs leading-4.5 text-gray-600">
              {notificationStatus ? (
                <span className="text-student-chestnut">{notificationStatus}</span>
              ) : (
                "Allow"
              )}
            </p>
          </div>
        </DropdownMenuSubTrigger>

        {/* The submenu content */}
        <DropdownMenuPortal>
          <DropdownMenuSubContent            
            avoidCollisions={false}
            className="w-32 -ml-36  border border-white"
          >
            <DropdownMenuItem
              onClick={() => setNotificationStatus("Allow")}
              className={`${notificationStatus === "Allow" ? "text-student-chestnut" : ""}`}
            >
              Allow
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setNotificationStatus("Mute")}
              className={`${notificationStatus === "Mute" ? "text-student-chestnut" : ""}`}
            >
              Mute
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>

      {/* Log Out */}
      <DropdownMenuItem className="p-2 sm:p-2.5" onClick={handleLogout}>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2.5">
            <LogOutIcon className="size-5 sm:size-6 text-[#3A3A3ABF]/75%" />
            <p className="text-blck-b2 font-poppins text-sm leading-5">Log Out</p>
          </div>
        </div>
      </DropdownMenuItem>

    </DropdownMenuGroup>
  </DropdownMenuContent>
</DropdownMenu>
      </div>

      {/* Hero card */}
      <div className="mt-4 rounded-[16px] bg-white/10 px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-1">
          This Week
        </p>
        <p className="text-white font-bold text-lg leading-snug">
          {greeting()}, {firstName}!👋
        </p>

        {/* Stat pills */}
        <div className="flex flex-wrap   gap-2 mt-3">
          <span className="rounded-full bg-white/20 px-3 py-1 text-white text-xs font-medium">
            {stats.classesLeft} classes left
          </span>
          <span className="rounded-full bg-[#F5A623] px-3 py-1 text-white text-xs font-medium">
            {stats.quizzesDue} quizzes due
          </span>
          <span className="rounded-full bg-[#E85D75] px-3 py-1 text-white text-xs font-medium">
            {stats.assignments} assignments
          </span>
        </div>
      </div>
    </div>
  );
}