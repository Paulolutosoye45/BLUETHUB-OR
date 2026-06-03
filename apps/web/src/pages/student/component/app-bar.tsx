import Spinner from "@/assets/svg/Spinner.svg?react"
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


import WaveHand from "@/assets/svg/wave_hand.svg?react";
import Notification from "@/assets/svg/notifyme.svg?react";
import LogOutIcon from "@/assets/svg/log-out-04.svg?react";
import test_profile from "@/assets/png/test_profile.png"
import { ChevronRight, Menu, Settings, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { isStudentRoleData, useAuthContext } from "@/contexts/auth-context";
const StudentAppBar = () => {
  const outletContext = useOutletContext<{ openMobileNav?: () => void }>() ?? {};
  const openMobileNav = outletContext.openMobileNav ?? (() => undefined);
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [notificationStatus, setNotificationStatus] = useState<string>('')
  const today = new Date();

  const roleData = user?.roleData;
  const studentRoleData = roleData && isStudentRoleData(roleData) ? roleData : null;
  const studentName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.userName || "Student";
  const className = studentRoleData?.classroom?.className || "Student class";
  const totalSubjects = studentRoleData?.totalSubjects ?? studentRoleData?.majorSubjects?.length ?? studentRoleData?.subjects?.length ?? 0;
  const initials = studentName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "ST";

  const dayName = today.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const formattedDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const quickFacts = [
    `${totalSubjects} subject${totalSubjects === 1 ? "" : "s"}`,
    className,
    user?.isActive ? "Account active" : "Account inactive",
  ];

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <>
    <div className="flex items-center gap-3 rounded-[24px] bg-gradient-to-r from-[#3246c5] via-[#4F61E8] to-[#6e7df0] px-4 py-4 shadow-[0_18px_40px_-24px_rgba(79,97,232,0.85)] md:hidden">
        <button type="button" className="rounded-full bg-white/15 p-2" onClick={openMobileNav}>
          <Menu className="lg:hidden text-white" />
        </button>
        <div className="flex items-center gap-[5px]">
           <div className="flex items-center justify-center h-[38px] w-[38px] rounded-full bg-white/15 uppercase text-white font-semibold text-xs leading-5">{initials}</div>
          <div>
             <h2 className="text-white font-semibold text-sm leading-[16px]">{studentName}</h2>
             <h4 className="font-medium text-[10px] leading-[14px] text-white/70">{className}</h4>
          </div>
        </div>
    </div>
    <section className="hidden overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-[#ffffff] via-[#eef2ff] to-[#dfe8ff] p-6 shadow-[0_26px_60px_-36px_rgba(53,70,160,0.7)] md:flex md:flex-col md:gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#ced7ff] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#4F61E8]">
          Student dashboard
        </div>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold text-[#1c2556]">
            Welcome back, {user?.firstName || "Student"}
          </h2>
          <WaveHand className="h-8 w-8" />
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          Stay on top of your classes, assignments, and announcements from one place. Your week is already arranged for you.
        </p>
        <div className="flex flex-wrap gap-2">
          {quickFacts.map((fact) => (
            <span key={fact} className="rounded-full border border-white/70 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm">
              {fact}
            </span>
          ))}
        </div>
      </div>
      <div className="ml-auto flex w-full max-w-md flex-col gap-4 rounded-[24px] border border-white/75 bg-white/72 p-4 shadow-[0_18px_40px_-30px_rgba(16,24,40,0.55)]">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {dayName},
            <span className="ml-1 font-medium tracking-normal text-slate-700">{formattedDate}</span>
          </p>

          <div className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm">
            <Notification />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="border-none  cursor-pointer">
            <div className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200/80 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex justify-center items-center rounded-full border-2 border-[#34A9FF] bg-[#D9D9D9]">
                  <img src={test_profile} alt="" className="h-10 w-10 rounded-full object-cover" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[#1c2556] capitalize">
                    {studentName}
                  </p>
                  <p className="text-xs text-slate-500">{className}</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-slate-400" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-77 h-96 rounded-2xl px-5 py-2.5 border border-white  m-2.5 ">
            <DropdownMenuLabel className="flex items-center gap-4">
              <div className="flex justify-center items-center bg-[#D9D9D9] rounded-full border-2 border-[#34A9FF]">
                <img src={test_profile} alt="" className="object-cover rounded-full size-17.5 " />
              </div>
              <div>
                <p className="capitalize font-poppins font-normal text-sm leading-4.5 text-[#1F2937]">{studentName}</p>
                <span className="text-gray-500 font-poppins font-normal text-xs leading-4">ID: {user?.id ?? "N/A"}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="border border-[#E5E7EB]" />
            <DropdownMenuGroup className="space-y-2 ">

              {/* Profile */}
              <DropdownMenuItem className="p-2.5  ">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2.5">
                    <User className="size-6" />
                    <Link to="/student/profile" className="text-blck-b2 font-poppins text-sm leading-5">My Profile</Link>
                  </div>
                  <ChevronRight className="size-6" />
                </div>
              </DropdownMenuItem>

              {/* Settings */}
              <DropdownMenuItem className="p-2.5">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2.5">
                    <Settings className="size-6 text-[#3A3A3ABF]/75%" />
                    <p className="text-blck-b2 font-poppins text-sm leading-5">Settings </p>
                  </div>
                  <ChevronRight className="size-6" />
                </div>
              </DropdownMenuItem>

              {/* Perfomance */}
              <DropdownMenuItem className="p-2.5  ">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2.5">
                    <Spinner className="size-6 text-[#3A3A3ABF]/75%" />
                    <p className="text-blck-b2 font-poppins text-sm leading-5"> My Perfomance </p>
                  </div>
                  <ChevronRight className="size-6" />
                </div>
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger

                  className="p-2.5 cursor-pointer"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2.5">
                      <Notification className="size-5 text-gray-600" />
                      <p className="text-blck-b2 font-poppins text-sm leading-5">
                        Notification
                      </p>
                    </div>
                    <p className="font-poppins text-xs leading-4.5 text-gray-600">
                      {notificationStatus ? (<span className="text-student-chestnut">
                        {notificationStatus}
                      </span>) : 'Allow'}
                    </p>
                  </div>
                </DropdownMenuSubTrigger>

                {/* The submenu content */}
                <DropdownMenuPortal>
                  <DropdownMenuSubContent
                    className="w-16.75 border border-white">
                    <DropdownMenuItem onClick={() => setNotificationStatus("Allow")} className={`${notificationStatus === 'Allow' ? 'text-student-chestnut' : ''}`}>Allow</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNotificationStatus("Mute")} className={`${notificationStatus === 'Mute' ? 'text-student-chestnut' : ''}`} > Mute</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>


              {/* Log Out */}
              <DropdownMenuItem className="p-2.5" onClick={handleLogout}>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2.5">
                    <LogOutIcon className="size-6 text-[#3A3A3ABF]/75%" />
                    <p className="text-blck-b2 font-poppins text-sm leading-5"> Log Out </p>
                  </div>
                </div>
              </DropdownMenuItem>

            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
    </>
  );
};

export default StudentAppBar;
