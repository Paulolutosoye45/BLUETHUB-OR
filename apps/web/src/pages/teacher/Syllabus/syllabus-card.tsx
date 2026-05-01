type CardStatus = "Pending review" | "Approved" | "Rejected" | "Draft";

export interface SyllabusCardProps {
    id: string;
    title: string;
    subtitle: string;
    weeks: number;
    topics: number;
    date: string;
    status: CardStatus;
    rejectionReason?: string;
    lastEdited?: string;
    onView?: () => void;
    onEdit?: () => void;
    onSubmit?: () => void;
}

const statusConfig: Record<CardStatus, {
    dot: string;
    text: string;
    badge: string;
    border: string;
    footerText?: string;
}> = {
    "Pending review": {
        dot: "bg-yellow-400",
        text: "text-yellow-700",
        badge: "bg-yellow-50",
        border: "border-yellow-400",
        footerText: "Under review",
    },
    "Approved": {
        dot: "bg-green-500",
        text: "text-green-700",
        badge: "bg-green-50",
        border: "border-green-500",
        footerText: "✓ Approved",
    },
    "Rejected": {
        dot: "bg-red-500",
        text: "text-red-600",
        badge: "bg-red-50",
        border: "border-red-500",
        footerText: "Needs revision",
    },
    "Draft": {
        dot: "bg-gray-400",
        text: "text-gray-500",
        badge: "bg-gray-100",
        border: "border-gray-300",
        footerText: undefined,
    },
};

export const SyllabusCard = ({
    id,
    title,
    subtitle,
    weeks,
    topics,
    date,
    status,
    rejectionReason,
    lastEdited,
    onView,
    onEdit,
    onSubmit,
}: SyllabusCardProps) => {
    const config = statusConfig[status];

    return (
        <div className={`border-t-[3px] border-r border-b border-l ${config.border} rounded-[14px] overflow-hidden bg-white`}>
            <div className="px-[18px] space-y-1 pt-[17px]">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-[#5A5A5A] font-bold text-[10px] rounded-[6px] bg-[#F4F4F0] py-1 px-2">
                        {id}
                    </h3>
                    <div className={`flex items-center gap-1.5 ${config.badge} rounded-[20px] py-1 px-2.5`}>
                        <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${config.dot}`} />
                        <span className={`${config.text} font-medium text-xs`}>{status}</span>
                    </div>
                </div>

                {/* Title */}
                <div className="py-[5px]">
                    <h2 className="text-[#0F0F0E] font-semibold text-sm leading-5">{title}</h2>
                </div>

                {/* Subtitle */}
                <div>
                    <p className="text-[#A0A09C] font-normal text-xs">{subtitle}</p>
                </div>

                {/* Stats */}
                <div className="pt-2 grid grid-cols-3 items-center gap-2 pb-4">
                    <div className="bg-[#F4F4F0] rounded-[8px] py-2 px-2.5">
                        <h2 className="text-[#0F0F0E] font-bold text-[15px]">{weeks}</h2>
                        <p className="text-[#A0A09C] font-normal text-[10px]">Weeks</p>
                    </div>
                    <div className="bg-[#F4F4F0] rounded-[8px] py-2 px-2.5">
                        <h2 className="text-[#0F0F0E] font-bold text-[15px]">{topics}</h2>
                        <p className="text-[#A0A09C] font-normal text-[10px]">Topics</p>
                    </div>
                    <div className="bg-[#F4F4F0] rounded-[8px] py-2 px-2.5">
                        <h2 className="text-[#0F0F0E] font-bold text-[15px]">{date}</h2>
                        <p className="text-[#A0A09C] font-normal text-[10px]">Date</p>
                    </div>
                </div>

                {/* Rejection Reason */}
                {status === "Rejected" && rejectionReason && (
                    <div className="bg-red-50 rounded-[8px] p-3 mb-3">
                        <p className="text-red-500 font-bold text-[10px] mb-1">⚠ REJECTION REASON</p>
                        <p className="text-red-500 text-xs leading-4 line-clamp-3">{rejectionReason}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-[#F4F4F0] border-t border-[#E8E8E3] flex justify-between items-center py-3 px-[18px] gap-2">
                {/* Left label */}
                <span className="text-[#A0A09C] text-xs">
                    {status === "Draft" && lastEdited
                        ? `Last edited ${lastEdited}`
                        : config.footerText}
                </span>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onView}
                        className="bg-white border border-[#E8E8E3] rounded-[7px] py-[4px] px-3"
                    >
                        <span className="text-[#5A5A5A] font-medium text-xs">View</span>
                    </button>

                    {(status === "Rejected" || status === "Draft") && (
                        <button
                            onClick={onEdit}
                            className="bg-[#FFF8ED] border border-[#E8C97A] rounded-[7px] py-[4px] px-3"
                        >
                            <span className="text-[#5A5A5A] font-medium text-xs">Edit</span>
                        </button>
                    )}

                    {status === "Draft" && (
                        <button
                            onClick={onSubmit}
                            className="bg-chestnut rounded-[7px] py-[4px] px-3"
                        >
                            <span className="text-white font-medium text-xs">Submit</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};