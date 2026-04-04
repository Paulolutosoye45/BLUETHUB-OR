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
import { ChevronRight, Settings, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
const StudentAppBar = () => {
  const [notificationStatus, setNotificationStatus] = useState<string>('')
   const today = new Date();

  const dayName = today.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const formattedDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className=" shadow-[0_15px_20px_0_rgba(41,35,130,0.1)]  bg-student-chestnut/5 border-none flex justify-between items-center px-3 py-2 border border-[#E0E0E0]">
      <div className="flex items-center gap-3">
        <h2 className="text-student-chestnut font-poppins font-medium text-base">
          Welcome back, Sarah
        </h2>
        <WaveHand className="w-6 h-6" />
      </div>
      <div className="flex items-center ">
        <div className="flex items-center gap-4">
          <p className="font-poppins font-semibold text-xs text-student-chestnut">
            {dayName},
            <span className="font-medium">{formattedDate}</span>
          </p>

          <Notification />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="border-none  cursor-pointer">
            <div className="flex items-center justify-between gap-4 p-4">
              <div className="flex justify-center items-center bg-[#D9D9D9] rounded-full border-2 border-[#34A9FF]">
                <img src={test_profile} alt="" className="object-cover rounded-full w-9.75 h-9.5 " />
              </div>
              <p className="font-poppins font-medium text-base text-student-chestnut capitalize">
                Sarah Johnson
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-77 h-96 rounded-2xl px-5 py-2.5 border border-white  m-2.5 ">
            <DropdownMenuLabel className="flex items-center gap-4">
              <div className="flex justify-center items-center bg-[#D9D9D9] rounded-full border-2 border-[#34A9FF]">
                <img src={test_profile} alt="" className="object-cover rounded-full size-17.5 " />
              </div>
              <div>
                <p className="capitalize font-poppins font-normal text-sm leading-4.5 text-[#1F2937]">Sarah Johnson</p>
                <span className="text-gray-500 font-poppins font-normal text-xs leading-4">ID: 32424662778</span>
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
              <DropdownMenuItem className="p-2.5  ">
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
  );
};

export default StudentAppBar;
