import { useEffect, useState } from "react";
import { format, differenceInDays } from "date-fns";
import { Loader2, Inbox } from "lucide-react";
import { teacherService, type UpcomingDeadlineItem } from "@/services/teacher";

const UpcomingDeadlines = () => {
    const [deadlines, setDeadlines] = useState<UpcomingDeadlineItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeadlines = async () => {
            try {
                const res = await teacherService.getUpcomingDeadlines({ limit: 5 });
                if (res.data.status === "successful") {
                    setDeadlines(res.data.data.deadlines);
                }
            } catch (err) {
                console.error("Failed to fetch deadlines:", err);
                setDeadlines([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDeadlines();
    }, []);

    const getStatusFromDaysLeft = (daysLeft: number): string => {
        if (daysLeft <= 2) return "Urgent";
        if (daysLeft <= 5) return "Soon";
        return "On track";
    };

    const statusStyle: Record<string, { bg: string; text: string; dateBg: string; dateText: string }> = {
        "Urgent": { bg: "bg-[#FDECEA]", text: "text-[#7A1A10]", dateBg: "bg-[#FDECEA]", dateText: "text-[#7A1A10]" },
        "Soon": { bg: "bg-[#FFF8ED]", text: "text-[#7A4D00]", dateBg: "bg-[#FFF8ED]", dateText: "text-[#7A4D00]" },
        "On track": { bg: "bg-green-50", text: "text-green-600", dateBg: "bg-[#EEF1FB]", dateText: "text-[#292382]" },
    };

    if (loading) {
        return (
            <div className="border border-[#E8E8E3] rounded-2xl p-5 bg-white">
                <div className="mb-4">
                    <h3 className="text-[#0F0F0E] font-semibold text-sm">Upcoming deadlines</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-chestnut" />
                </div>
            </div>
        );
    }

    return (
        <div className="border border-[#E8E8E3] rounded-2xl p-5 bg-white">
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-[#0F0F0E] font-semibold text-sm">Upcoming deadlines</h3>
            </div>

            {/* Empty state */}
            {deadlines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Inbox className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No upcoming deadlines</p>
                </div>
            ) : (
                /* List */
                <div className="divide-y divide-[#E8E8E3]">
                    {deadlines.map((d) => {
                        const dueDate = new Date(d.dueDate);
                        const daysLeft = Math.max(0, differenceInDays(dueDate, new Date()));
                        const status = getStatusFromDaysLeft(daysLeft);
                        const style = statusStyle[status];
                        const day = format(dueDate, "dd");
                        const month = format(dueDate, "MMM").toUpperCase();

                        return (
                            <div key={d.id} className="flex items-center justify-between py-3.5 hover:bg-gray-50/50 transition-colors rounded-lg px-1 -mx-1">
                                {/* Left */}
                                <div className="flex items-center gap-3">
                                    {/* Date block */}
                                    <div className={`${style.dateBg} rounded-xl w-12 h-12 flex flex-col items-center justify-center shrink-0`}>
                                        <span className={`font-bold text-base leading-none ${style.dateText}`}>{day}</span>
                                        <span className={`font-semibold text-[9px] mt-0.5 ${style.dateText}`}>{month}</span>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <h3 className="text-[#0F0F0E] font-semibold text-sm leading-tight">{d.title}</h3>
                                        <p className="text-[#A8A8A4] font-normal text-[11px] mt-0.5">
                                            {d.className} · {daysLeft === 0 ? "Due today" : `${daysLeft} days left`}
                                            {d.submissionCount > 0 && ` · ${d.submissionCount}/${d.totalStudents} submitted`}
                                        </p>
                                    </div>
                                </div>

                                {/* Status pill */}
                                <span className={`inline-block rounded-full py-1 px-3 text-[11px] font-semibold shrink-0 ${style.bg} ${style.text}`}>
                                    {status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    )
}

export default UpcomingDeadlines