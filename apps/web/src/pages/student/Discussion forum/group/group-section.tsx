import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function GroupSection({ title, count, children, defaultOpen = true }: {
    title: string; count?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
                <span className="flex-1 text-sm font-bold text-gray-700 text-left flex items-center gap-2">
                    {title}
                    {count !== undefined && (
                        <span className="text-xs font-bold bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{count}</span>
                    )}
                </span>
                {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {open && <div className="border-t border-gray-50">{children}</div>}
        </div>
    );
}