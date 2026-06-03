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

export interface TopicOption {
    label: string;
    value: string;
}

interface SelectTopicProps {
    options: TopicOption[];
    value?: string;
    onChange: (value: string) => void;
}

const SelectTopic = ({ options, value, onChange }: SelectTopicProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedLabel = options.find((option) => option.value === value)?.label;

    return (
        <div className="rounded-[24px] border border-white/70 bg-white/90 px-5 py-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.42)]">
            <Label className="mb-4 block text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Select Topic
            </Label>

            <DropdownMenu onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className={`h-11 w-full items-center justify-between rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 ${value ? "bg-white" : "text-slate-400"
                            }`}
                    >
                        <span>{selectedLabel || "Select Topic"}</span>
                        <ChevronDown
                            className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                }`}
                        />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width)
             rounded-xl 
             border border-slate-200 
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
                        {options.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => onChange(option.value)}
                                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${value === option.value
                                        ? "bg-[#eef2ff] text-[#4255db]"
                                        : "text-slate-700 hover:bg-[#F3F4F6]"
                                    }`}
                            >
                                <span className="text-sm font-medium">
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
