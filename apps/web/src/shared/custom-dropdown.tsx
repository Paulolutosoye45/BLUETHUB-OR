import { 
         Label, 
         DropdownMenu,
         DropdownMenuContent,
         DropdownMenuGroup,
         DropdownMenuItem,
         DropdownMenuTrigger,
         Button
        } from "@bluethub/ui-kit";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

// Reusable Dropdown Component
interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
}

 const CustomDropdown = ({ label, icon, placeholder, options, value, onChange }: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-3 w-full max-w-105">
      <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
        {icon}
        {label}
      </Label>

      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`relative ring-2 w-full justify-between font-medium transition-all duration-300 border-0 py-6 px-4 text-base rounded-xl group ${
              value
                ? "ring-chestnut/40 text-chestnut bg-chestnut/5"
                : "ring-chestnut/20 text-chestnut/50 bg-white/80"
            } hover:ring-chestnut/40 hover:bg-chestnut/5 focus:ring-chestnut/50 focus:ring-4`}
          >
            <span className={value ? "text-chestnut font-semibold" : ""}>
              {value || placeholder}
            </span>
            <ChevronDown 
              className={`w-5 h-5 text-chestnut/70 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border-2 border-chestnut/10 shadow-xl bg-white/95 backdrop-blur-sm p-2"
          align="start"
          sideOffset={8}
        >
          <DropdownMenuGroup className="space-y-1">
            {options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className={`font-medium text-base py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  value === option.label
                    ? "bg-chestnut text-white"
                    : "text-chestnut hover:bg-chestnut/10 hover:text-chestnut"
                }`}
                onClick={() => onChange(option.label)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {value === option.label && (
                    <Check className="w-5 h-5 ml-2 text-white" />
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


export default  CustomDropdown