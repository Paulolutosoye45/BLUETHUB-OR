import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CirclePlay, Eye, Loader2, Inbox } from "lucide-react";
import { teacherService, type RecordedClassItem } from "@/services/teacher";

const Recordedclass = () => {
    const [recordings, setRecordings] = useState<RecordedClassItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecordings = async () => {
            try {
                const res = await teacherService.getRecordedClasses({ limit: 5 });
                if (res.data.status === "successful") {
                    setRecordings(res.data.data.classes);
                }
            } catch (err) {
                console.error("Failed to fetch recorded classes:", err);
                setRecordings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecordings();
    }, []);

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    };

    if (loading) {
        return (
            <div className="border border-[#E8E8E3] rounded-2xl p-5 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#0F0F0E] font-semibold text-sm">Recorded classes</h3>
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
                <h3 className="text-[#0F0F0E] font-semibold text-sm">Recorded classes</h3>
                <button className="text-chestnut font-medium text-xs hover:opacity-70 transition-opacity">
                    View all
                </button>
            </div>

            {/* Empty state */}
            {recordings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Inbox className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No recorded classes yet</p>
                </div>
            ) : (
                /* List */
                <div className="divide-y divide-[#E8E8E3]">
                    {recordings.map((r) => {
                        const dateStr = format(new Date(r.recordedAt), "dd MMM");

                        return (
                            <div
                                key={r.id}
                                className="flex items-center justify-between py-3 hover:bg-gray-50/50 transition-colors rounded-lg px-1 -mx-1 cursor-pointer group"
                            >
                                {/* Left */}
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#EEF1FB] rounded-xl w-12 h-10 flex items-center justify-center shrink-0 group-hover:bg-chestnut/10 transition-colors overflow-hidden">
                                        {r.thumbnailUrl ? (
                                            <img src={r.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <CirclePlay className="text-chestnut size-5" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-[#0F0F0E] font-semibold text-sm leading-tight group-hover:text-chestnut transition-colors">
                                            {r.topic}
                                        </h3>
                                        <p className="text-[#A8A8A4] font-normal text-[11px] mt-0.5">
                                            {r.className} · {formatDuration(r.duration)} · {dateStr}
                                        </p>
                                    </div>
                                </div>

                                {/* Right — views */}
                                <div className="flex items-center gap-1.5 shrink-0 text-[#A8A8A4]">
                                    <Eye className="size-3.5" />
                                    <span className="font-semibold text-xs">{r.views}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Recordedclass;
