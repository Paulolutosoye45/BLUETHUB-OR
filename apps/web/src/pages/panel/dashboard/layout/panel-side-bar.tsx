import {
  BarChart2,
  Building2,
  ChevronRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Shield,
  Ticket,
  Users,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    heading: "OVERVIEW",
    items: [
      { icon: <LayoutDashboard size={15} />, label: "Dashboard", active: true },
      { icon: <BarChart2 size={15} />, label: "Analytics" },
    ],
  },
  {
    heading: "SCHOOLS",
    items: [
      { icon: <Building2 size={15} />, label: "All Schools", badge: 248 },
      { icon: <PlusCircle size={15} />, label: "Register School" },
      { icon: <Users size={15} />, label: "Administrators" },
    ],
  },
  {
    heading: "BILLING",
    items: [
      { icon: <CreditCard size={15} />, label: "Subscriptions" },
      { icon: <BarChart2 size={15} />, label: "Revenue" },
      { icon: <FileText size={15} />, label: "Invoices" },
    ],
  },
  {
    heading: "PLATFORM",
    items: [
      { icon: <Shield size={15} />, label: "Compliance" },
      { icon: <Settings size={15} />, label: "Settings" },
      { icon: <Ticket size={15} />, label: "Support Tickets", badge: 7 },
    ],
  },
];

export function PanelSidebar() {
  return (
    <aside className="w-56 flex-shrink-0  bg-[#292382] flex flex-col h-screen overflow-y-auto overflow-x-hidden
  [&::-webkit-scrollbar]:w-1
  [&::-webkit-scrollbar-track]:bg-white/5
  [&::-webkit-scrollbar-thumb]:bg-white/20
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb:hover]:bg-white/40 font-space-grotesk">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/5 font-space-grotesk">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFFFFF29] flex items-center justify-center text-white font-bold text-sm leading-[21px] font-space-grotesk">
            BH
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight font-space-grotesk">Bluetthub</p>
            <p className="text-white/40 text-[10px] font-space-grotesk">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1  px-2 py-4 flex flex-col gap-5 font-space-grotesk">
        {NAV.map((group) => (
          <div key={group.heading}>
            <p className="text-white/30 font-space-grotesk text-[9px] font-bold tracking-widest uppercase px-2 mb-1.5 font-space-grotesk">
              {group.heading}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className={`flex font-space-grotesk items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left transition-colors group ${
                    item.active
                      ? "bg-[#FFFFFF29] text-white"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className={item.active ? "text-white" : "text-white/40 group-hover:text-white/70"}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-xs font-medium font-space-grotesk">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.active ? "bg-white/20 text-white" : "bg-white/10 text-white/60"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/5 font-space-grotesk">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold font-space-grotesk flex-shrink-0">
            SO
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate font-space-grotesk">Super Admin</p>
            <p className="text-white/30 text-[10px] truncate font-space-grotesk">Bluehub HQ · Lagos</p>
          </div>
          <ChevronRight size={13} className="text-white/20 group-hover:text-white/50 transition-colors" />
        </div>
      </div>
    </aside>
  );
}