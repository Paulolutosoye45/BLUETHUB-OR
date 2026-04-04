import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Label
} from "@bluethub/ui-kit";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const SelectTopic = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState<string>("");

    const TOPIC_OPTIONS = [
        { label: "Algebra", icon: "🧮" },
        { label: "Geometry", icon: "📈" },
        { label: "Calculus", icon: "📊" },
        { label: "Statistics", icon: "📉" },
        { label: "Probability", icon: "🎲" },
        { label: "Pie Chart", icon: "📘" },
    ];

    return (
        <div className="pt-6 pb-10 px-6 border border-[#E5E7EB] rounded-[10px] h-113.5 shadow-sm bg-white">
            <Label className="font-Poppins font-medium text-base text-blck-b2 mb-3 block">
                Select Topic
            </Label>

            <DropdownMenu onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className={`w-full flex justify-between items-center font-Poppins text-sm font-medium py-5 px-4 rounded-md border border-[#D1D5DB] text-blck-b2 focus:outline-none focus:ring-0 ${value ? "bg-white" : "text-[#9A9A9A]"
                            }`}
                    >
                        <span>{value || "Select Topic"}</span>
                        <ChevronDown
                            className={`w-5 h-5 text-[#6B7280] transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                }`}
                        />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width)
             rounded-[10px] 
             border border-[#E5E7EB] 
             shadow-lg 
             bg-white 
             p-2 
             mt-1 
           
             overflow-y-auto 
             scroll-smooth
             [&::-webkit-scrollbar]:w-1.5 
             [&::-webkit-scrollbar-thumb]:bg-gray-300 
             [&::-webkit-scrollbar-thumb]:rounded-full"
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    avoidCollisions={false}   // 👈 Important: ensures it won’t flip upward
                >
                    <DropdownMenuGroup className="space-y-1">
                        {TOPIC_OPTIONS.map((option) => (
                            <DropdownMenuItem
                                key={option.label}
                                onClick={() => setValue(option.label)}
                                className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200 cursor-pointer ${value === option.label
                                        ? "bg-[#E0E7FF] text-student-chestnut"
                                        : "text-blck-b2 hover:bg-[#F3F4F6]"
                                    }`}
                            >
                                <span className="text-lg">{option.icon}</span>
                                <span className="font-Poppins text-sm font-medium">
                                    {option.label}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                </DropdownMenuContent>

            </DropdownMenu>
        </div>
    );
};

export default SelectTopic;
