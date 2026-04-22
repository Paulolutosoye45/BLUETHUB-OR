import { CirclePlay, Eye } from "lucide-react";

const Recordedclass = () => {

    const recordings = [
        { title: "Photosynthesis — Part 1", class: "JSS 2A", duration: "42 min", date: "10 Apr", views: 312 },
        { title: "Digestive system", class: "SSS 1A", duration: "38 min", date: "8 Apr", views: 284 },
        { title: "Plant cells & animal cells", class: "JSS 2A", duration: "45 min", date: "5 Apr", views: 198 },
        { title: "Comprehension skills", class: "JSS 2B", duration: "50 min", date: "3 Apr", views: 156 },
    ];


    return (
        <div className="border border-[#E8E8E3] rounded-2xl p-5 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#0F0F0E] font-semibold text-sm">Recorded classes</h3>
                <button className="text-chestnut font-medium text-xs hover:opacity-70 transition-opacity">
                    View all
                </button>
            </div>

            {/* List */}
            <div className="divide-y divide-[#E8E8E3]">
                {recordings.map((r, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between py-3 hover:bg-gray-50/50 transition-colors rounded-lg px-1 -mx-1 cursor-pointer group"
                    >
                        {/* Left */}
                        <div className="flex items-center gap-3">
                            <div className="bg-[#EEF1FB] rounded-xl w-12 h-10 flex items-center justify-center shrink-0 group-hover:bg-chestnut/10 transition-colors">
                                <CirclePlay className="text-chestnut size-5" />
                            </div>
                            <div>
                                <h3 className="text-[#0F0F0E] font-semibold text-sm leading-tight group-hover:text-chestnut transition-colors">
                                    {r.title}
                                </h3>
                                <p className="text-[#A8A8A4] font-normal text-[11px] mt-0.5">
                                    {r.class} · {r.duration} · {r.date}
                                </p>
                            </div>
                        </div>

                        {/* Right — views */}
                        <div className="flex items-center gap-1.5 shrink-0 text-[#A8A8A4]">
                            <Eye className="size-3.5" />
                            <span className="font-semibold text-xs">{r.views}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recordedclass;
