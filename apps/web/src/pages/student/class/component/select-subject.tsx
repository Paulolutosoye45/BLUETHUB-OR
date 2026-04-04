import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Label
} from "@bluethub/ui-kit";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

const SelectSubject = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<string>();

  const SUBJECT_OPTIONS = [
    { label: "Mathematics", value: "mathematics" },
    { label: "English", value: "english" },
    { label: "Physics", value: "physics" },
    { label: "Chemistry", value: "chemistry" },
    { label: "Biology", value: "biology" },
    { label: "Computer Science", value: "computer_science" },
  ];

  return (
    <div className="pt-6 pb-10 px-6 border border-black/20  rounded-[10px]">
      <Label className="font-Poppins font-medium text-base text-blck-b2 mb-5">
        Select Subject
      </Label>

      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`relative w-full justify-between font-Poppins text-sm font-medium transition-all duration-300 py-5 px-4 rounded-[6px] border border-black/30 ${
              value ? "text-blck-b2" : "text-[#9A9A9A]"
            }`}
          >
            <span className="capitalize font-Poppins text-sm font-medium ">
              {value || "Select Subject"}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-chestnut/70 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) rounded-[6px] border border-black/20 shadow-md bg-white/95 backdrop-blur-sm p-2"
          align="start"
          sideOffset={8}
        >
          <DropdownMenuGroup className="space-y-1">
            {SUBJECT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className={`font-Poppins text-sm font-medium py-3 px-4 rounded-md cursor-pointer transition-all duration-200 ${
                  value === option.label
                    ? "bg-gray-500 text-white"
                    : "text-blck-b2 hover:bg-gray-100"
                }`}
                onClick={() => setValue(option.label)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {value === option.label && (
                    <Check className="w-4 h-4 ml-2 text-white" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SelectSubject;
