import { Building2, TrendingDown, TrendingUp, Users, Wallet, AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

interface StatCard {
  label: string;
  value: string;
  delta: string;
  deltaLabel: string;
  positive: boolean;
  icon: ReactNode;
  accent: string;
  note?: string;
}

const STATS: StatCard[] = [
  {
    label: "TOTAL SCHOOLS",
    value: "248",
    delta: "+14",
    deltaLabel: "this week",
    positive: true,
    icon: <Building2 size={16} />,
    accent: "text-blue-500 bg-blue-50",
  },
  {
    label: "ACTIVE STUDENTS",
    value: "41.2K",
    delta: "+2,340",
    deltaLabel: "vs last month",
    positive: true,
    icon: <Users size={16} />,
    accent: "text-green-500 bg-green-50",
  },
  {
    label: "MONTHLY REVENUE",
    value: "₦12.4M",
    delta: "+15%",
    deltaLabel: "vs last month",
    positive: true,
    icon: <Wallet size={16} />,
    accent: "text-purple-500 bg-purple-50",
  },
  {
    label: "PENDING APPROVALS",
    value: "7",
    delta: "Needs review",
    deltaLabel: "",
    positive: false,
    icon: <AlertCircle size={16} />,
    accent: "text-orange-500 bg-orange-50",
    note: "Needs review",
  },
];

function StatCard({ card }: { card: StatCard }) {
  return (
    <div className={`bg-white border-t-2 border-[#292382]  font-space-grotesk rounded-md  shadow-sm px-5 py-4 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold font-space-grotesk tracking-widest text-gray-400 uppercase">{card.label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center font-space-grotesk justify-center ${card.accent}`}>
          {card.icon}
        </div>
      </div>
      <p className="text-2xl font-extrabold leading-5 text-gray-800 font-space-grotesk">{card.value}</p>
      <div className="flex items-center gap-1.5">
        {card.note ? (
          <span className="text-xs font-semibold text-orange-500 font-space-grotesk">↓ {card.note}</span>
        ) : (
          <>
            {card.positive
              ? <TrendingUp size={13} className="text-green-500" />
              : <TrendingDown size={13} className="text-red-400" />}
            <span className={`text-xs font-bold font-space-grotesk ${card.positive ? "text-green-600" : "text-red-400"}`}>
              {card.delta}
            </span>
            {card.deltaLabel && (
              <span className="text-xs text-gray-400 font-space-grotesk">{card.deltaLabel}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function PanelStatsCards() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {STATS.map((s) => <StatCard key={s.label} card={s} />)}
    </div>
  );
}