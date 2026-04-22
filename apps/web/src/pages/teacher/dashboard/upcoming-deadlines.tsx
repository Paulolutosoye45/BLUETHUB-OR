
const UpcomingDeadlines = () => {
    const deadlines = [
        { day: "18", month: "APR", title: "Mid-term test due", class: "JSS 2A", daysLeft: 2, status: "Urgent" },
        { day: "20", month: "APR", title: "Comprehension quiz", class: "JSS 2B", daysLeft: 4, status: "Soon" },
        { day: "22", month: "APR", title: "Ecology assignment", class: "SSS 1A", daysLeft: 6, status: "On track" },
        { day: "28", month: "APR", title: "Term essay submission", class: "JSS 2B", daysLeft: 12, status: "On track" },
    ];

    const statusStyle: Record<string, { bg: string; text: string; dateBg: string; dateText: string }> = {
        "Urgent": { bg: "bg-[#FDECEA]", text: "text-[#7A1A10]", dateBg: "bg-[#FDECEA]", dateText: "text-[#7A1A10]" },
        "Soon": { bg: "bg-[#FFF8ED]", text: "text-[#7A4D00]", dateBg: "bg-[#FFF8ED]", dateText: "text-[#7A4D00]" },
        "On track": { bg: "bg-green-50", text: "text-green-600", dateBg: "bg-[#EEF1FB]", dateText: "text-[#292382]" },
    };

    return (
        <div className="border border-[#E8E8E3] rounded-2xl p-5 bg-white">
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-[#0F0F0E] font-semibold text-sm">Upcoming deadlines</h3>
            </div>

            {/* List */}
            <div className="divide-y divide-[#E8E8E3]">
                {deadlines.map((d, i) => {
                    const style = statusStyle[d.status];
                    return (
                        <div key={i} className="flex items-center justify-between py-3.5 hover:bg-gray-50/50 transition-colors rounded-lg px-1 -mx-1">
                            {/* Left */}
                            <div className="flex items-center gap-3">
                                {/* Date block */}
                                <div className={`${style.dateBg} rounded-xl w-12 h-12 flex flex-col items-center justify-center shrink-0`}>
                                    <span className={`font-bold text-base leading-none ${style.dateText}`}>{d.day}</span>
                                    <span className={`font-semibold text-[9px] mt-0.5 ${style.dateText}`}>{d.month}</span>
                                </div>

                                {/* Title */}
                                <div>
                                    <h3 className="text-[#0F0F0E] font-semibold text-sm leading-tight">{d.title}</h3>
                                    <p className="text-[#A8A8A4] font-normal text-[11px] mt-0.5">
                                        {d.class} · {d.daysLeft} days left
                                    </p>
                                </div>
                            </div>

                            {/* Status pill */}
                            <span className={`inline-block rounded-full py-1 px-3 text-[11px] font-semibold shrink-0 ${style.bg} ${style.text}`}>
                                {d.status}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default UpcomingDeadlines