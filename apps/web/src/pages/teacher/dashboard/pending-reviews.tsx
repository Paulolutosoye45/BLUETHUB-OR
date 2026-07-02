import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Inbox } from "lucide-react";
import { teacherService, type PendingReviewItem } from "@/services/teacher";

const PendingReviews = () => {
    const [reviews, setReviews] = useState<PendingReviewItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await teacherService.getPendingReviews();
                if (res.data.status === "successful") {
                    setReviews(res.data.data.items);
                }
            } catch (err) {
                console.error("Failed to fetch pending reviews:", err);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const statusStyle: Record<string, { bg: string; text: string }> = {
        "pending": { bg: "bg-[#FFF8ED]", text: "text-[#7A4D00]" },
        "under_review": { bg: "bg-[#FFF8ED]", text: "text-[#7A4D00]" },
        "needs_revision": { bg: "bg-red-50", text: "text-red-500" },
        "approved": { bg: "bg-green-50", text: "text-green-600" },
        "rejected": { bg: "bg-red-50", text: "text-red-500" },
    };

    const typeColors: Record<string, string> = {
        lesson: "#1A2558",
        assessment: "#0D9488",
        quiz: "#D97706",
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: "Pending",
            under_review: "Under review",
            needs_revision: "Needs revision",
            approved: "Approved",
            rejected: "Rejected",
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="border border-[#E8E8E3] rounded-xl p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#0F0F0E] font-semibold text-xs">Pending reviews</h3>
                </div>
                <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-chestnut" />
                </div>
            </div>
        );
    }

    return (
        <div className="border border-[#E8E8E3] rounded-xl p-4 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#0F0F0E] font-semibold text-xs">Pending reviews</h3>
                <button className="text-chestnut font-medium text-[10px] hover:opacity-70 transition-opacity">
                    View all
                </button>
            </div>

            {/* Empty state */}
            {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                        <Inbox className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">No pending reviews</p>
                </div>
            ) : (
                /* List */
                <div className="divide-y divide-[#E8E8E3]">
                    {reviews.map((r) => {
                        const style = statusStyle[r.status] ?? { bg: "bg-gray-100", text: "text-gray-500" };
                        const avatarBg = typeColors[r.type] || "#1A2558";
                        const typeLabel = r.type.charAt(0).toUpperCase();
                        const dateStr = format(new Date(r.submittedAt), "dd MMM");

                        return (
                            <div key={r.id} className="flex items-center justify-between py-2.5 hover:bg-gray-50/50 transition-colors rounded-lg px-1 -mx-1">
                                {/* Left */}
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: avatarBg }}
                                    >
                                        <span className="text-white font-bold text-[10px]">{typeLabel}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-[#0F0F0E] font-semibold text-xs leading-tight">{r.title}</h3>
                                        <p className="text-[#A8A8A4] text-[10px] mt-0">{r.subjectName} · {dateStr}</p>
                                    </div>
                                </div>

                                {/* Right */}
                                <div className="text-right shrink-0">
                                    <span className={`inline-block rounded-full py-0.5 px-2 text-[10px] font-semibold ${style.bg} ${style.text}`}>
                                        {getStatusLabel(r.status)}
                                    </span>
                                    <p className="text-[#A8A8A4] font-medium text-[10px] mt-0.5">{dateStr}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

    )
}

export default PendingReviews