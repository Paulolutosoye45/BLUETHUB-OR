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
                if (res.data.isSuccess) {
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
            <div className="border border-[#E8E8E3] rounded-2xl p-5 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#0F0F0E] font-semibold text-sm">Pending reviews</h3>
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
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#0F0F0E] font-semibold text-sm">Pending reviews</h3>
                <button className="text-chestnut font-medium text-xs hover:opacity-70 transition-opacity">
                    View all
                </button>
            </div>

            {/* Empty state */}
            {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Inbox className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No pending reviews</p>
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
                            <div key={r.id} className="flex items-center justify-between py-3.5 hover:bg-gray-50/50 transition-colors rounded-lg px-1 -mx-1">
                                {/* Left */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: avatarBg }}
                                    >
                                        <span className="text-white font-bold text-[11px]">{typeLabel}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-[#0F0F0E] font-semibold text-sm leading-tight">{r.title}</h3>
                                        <p className="text-[#A8A8A4] text-[11px] mt-0.5">{r.subjectName} · {dateStr}</p>
                                    </div>
                                </div>

                                {/* Right */}
                                <div className="text-right shrink-0">
                                    <span className={`inline-block rounded-full py-1 px-2.5 text-[11px] font-semibold ${style.bg} ${style.text}`}>
                                        {getStatusLabel(r.status)}
                                    </span>
                                    <p className="text-[#A8A8A4] font-medium text-[11px] mt-1">{dateStr}</p>
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