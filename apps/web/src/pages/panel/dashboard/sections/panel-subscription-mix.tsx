import { SquareLibrary } from "lucide-react";

interface Tier {
  label: string;
  pct: number;
  color: string;
  barColor: string;
}

const TIERS: Tier[] = [
  { label: "Premium",  pct: 58, color: "text-indigo-600", barColor: "bg-indigo-600" },
  { label: "Standard", pct: 28, color: "text-green-600",  barColor: "bg-green-500"  },
  { label: "Basic",    pct: 10, color: "text-orange-500", barColor: "bg-orange-400" },
  { label: "Trial",    pct: 4,  color: "text-gray-400",   barColor: "bg-gray-300"   },
];

export function PanelSubscriptionMix() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center p-4 gap-2 font-space-grotesk border-b border-[#29238217]">
        <SquareLibrary size={16} /> Subscription Mix
      </h3>

      <div className="flex flex-col gap-3 px-4 pb-4">
        {TIERS.map((t) => (
          <div key={t.label} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-16 flex-shrink-0 font-space-grotesk">{t.label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full font-space-grotesk ${t.barColor} transition-all duration-700`}
                style={{ width: `${t.pct}%` }}
              />
            </div>
            <span className={`text-xs font-bold w-8 text-right font-space-grotesk ${t.color}`}>{t.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}