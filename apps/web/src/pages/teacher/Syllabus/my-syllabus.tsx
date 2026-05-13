import { Button, Input } from "@bluethub/ui-kit"
import { EllipsisVertical, PlusIcon, Search, X } from "lucide-react"
import { useState } from "react";
import { SyllabusCard, type SyllabusCardProps } from "./syllabus-card";
import { useNavigate } from "react-router-dom";


const STATUS_FILTERS = [
    { label: "All", value: "" },
    { label: "Approved", value: "Approved" },
    { label: "Pending", value: "Pending review" }, // ← match CardStatus
    { label: "Rejected", value: "Rejected" },
    { label: "Drafts", value: "Draft" },           // ← match CardStatus
] as const;

type FilterValue = (typeof STATUS_FILTERS)[number]["value"];

const syllabusCards: SyllabusCardProps[] = [
    {
        id: "SYL-2025-019",
        title: "Basic Science — Second Term",
        subtitle: "Basic Science · JSS 2A · Second term · 2025/2026",
        weeks: 12,
        topics: 36,
        date: "12 Apr 2026",
        status: "Pending review",
    },
    {
        id: "SYL-2024-011",
        title: "Basic Science — First Term",
        subtitle: "Basic Science · JSS 2A · First term · 2025/2026",
        weeks: 12,
        topics: 38,
        date: "Oct 2025",
        status: "Approved",
    },
    {
        id: "SYL-2024-008",
        title: "Biology — First Term",
        subtitle: "Biology · SSS 1A · First term · 2025/2026",
        weeks: 12,
        topics: 42,
        date: "Oct 2025",
        status: "Pending review",
    },
    {
        id: "SYL-2024-006",
        title: "Basic Science — Third Term",
        subtitle: "Basic Science · JSS 2A · Third term · 2024/2025",
        weeks: 10,
        topics: 30,
        date: "May 2025",
        status: "Approved",
    },
    {
        id: "SYL-2024-003",
        title: "Biology — Second Term Draft",
        subtitle: "Biology · SSS 1A · Second term · 2024/2025",
        weeks: 8,
        topics: 24,
        date: "Feb 2025",
        status: "Rejected",
        rejectionReason: "The syllabus is missing weeks 7 and 8. Please complete all planned weeks with at least one topic each, and ensure the re...",
    },
    {
        id: "SYL-2024-001",
        title: "Computer Science — Draft",
        subtitle: "Computer Science · JSS 2A · Second term · 2025/2026",
        weeks: 4,
        topics: 8,
        date: "16 Apr 2026",
        status: "Draft",
        lastEdited: "16 Apr 2026",
    },
];


const MySyllabus = () => {
    const navigate = useNavigate()
    const [activeFilter, setActiveFilter] = useState<FilterValue>("");
    const [search, setSearch] = useState("");

    const handleFilterChange = (f: FilterValue) => {
        setActiveFilter(f);
        // setPage(1);
    };

    const filteredCards = syllabusCards.filter((card) => {
        const matchesFilter = activeFilter === "" || card.status === activeFilter;
        const matchesSearch =
            card.title.toLowerCase().includes(search.toLowerCase()) ||
            card.id.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="p-3 font-poppins">
            <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">

                {/* ── Top Nav ──────────────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-4 py-5 sticky top-0 z-30 bg-chestnut"
                >
                    <div className="flex items-center gap-2.5">
                        {/* <LayoutGrid className="w-6 h-6 text-white" /> */}
                        <span className="text-white font-semibold text-sm">Syllabus</span>
                    </div>
                    <button className="text-white">
                        <EllipsisVertical size={18} />
                    </button>
                </div>

                {/* ── White card ───────────────────────────────────────────────── */}
                <div className="flex-1 p-3 bg-white/70 backdrop-blur-sm">
                    <div className="space-7-20">

                        {/* Page header row */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-xl font-bold text-blck-b2 leading-tight">
                                    My Syllabus
                                </h1>
                                <p className="text-sm text-[#A0A8C0]  mt-0.5">
                                    View and manage all syllabus  you've created — approved, pending and drafts
                                </p>
                            </div>
                            <div className="flex items-center gap-3 justify-between">
                                <Button
                                    // onClick={() => navigate('/admin/registration/class/new')}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[#0F0F0E] text-xs font-medium  bg-white shrink-0 transition-opacity border border-[#E8E8E3] hover:bg-white"
                                >
                                    <X className="text-[#0F0F0E]" />
                                    Rejected
                                </Button>

                                <Button
                                    onClick={() => navigate('/teacher/create-syllabus')}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-semibold  bg-chestnut shrink-0 transition-opacity hover:opacity-90"
                                >
                                    <PlusIcon />
                                    Create new syllabus
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-[14px] my-[28px]">
                            <div className="border border[#E8E8E3] bg-white rounded-[13px] py-[18px] px-5 space-y-1">
                                <div className="bg-[#EEF1FB] rounded-[9px] w-9 h-9 flex items-center justify-center "></div>
                                <h4 className="pt-2 text-chestnut text-[28px] leading-[28px] font-semibold">
                                    6
                                </h4>
                                <p className="text-[#5A5A5A] font-normal text-xs">Total syllabi </p>
                            </div>
                            <div className="border border[#E8E8E3] bg-white rounded-[13px] py-[18px] px-5 space-y-1">
                                <div className="bg-[#E6F7F2] rounded-[9px] w-9 h-9 flex items-center justify-center "></div>
                                <h4 className="pt-2 text-[#16A37A] text-[28px] leading-[28px] font-semibold">
                                    2
                                </h4>
                                <p className="text-[#5A5A5A] font-normal text-xs">Approved </p>
                            </div>
                            <div className="border border[#E8E8E3] bg-white rounded-[13px] py-[18px] px-5 space-y-1">
                                <div className="bg-[#FFF8ED] rounded-[9px] w-9 h-9 flex items-center justify-center "></div>
                                <h4 className="pt-2 text-[#C47C0A] text-[28px] leading-[28px] font-semibold">
                                    6
                                </h4>
                                <p className="text-[#5A5A5A] font-normal text-xs">Pending review</p>
                            </div>
                            <div className="border border[#E8E8E3] bg-white rounded-[13px] py-[18px] px-5 space-y-1">
                                <div className="bg-[#FDECEA] rounded-[9px] w-9 h-9 flex items-center justify-center "></div>
                                <h4 className="pt-2 text-[#C0392B] text-[28px] leading-[28px] font-semibold">
                                    1
                                </h4>
                                <p className="text-[#5A5A5A] font-normal text-xs">Rejected / revision needed</p>
                            </div>
                        </div>

                        <div className="mb-[21px] flex items-center justify-between">
                            <div className="flex gap-2 flex-wrap">
                                {STATUS_FILTERS.map((f) => (
                                    <button
                                        key={f.value}
                                        onClick={() => handleFilterChange(f.value)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeFilter === f.value
                                            ? "bg-chestnut text-white shadow-sm"
                                            : "bg-white text-[#5A5A5A] border border-[#5A5A5A] hover:bg-gray-200"
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            <div className="relative w-[40%]">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                    size={18}
                                />

                                <Input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search syllabi..."
                                    className="pl-10 pr-4 h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCards.length > 0 ? (
                                filteredCards.map((card) => (
                                    <SyllabusCard key={card.id} {...card} />
                                ))
                            ) : (
                                <p className="text-sm text-[#A0A09C] col-span-3 text-center py-10">
                                    No syllabi found.
                                </p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default MySyllabus