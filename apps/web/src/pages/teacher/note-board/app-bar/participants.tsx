import Pen from "@/assets/svg/pen.svg?react";
import lecturer from "@/assets/jpeg/lecturer.jpg";
import { BiDotsVerticalRounded, BiSolidBell } from "react-icons/bi";

import { Avatar, AvatarFallback, AvatarImage } from "@bluethub/ui-kit";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@bluethub/ui-kit";


const Participants = () => {
    return (
        <div className="flex space-x-7">
            <BiSolidBell className="text-chestnut text-2xl" />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <BiDotsVerticalRounded className="text-chestnut text-2xl cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className=" h-full overflow-hidden w-56 mt-4.5 mr-2 border-none outline-none ring-2 ring-blue-500 shadow-2xl"
                    align="end"
                >
                    <DropdownMenuLabel>
                        <div className="flex items-center space-x-4">
                            <div className="font-poppins">
                                <h2 className="font-semibold text-[10.36px] text-chestnut/85">
                                    Steve Babajide
                                </h2>
                                <h2 className="font-semibold text-[8.26px] text-chestnut/50">
                                    Steve Babajide
                                </h2>
                            </div>
                            <div className="size-10.25 rounded-full  border-2 border-lowchest flex items-center justify-center">
                                <img
                                    src={lecturer}
                                    className="text-white/90 rounded-full size-[33.12px] object-cover "
                                />
                            </div>
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuGroup className="px-2 ">
                        <h2 className="font-poppins font-semibold text-xs leading-[29.48px] text-chestnut/85">
                            Notes/Board{" "}
                        </h2>
                        <DropdownMenuItem className="flex items-center space-x-1 ">
                            <div className=" size-[33.69px] rounded-full bg-[#D92D25] border-2 border-white flex items-center justify-center">
                                <Pen className="text-white/90 size-3" />
                            </div>
                            <div className="font-poppins  ">
                                <h2 className="font-semibold text-[10.36px] text-chestnut/85">
                                    Note 1: Force{" "}
                                </h2>
                                <h2 className="font-semibold text-[8.26px] text-chestnut/50">
                                    30 Minutes ago
                                </h2>
                            </div>
                        </DropdownMenuItem>
                        <div className="ml-[1.7rem] border-l-2 border-[#D0C9F4]">
                            <div className="w-[1.68px] h-4"></div>
                        </div>
                        <DropdownMenuItem className="flex items-center space-x-1 ">
                            <div className=" size-[33.69px] rounded-full bg-Bpink border-2 border-white flex items-center justify-center">
                                <Pen className="text-white/90 size-3" />
                            </div>
                            <div className="font-poppins  ">
                                <h2 className="font-semibold text-[10.36px] text-chestnut/85">
                                    Note 2: Diagram{" "}
                                </h2>
                                <h2 className="font-semibold text-[8.26px] text-chestnut/50">
                                    40 Minutes ago
                                </h2>
                            </div>
                        </DropdownMenuItem>
                        <div className="ml-[1.7rem] border-l-2 border-[#D0C9F4]">
                            <div className="w-[1.68px] h-4"></div>
                        </div>
                        <DropdownMenuItem className="flex items-center space-x-1 ">
                            <div className=" size-[33.69px] rounded-full bg-Bmark border-2 border-white flex items-center justify-center">
                                <Pen className="text-white/90 size-3" />
                            </div>
                            <div className="font-poppins">
                                <h2 className="font-semibold text-[10.36px] text-chestnut/85">
                                    Calculation{" "}
                                </h2>
                                <h2 className="font-semibold text-[8.26px] text-chestnut/50">
                                    An hour ago{" "}
                                </h2>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuItem>
                        <h2 className=" mx-2 mt-2 font-poppins font-semibold text-xs leading-6.75 text-chestnut/85">
                            Participants (40)
                        </h2>
                    </DropdownMenuItem>

                    <DropdownMenuGroup className="h-[56%] px-4 border-0 border-Bmark scroll-smooth overflow-auto hide-scrollbar">
                        {Array.from({ length: 40 }).map((_, idx) => (
                            <DropdownMenuItem key={idx} className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <h2 className="font-poppins font-semibold text-sm leading-6.75 text-chestnut/85">
                                    Anthony Jim
                                </h2>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default Participants