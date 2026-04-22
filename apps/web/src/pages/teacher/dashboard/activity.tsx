import { CalendarDays, ClipboardList, Plus, UserRound, Users } from "lucide-react";

 export const cardData = [
  {
    label: "Total Students",
    count: 128,
    change: "+5 this week",
    icon: (
      <UserRound />
    ),
  },
  {
    label: "Active Classes",
    count: 8,
    change: "+1 this week",
    icon: (
      <UserRound />
    ),
  },
  {
    label: "New Assessments",
    count: 15,
    change: "+3 this week",
    icon: (
      <UserRound />
    ),
  },
  {
    label: "Attendance Rate",
    count: "92%",
    change: "2% this week",
    icon: (
      <UserRound />
    ),
  },
  {
    label: "Staff On Duty",
    count: 24,
    change: "None this week",
    icon: (
      <UserRound />
    ),
  },
];

const quickActions = [
  { label: "Submit lesson", description: "Send to admin for review", icon: <Plus className="text-chestnut size-4" /> },
  { label: "New assessment", description: "Create & assign to class", icon: <ClipboardList className="text-chestnut size-4" /> },
  { label: "View students", description: "Scores & progress", icon: <Users className="text-chestnut size-4" /> },
  { label: "Timetable", description: "View this week's schedule", icon: <CalendarDays className="text-chestnut size-4" /> },
];

const Activity = () => {
  return (
    <div className="w-full space-y-2">
      <div className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden scrollbar-none snap-x snap-mandatory scroll-smooth py-2 px-1">
        {cardData.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-[13px] border border-[#D9D9D9] px-5 py-4 min-w-55 max-w-55 snap-start shrink-0 transition hover:shadow-md"
          >
            <div className="h-9 w-9 bg-[#EEF1FB] text-chestnut rounded-[9px] flex items-center justify-center">
              {card.icon}
            </div>
            <h4 className="font-semibold text-[28px] leading-tight text-[#0F0F0E] pt-3">{card.count}</h4>
            <h3 className="font-normal text-xs text-[#3A3A3A80] capitalize pt-1">{card.label}</h3>
            <p className="text-chestnut font-normal text-sm pt-1">{card.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map(action => (
          <div
            key={action.label}
            className="group border border-[#E8E8E3]  py-3.5 px-5 rounded-[12px] bg-white flex items-center gap-3.5 cursor-pointer  transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-chestnut/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="bg-[#EEF1FB] size-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-chestnut/10 transition-all duration-300">
              {action.icon}
            </div>

            <div className="space-y-0.5 relative">
              <h3 className="text-[#0F0F0E] font-semibold text-xs group-hover:text-chestnut transition-colors duration-300">
                {action.label}
              </h3>
              <p className="text-[#A8A8A4] text-[11px] font-normal leading-tight">
                {action.description}
              </p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-chestnut/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    </div>
  )
};

export default Activity;
