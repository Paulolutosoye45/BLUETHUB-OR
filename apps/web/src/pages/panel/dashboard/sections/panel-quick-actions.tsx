import type { ReactNode } from "react";
import { CreditCard, School, Ticket, UserPen, } from 'lucide-react';

interface Action {
  icon: ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
  accent: string;
}

const ACTIONS: Action[] = [
  { icon: <School size={16} />, label: "Register School",       description: "Onboard a new school onto Bluehub", accent: "bg-blue-100 text-blue-600" },
  { icon: <UserPen  size={16} />, label: "Add Admin User",         description: "Create a school-level administrator", accent: "bg-green-100 text-green-600" },
  { icon: <CreditCard size={16} />, label: "Manage Subscriptions",   description: "View plans, renewals, and billing", accent: "bg-purple-100 text-purple-600" },
  { icon: <Ticket size={16} />, label: "Support Tickets",        description: "7 open tickets need attention", accent: "bg-orange-100 text-orange-600" },
];

export function PanelQuickActions() {
  return (
    <div>
      <h3 className="text-base font-bold text-gray-700 mb-3 font-space-grotesk">Quick Actions</h3>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="bg-white rounded-md border border-gray-100 shadow-sm px-4 py-4 text-left transition-all group"
          >
            <div className={`text-2xl mb-2 w-8 h-8 rounded-xl flex items-center font-space-grotesk justify-center ${a.accent}`}>{a.icon}</div>
            <p className="text-sm font-bold font-space-grotesk text-gray-700 group-hover:text-[#4F61E8] transition-colors">
              {a.label}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-space-grotesk">{a.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}