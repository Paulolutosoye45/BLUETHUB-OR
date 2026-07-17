import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@bluethub/ui-kit";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@bluethub/ui-kit";

interface ComboboxOption {
  label: string;
  value: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  allowCustom?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  allowCustom = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(""); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-left transition-colors",
            "placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F61E8]/20 focus:border-[#4F61E8]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-gray-300",
            className
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px] min-h-[180px]">
            {search.trim() && allowCustom && !options.some((o) => o.label.toLowerCase() === search.trim().toLowerCase()) && (
              <CommandItem
                key={`custom-${search}`}
                value={`__custom__${search}`}
                onSelect={() => {
                  onChange(search.trim());
                  setSearch("");
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === search.trim() ? "opacity-100" : "opacity-0")} />
                Use "{search.trim()}"
              </CommandItem>
            )}
            {options.length === 0 && !allowCustom && <CommandEmpty>{emptyText}</CommandEmpty>}
            {options
              .filter((opt) => !search.trim() || opt.label.toLowerCase().includes(search.trim().toLowerCase()))
              .map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value);
                    setSearch("");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
