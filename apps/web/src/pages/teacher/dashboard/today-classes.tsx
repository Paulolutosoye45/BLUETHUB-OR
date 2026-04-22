import { format } from "date-fns";

const TodayClasses = () => {

    const Todayclasses = [
    {
        time: "8:00",
        label: "Done",
        subject: "English Language",
        details: "JSS 2B · Room 7 · 60 min",
        students: 38,
        status: "Completed",
    },
    {
        time: "10:00",
        label: "Now",
        subject: "Basic Science",
        details: "JSS 2A · Lab 2 · 60 min",
        students: 40,
        status: "In progress",
    },
    {
        time: "13:00",
        label: "Soon",
        subject: "Biology",
        details: "SSS 1A · Room 12 · 60 min",
        students: 36,
        status: "Upcoming",
    },
];

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
    "Completed":   { bg: "bg-gray-100",        text: "text-gray-400",   dot: "bg-gray-300"   },
    "In progress": { bg: "bg-green-50",         text: "text-green-600",  dot: "bg-green-500"  },
    "Upcoming":    { bg: "bg-[#EEF1FB]",        text: "text-[#292382]",  dot: "bg-[#292382]"  },
};

const timeStyle: Record<string, string> = {
    "Done": "text-[#A8A8A4]",
    "Now":  "text-green-500",
    "Soon": "text-[#292382]",
};

    return (
        <div className="border border-[#E8E8E3] rounded-2xl bg-white overflow-hidden">
            {/* Header */}
            <div className="border-b border-[#E8E8E3] flex justify-between items-center py-4 px-5">
                <div>
                    <h2 className="text-[#0F0F0E] font-semibold text-sm">Today's classes</h2>
                    <p className="text-[#A8A8A4] font-normal text-xs mt-0.5">
                        {format(new Date(), "EEEE, dd MMMM yyyy")}
                    </p>
                </div>
                <span className="bg-[#EEF1FB] rounded-full py-1 px-3 text-[#1A2558] font-semibold text-[11px]">
                    {Todayclasses.length} classes
                </span>
            </div>

            {/* Class rows */}
            {Todayclasses.map((cls, i) => {
                const style = statusStyle[cls.status];
                return (
                    <div
                        key={i}
                        className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50/60 ${i < Todayclasses.length - 1 ? "border-b border-[#E8E8E3]" : ""
                            }`}
                    >
                        {/* Left — time + divider + subject */}
                        <div className="flex items-center gap-4">
                            {/* Time block */}
                            <div className="w-12 shrink-0 text-center">
                                <p className={`font-bold text-[13px] ${timeStyle[cls.label]}`}>{cls.time}</p>
                                <p className="text-[#A8A8A4] font-normal text-[10px] mt-0.5">{cls.label}</p>
                            </div>

                            {/* Vertical divider */}
                            <div className={`h-9 w-[2px] rounded-full shrink-0 ${cls.label === "Now" ? "bg-green-400" : "bg-[#E8E8E3]"
                                }`} />

                            {/* Dot + subject */}
                            <div className="flex items-center gap-3">
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${style.dot}`} />
                                <div>
                                    <h3 className="text-[#0F0F0E] font-semibold text-sm leading-tight">{cls.subject}</h3>
                                    <p className="text-[#A8A8A4] font-normal text-[11px] mt-0.5">{cls.details}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right — status + students */}
                        <div className="text-right shrink-0">
                            <span className={`inline-block rounded-full py-1 px-2.5 text-[11px] font-semibold ${style.bg} ${style.text}`}>
                                {cls.status}
                            </span>
                            <p className="text-[#A8A8A4] font-normal text-[11px] mt-1">{cls.students} students</p>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

export default TodayClasses