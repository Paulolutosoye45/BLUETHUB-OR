import { ChevronDown, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
 export interface Week {
    id: string;
    title: string;
    topics: string[];
}

export const WeekRow = ({ week, index, expanded, onChange, onDelete }: {
    week: Week;
    index: number;
    expanded: boolean;
    onChange: (w: Week) => void;
    onDelete: () => void;
}) => {
    const [open, setOpen] = useState(false);
    const [topic, setTopic] = useState("");

    useEffect(() => { setOpen(expanded); }, [expanded]);

    const addTopic = () => {
        if (!topic.trim()) return;
        onChange({ ...week, topics: [...week.topics, topic.trim()] });
        setTopic("");
    };

    const removeTopic = (i: number) => {
        onChange({ ...week, topics: week.topics.filter((_, idx) => idx !== i) });
    };

    return (
        <div className="border border-[#E8E8E3] rounded-xl overflow-hidden">
            {/* Week header */}
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50/60 transition-colors"
                onClick={() => setOpen(p => !p)}
            >
                <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#EEF1FB] flex items-center justify-center text-[#292382] font-bold text-xs shrink-0">
                        {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[#0F0F0E] font-semibold text-sm">{week.title}</span>
                    {week.topics.length > 0 && (
                        <span className="text-[10px] font-semibold text-[#292382] bg-[#EEF1FB] px-2 py-0.5 rounded-full">
                            {week.topics.length} topic{week.topics.length > 1 ? "s" : ""}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(); }}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                </div>
            </div>

            {/* Expanded content */}
            {open && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#E8E8E3]">
                    {/* Topics list */}
                    {week.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-3">
                            {week.topics.map((t, i) => (
                                <span key={i} className="inline-flex items-center gap-1 bg-[#EEF1FB] text-[#292382] text-xs font-semibold px-2.5 py-1 rounded-full">
                                    {t}
                                    <button onClick={() => removeTopic(i)} className="hover:text-red-500 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Add topic input */}
                    <div className="flex items-center gap-2 pt-1">
                        <input
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && addTopic()}
                            placeholder="Add a topic e.g. Photosynthesis"
                            className="flex-1 border border-[#E8E8E3] rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#292382]/20 focus:border-[#292382]/30"
                        />
                        <button
                            onClick={addTopic}
                            className="bg-[#292382] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};