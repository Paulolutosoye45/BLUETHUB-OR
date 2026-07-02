import { CreditCard, LibraryBig, School, Ticket, UsersRound, Zap } from "lucide-react";

interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  text: string;
  time: string;
}

const ACTIVITIES: ActivityItem[] = [
  { id: "a1", icon: <School size={16} />, iconBg: "bg-blue-100",   text: "Adeola Crown Academy completed onboarding",                         time: "3 min ago" },
  { id: "a2", icon: <CreditCard size={16} />, iconBg: "bg-yellow-100", text: "Kings SS subscription payment received — ₦85,000",                  time: "14 min ago" },
  { id: "a3", icon: <Ticket size={16} />, iconBg: "bg-red-100",    text: "New support ticket from Bright Horizon Institute",                  time: "31 min ago" },
  { id: "a4", icon: <LibraryBig size={16} />, iconBg: "bg-purple-100", text: "Nairobi International registration submitted awaiting review",       time: "1h ago" },
  { id: "a5", icon: <UsersRound size={15} />, iconBg: "bg-green-100",  text: "Grace College added 120 new students",                              time: "2h ago" },
];

interface LiveActivityProps {
  onSeeAll?: () => void;
}

export function PanelLiveActivity({ onSeeAll }: LiveActivityProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#29238217]">
        <h3 className="text-sm font-bold text-[#13112E] font-space-grotesk flex items-center gap-2">
          {/* <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> */}
          <Zap size={16} className="text-[#4F61E8]" />
          Live Activity
        </h3>
        <button onClick={onSeeAll} className="text-xs font-semibold font-space-grotesk text-[#292382] hover:underline">
          See all
        </button>
      </div>

      <div className="divide-y divide-gray-50">
        {ACTIVITIES.map((a) => (
          <div key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors">
            <div className={`w-8 h-8 rounded-full ${a.iconBg} flex items-center justify-center text-base flex-shrink-0`}>
              {a.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#13112E] leading-snug font-space-grotesk">{a.text}</p>
              <p className="text-[10px]  mt-0.5 font-space-grotesk">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}