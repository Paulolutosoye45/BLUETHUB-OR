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

export interface SubjectOption {
  label: string;
  value: string;
}

interface SelectSubjectProps {
  options: SubjectOption[];
  value?: string;
  onChange: (value: string) => void;
}

const SelectSubject = ({ options, value, onChange }: SelectSubjectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div className="rounded-[16px] sm:rounded-[24px] border border-white/70 bg-white/90 px-3 sm:px-5 py-3 sm:py-5">
      <Label className="mb-3 sm:mb-4 block text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
        Select Subject
      </Label>

      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`relative h-11 w-full justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium transition-all duration-300 ${
              value ? "text-slate-800" : "text-slate-400"
            }`}
          >
            <span className="capitalize text-sm font-medium">
              {selectedLabel || "Select Subject"}
            </span>
            <ChevronDown
              className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur-sm"
          align="start"
          sideOffset={8}
        >
          <DropdownMenuGroup className="space-y-1">
            {options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  value === option.value
                    ? "bg-[#4255db] text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => onChange(option.value)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {value === option.value && (
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
