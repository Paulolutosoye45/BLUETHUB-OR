import { ChevronRight, Search, Settings, User } from "lucide-react";
import Spinner from "@/assets/svg/Spinner.svg?react";

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
} from "@bluethub/ui-kit";
import LogOutIcon from "@/assets/svg/log-out-04.svg?react";
import test_profile from "@/assets/png/test_profile.png";
import { useState } from "react";
import { Link } from "react-router-dom";
import Notification from "@/assets/svg/notifyme.svg?react";

const TeacherAppBar = () => {
  const [notificationStatus, setNotificationStatus] = useState<string>("");

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
    <div className="bg-white rounded-[15px] flex items-center justify-between px-4 py-2 shadow">
      {/* Search */}
      <div className="flex-1">
        <div className="flex items-center bg-white rounded-[15px] border border-gray-300 font-poppins font-medium w-full px-3">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 py-2 outline-none bg-transparent font-poppins"
          />
          <button>
            <Search className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Date, Notification, Profile */}
      <div className="flex items-center gap-6 ml-6">
        {/* Date + Notification */}
        <div className="flex items-center gap-4">
          <p className="font-poppins font-semibold text-xs text-student-chestnut">
            {dayName},<span className="font-medium"> {formattedDate}</span>
          </p>
          <Notification />
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="border-none cursor-pointer">
            <div className="flex items-center gap-4 p-3 hover:bg-gray-100 rounded transition">
              <div className="flex justify-center items-center bg-[#D9D9D9] rounded-full border-2 border-[#34A9FF]">
                <img
                  src={test_profile}
                  alt="profile"
                  className="object-cover rounded-full w-9.75 h-9.5"
                />
              </div>
              <p className="font-poppins font-medium text-base text-student-chestnut capitalize mr-2">
                Sarah Johnson
              </p>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-77 h-96 rounded-2xl px-5 py-2.5 border border-white m-2.5">
            {/* Label with big avatar */}
            <DropdownMenuLabel className="flex items-center gap-4 mb-2">
              <div className="flex justify-center items-center bg-[#D9D9D9] rounded-full border-2 border-[#34A9FF]">
                <img
                  src={test_profile}
                  alt="profile"
                  className="object-cover rounded-full size-17.5"
                />
              </div>
              <div>
                <p className="capitalize font-poppins font-normal text-sm leading-4.5 text-[#1F2937]">
                  Sarah Johnson
                </p>
                <span className="text-gray-500 font-poppins font-normal text-xs leading-4">
                  ID: 32424662778
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="border border-[#E5E7EB] mb-2" />
            <DropdownMenuGroup className="space-y-2">
              {/* Profile */}
              <DropdownMenuItem className="p-2.5 ">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2.5">
                    <User className="size-6" />
                    <Link
                      to="/student/profile"
                      className="text-blck-b2 font-poppins text-sm"
                    >
                      My Profile
                    </Link>
                  </div>
                  <ChevronRight className="size-6" />
                </div>
              </DropdownMenuItem>
              {/* Settings */}
              <DropdownMenuItem className="p-2.5">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2.5">
                    <Settings className="size-6 text-[#3A3A3ABF]/75%" />
                    <p className="text-blck-b2 font-poppins text-sm">
                      Settings{" "}
                    </p>
                  </div>
                  <ChevronRight className="size-6" />
                </div>
              </DropdownMenuItem>
              {/* Performance */}
              <DropdownMenuItem className="p-2.5 ">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2.5">
                    <Spinner className="size-6 text-[#3A3A3ABF]/75%" />
                    <p className="text-blck-b2 font-poppins text-sm">
                      {" "}
                      My Performance{" "}
                    </p>
                  </div>
                  <ChevronRight className="size-6" />
                </div>
              </DropdownMenuItem>
              {/* Notification Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="p-2.5 cursor-pointer">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2.5">
                      <Notification className="size-5 text-gray-600" />
                      <p className="text-blck-b2 font-poppins text-sm">
                        Notification
                      </p>
                    </div>
                    <p className="font-poppins text-xs leading-4.5 text-gray-600">
                      {notificationStatus ? (
                        <span className="text-student-chestnut">
                          {notificationStatus}
                        </span>
                      ) : (
                        "Allow"
                      )}
                    </p>
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-16.75 border border-white">
                    <DropdownMenuItem
                      onClick={() => setNotificationStatus("Allow")}
                      className={
                        notificationStatus === "Allow" ? "text-student-chestnut" : ""
                      }
                    >
                      Allow
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setNotificationStatus("Mute")}
                      className={
                        notificationStatus === "Mute" ? "text-student-chestnut" : ""
                      }
                    >
                      Mute
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              {/* Log Out */}
              <DropdownMenuItem className="p-2.5 ">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2.5">
                    <LogOutIcon className="size-6 text-[#3A3A3ABF]/75%" />
                    <p className="text-blck-b2 font-poppins text-sm">
                      {" "}
                      Log Out{" "}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TeacherAppBar;
