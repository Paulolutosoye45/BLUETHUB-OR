
const PendingReviews = () => {

    const reviews = [
        { id: "L1", title: "Photosynthesis & nutrition", class: "JSS 2A", date: "12 Apr", status: "Under review", avatarBg: "#1A2558" },
        { id: "L2", title: "Solving quadratics", class: "SSS 1A", date: "11 Apr", status: "Under review", avatarBg: "#0D9488" },
        { id: "L3", title: "Formal letter writing", class: "JSS 2B", date: "9 Apr", status: "Needs revision", avatarBg: "#D97706" },
    ];

    const statusStyle: Record<string, { bg: string; text: string }> = {
        "Under review": { bg: "bg-[#FFF8ED]", text: "text-[#7A4D00]" },
        "Needs revision": { bg: "bg-red-50", text: "text-red-500" },
        "Approved": { bg: "bg-green-50", text: "text-green-600" },
    };

    return (
        <div className="border border-[#E8E8E3] rounded-2xl p-5 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#0F0F0E] font-semibold text-sm">Pending reviews</h3>
                <button className="text-chestnut font-medium text-xs hover:opacity-70 transition-opacity">
                    View all
                </button>
            </div>

            {/* List */}
            <div className="divide-y divide-[#E8E8E3]">
                {reviews.map((r) => {
                    const style = statusStyle[r.status] ?? { bg: "bg-gray-100", text: "text-gray-500" };
                    return (
                        <div key={r.id} className="flex items-center justify-between py-3.5 hover:bg-gray-50/50 transition-colors rounded-lg px-1 -mx-1">
                            {/* Left */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: r.avatarBg }}
                                >
                                    <span className="text-white font-bold text-[11px]">{r.id}</span>
                                </div>
                                <div>
                                    <h3 className="text-[#0F0F0E] font-semibold text-sm leading-tight">{r.title}</h3>
                                    <p className="text-[#A8A8A4] text-[11px] mt-0.5">{r.class} · {r.date}</p>
                                </div>
                            </div>

                            {/* Right */}
                            <div className="text-right shrink-0">
                                <span className={`inline-block rounded-full py-1 px-2.5 text-[11px] font-semibold ${style.bg} ${style.text}`}>
                                    {r.status}
                                </span>
                                <p className="text-[#A8A8A4] font-medium text-[11px] mt-1">{r.date}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

    )
}

export default PendingReviews