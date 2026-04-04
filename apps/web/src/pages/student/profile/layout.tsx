import test_profile from "@/assets/png/test_profile.png";
import { ChevronRight, User, Settings } from "lucide-react";
import Notification from "@/assets/svg/notifyme.svg?react";
import LogOutIcon from "@/assets/svg/log-out-04.svg?react";
import Spinner from "@/assets/svg/Spinner.svg?react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@bluethub/ui-kit";
import { Outlet, useLocation } from "react-router-dom";
import StudentAppBar from "../component/app-bar";

const ProfileLayout = () => {
      const location = useLocation();
      const currentPath = location.pathname;
    return (
        <section className="h-screen bg-gray-50 overflow-y-scroll
      [&::-webkit-scrollbar]:w-1
      [&::-webkit-scrollbar]:h-2.5
      [&::-webkit-scrollbar-track]:rounded-full
      [&::-webkit-scrollbar-track]:bg-[#4F61E814]
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb]:bg-gray-400
      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <StudentAppBar />

            <div className="flex gap-6 my-10 w-full px-10">
                {/* Sidebar/card Profile Section */}
                <div className="w-87.5 min-w-75 bg-white rounded-xl shadow-md font-poppins border border-gray-100 flex flex-col">
                    {/* Header */}
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-800">My Profile</h2>
                    </div>

                    {/* Profile Section */}
                    <div className="flex items-center gap-4 p-6 border-b border-gray-200">
                        <div className="w-20 h-20 rounded-full border-2 border-blue-400 overflow-hidden">
                            <img
                                src={test_profile}
                                alt="Profile"
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <div>
                            <p className="capitalize text-base font-medium text-gray-800">
                                Sarah Johnson
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                ID: 32424662778
                            </p>
                        </div>
                    </div>

                    {/* Settings List */}
                    <div className="divide-y divide-gray-100">
                        {/* My Profile */}
                        <button className={`w-full flex justify-between items-center p-4 hover:bg-gray-50 transition ${currentPath === '/student/profile' ? 'bg-gray-200 hover:bg-gray-200 ' : ''}`}>
                            <div className="flex items-center gap-3">
                                <User className="size-5" />
                                <span className="text-sm font-medium text-gray-700">My Profile</span>
                            </div>
                            <ChevronRight className="size-5 text-gray-400" />
                        </button>

                        {/* Settings */}
                        <button className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition">
                            <div className="flex items-center gap-3">
                                <Settings className="size-5" />
                                <span className="text-sm font-medium text-gray-700">Settings</span>
                            </div>
                            <ChevronRight className="size-5 text-gray-400" />
                        </button>

                        {/* Performance */}
                        <button className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition">
                            <div className="flex items-center gap-3">
                                <Spinner className="size-5" />
                                <span className="text-sm font-medium text-gray-700">My Performance</span>
                            </div>
                            <ChevronRight className="size-5 text-gray-400" />
                        </button>

                        {/* Notification Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-3">
                                        <Notification className="size-5 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-700">Notifications</span>
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">Allow</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40 bg-white shadow-md border border-gray-100 rounded-md">
                                <DropdownMenuLabel className="text-gray-700 text-sm">
                                    Notifications
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">Allow</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">Mute</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Log Out */}
                        <button className="w-full flex justify-between items-center p-4 hover:bg-red-50 transition">
                            <div className="flex items-center gap-3">
                                <LogOutIcon className="size-5 text-red-500" />
                                <span className="text-sm font-medium text-red-600">Log Out</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Personal Data Section */}
                <div className="flex-1 bg-white rounded-xl shadow-md font-poppins border border-gray-100">
                    <Outlet />
                </div>
            </div>
        </section>
    );
};

export default ProfileLayout;
