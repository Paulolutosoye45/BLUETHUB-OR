import Downloadbtn from "@/assets/svg/downloadv.svg?react";
import Chatroom from "@/assets/svg/Chatroom.svg?react";
import Settings from "@/assets/svg/Qsettings.svg?react";
const QuickAction = () => {
  const actions = [
    {
      label: "Download Recorded Session",
      icon: Downloadbtn,
      iconClassName: "text-[#319F43]",
      cardClassName: "from-[#edfdf1] to-white",
    },
    {
      label: "Download Media (PDF, MP4)",
      icon: Downloadbtn,
      iconClassName: "text-[#6C30D4]",
      cardClassName: "from-[#f6efff] to-white",
    },
    {
      label: "Chatroom",
      icon: Chatroom,
      iconClassName: "text-[#dd9b16]",
      cardClassName: "from-[#fff8e8] to-white",
    },
    {
      label: "Settings",
      icon: Settings,
      iconClassName: "text-[#ef4444]",
      cardClassName: "from-[#fff1f2] to-white",
    },
  ];

  return (
    <div className="overflow-hidden rounded-[26px] border border-white/75 bg-white/82 shadow-[0_22px_55px_-34px_rgba(15,23,42,0.28)] backdrop-blur-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="font-poppins text-lg font-semibold text-slate-900 capitalize">
            Quick Action{" "}
          </h2>
          <p className="mt-1 text-sm text-slate-500">Jump into the things students use most.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                type="button"
                className={`flex flex-col items-start justify-between gap-4 rounded-[22px] border border-slate-100 bg-gradient-to-br ${action.cardClassName} px-4 py-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_30px_-24px_rgba(79,97,232,0.5)]`}
              >
                <div className={`rounded-2xl bg-white p-3 shadow-sm ${action.iconClassName}`}>
                  <Icon className={action.iconClassName} />
                </div>
                <p className="text-sm font-semibold leading-snug text-slate-800">
                  {action.label}
                </p>
              </button>
            );
          })}
        </div>
    </div>
  );
};

export default QuickAction;
