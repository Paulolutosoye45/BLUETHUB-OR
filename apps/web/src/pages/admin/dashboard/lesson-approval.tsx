import { useState } from "react";
import { EllipsisVertical, Info, Pencil, Trash2 } from "lucide-react";
import type { LessonData } from "./lesson-review-modal";
import LessonReviewModal from "./lesson-review-modal";


type LessonStatus = "Awaiting" | "Approved" | "Rejected" | "Pending";
type FilterTab = "All lessons" | "Processing" | "Completed" | "Rejected";


interface MediaFile {
    name: string;
    url?: string;
}

export interface Lesson {
    id: number;
    title: string;
    term: string;
    teacher: string;
    className: string;
    subject: string;
    status: LessonStatus;
    submitted?: string;
    objectives?: string;
    notes?: string;
    mediaFiles?: MediaFile[];
    approvedBy?: string;
    approvedDate?: string;
    previousRejectionReason?: string;
}


const allLessons: Lesson[] = [
    {
        id: 1,
        title: "Photosynthesis And Plant Nutrition",
        term: "Second Term",
        teacher: "Mrs. Adaeze Okafor",
        className: "JSS 2A",
        subject: "Basic Science",
        submitted: "12 Apr 2026",
        status: "Awaiting",
        objectives: "Students will understand the process of photosynthesis and how plants make food using sunlight and water.",
        notes: "Covers chlorophyll, sunlight, carbon dioxide and water. Includes a diagram-labelling activity and group discussion.",
        mediaFiles: [
            { name: "Linear Equation File PDF..." },
            { name: "Linear Equation2 File PDF..." },
        ],
    },
    {
        id: 2,
        title: "Solving Quadratic Equations",
        term: "Second Term",
        teacher: "Mr. Tunde Fashola",
        className: "SSS 2B",
        subject: "Mathematics",
        submitted: "11 Apr 2026",
        status: "Awaiting",
        objectives: "Students will solve quadratic equations using factorization and the quadratic formula.",
        notes: "Covers factorization, completing the square, and the quadratic formula.",
        mediaFiles: [{ name: "Quadratic Equations PDF..." }],
    },
    {
        id: 3,
        title: "Supply And Demand Curves",
        term: "Second Term",
        teacher: "Mrs. Chioma Eze",
        className: "SSS 2B",
        subject: "Economics",
        submitted: "10 Apr 2026",
        status: "Awaiting",
        objectives: "Students will understand how supply and demand determine market prices.",
        notes: "Covers price elasticity, market equilibrium and shifts in curves.",
        mediaFiles: [],
    },
    {
        id: 4,
        title: "Introduction To Computer Networks",
        term: "Second Term",
        teacher: "Mr. Emeka Nwachukwu",
        className: "JSS 2B",
        subject: "Computer Science",
        submitted: "9 Apr 2026",
        status: "Approved",
        objectives: "Students will understand the basic concepts of computer networks and types of networks.",
        notes: "Covers LAN, WAN, MAN, network topologies and protocols.",
        mediaFiles: [
            { name: "Linear Equation File PDF..." },
            { name: "Linear Equation2 File PDF..." },
        ],
        approvedBy: "Mr. James Okafor",
        approvedDate: "10 Apr 2026",
    },
    {
        id: 5,
        title: "Writing Formal Letters",
        term: "Second Term",
        teacher: "Mrs. Adaeze Okafor",
        className: "JSS 2B",
        subject: "English Language",
        submitted: "12 Apr 2026",
        status: "Rejected",
        objectives: "Students will understand the process of photosynthesis and how plants make food using sunlight and water.",
        notes: "Covers salutation, body, and closing.",
        mediaFiles: [],
        previousRejectionReason: "Activities section is incomplete. Please add at least two classroom exercises with estimated durations, and include a sample formal letter for student reference.",
    },
    {
        id: 6,
        title: "The Causes Of World War I",
        term: "Second Term",
        teacher: "Mr. Biodun Alabi",
        className: "JSS 3B",
        subject: "Social Studies",
        submitted: "8 Apr 2026",
        status: "Awaiting",
        objectives: "Students will identify and analyze the main causes of World War I.",
        notes: "Covers MAIN acronym — Militarism, Alliances, Imperialism, Nationalism.",
        mediaFiles: [{ name: "WW1 Reference PDF..." }],
    },
    {
        id: 7,
        title: "Laws Of Indices And Logarithms",
        term: "Second Term",
        teacher: "Mr. Tunde Fashola",
        className: "SSS 2B",
        subject: "Mathematics",
        submitted: "7 Apr 2026",
        status: "Approved",
        objectives: "Students will apply the laws of indices and logarithms to solve problems.",
        notes: "Covers index laws, change of base, and logarithmic equations.",
        mediaFiles: [{ name: "Indices and Logs PDF..." }],
        approvedBy: "Mr. James Okafor",
        approvedDate: "8 Apr 2026",
    },
];

const statusConfig: Record<LessonStatus, { bg: string; text: string; dot: string; label: string }> = {
    Awaiting: { bg: "#FEF3C7", text: "#B45309", dot: "#F59E0B", label: "Awaiting" },
    Approved: { bg: "#D1FAE5", text: "#065F46", dot: "#10B981", label: "Approved" },
    Rejected: { bg: "#FFE4E6", text: "#9F1239", dot: "#F43F5E", label: "Rejected" },
    Pending: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B", label: "Pending" },
};

const LessonApproval = () => {
    const [filter, setFilter] = useState<FilterTab>("All lessons");
    const [menuOpen, setMenuOpen] = useState(false);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [reviewingLesson, setReviewingLesson] = useState<LessonData | null>(null);

    const totalSubmissions = allLessons.length;
    const awaiting = allLessons.filter(l => l.status === "Awaiting").length;
    const approved = allLessons.filter(l => l.status === "Approved").length;
    const rejected = allLessons.filter(l => l.status === "Rejected").length;

    const visible = allLessons.filter(l => {
        if (filter === "All lessons") return true;
        if (filter === "Processing") return l.status === "Awaiting" || l.status === "Pending";
        if (filter === "Completed") return l.status === "Approved";
        if (filter === "Rejected") return l.status === "Rejected";
        return true;
    });

    const filterTabs: FilterTab[] = ["All lessons", "Processing", "Completed", "Rejected"];

    const handleReview = (lesson: Lesson) => {
    setReviewingLesson({
        id: lesson.id,
        title: lesson.title,
        teacher: lesson.teacher,
        subject: lesson.subject,
        className: lesson.className,
        term: lesson.term,
        submitted: lesson.submitted ?? "",
        status: lesson.status, // ✅ pass the actual status
        objectives: lesson.objectives,
        notes: lesson.notes,
        mediaFiles: lesson.mediaFiles,
        approvedBy: lesson.approvedBy,
        approvedDate: lesson.approvedDate,
        previousRejectionReason: lesson.previousRejectionReason,
    });
    setReviewOpen(true);
};


    return (
        <>
            <div className="p-6 font-poppins min-h-screen bg-white/40">

                {/* ── Top Nav ───────────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-5 py-3 rounded-xl mb-5 relative bg-chestnut"
                >
                    <div className="flex items-center gap-1.5 text-white text-xs font-medium">
                        <span className="text-white/60">Academic</span>
                        <span className="text-white/40">›</span>
                        <span className="text-white font-bold">Lesson approvals</span>
                    </div>

                    {/* Three-dot + dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(p => !p)}
                            className="text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <EllipsisVertical size={18} />
                        </button>

                        {menuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-xl border border-gray-100 w-48 py-1.5 overflow-hidden">
                                    {[
                                        { icon: <Info size={13} className="text-blue-500" />, label: "Admin approval", color: "text-gray-700" },
                                        { icon: <Pencil size={13} className="text-gray-500" />, label: "Assigned Role", color: "text-gray-700" },
                                        { icon: <Trash2 size={13} className="text-red-500" />, label: "Delete user", color: "text-red-500" },
                                    ].map(item => (
                                        <button
                                            key={item.label}
                                            className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 transition-colors ${item.color}`}
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Page Header ───────────────────────────────────────────── */}
                <div className="mb-5">
                    <h1 className="text-xl font-bold text-[#12122A]">Lesson submissions</h1>
                    <p className="text-sm text-[#A0A8C0] mt-0.5">
                        Review and approve or reject teacher lesson submissions
                    </p>
                </div>

                {/* ── Stats Row ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                    {/* Total — dark card */}
                    <div
                        className="rounded-xl px-5 py-4 flex flex-col justify-between bg-chestnut"
                    >
                        <p className="text-4xl font-semibold text-white leading-none">{totalSubmissions}</p>
                        <div className="mt-3">
                            <p className="text-white/80 text-xs font-semibold">Total submissions</p>
                            <p className="text-white/50 text-[10px] mt-0.5">+14 this month</p>
                        </div>
                    </div>

                    {/* Awaiting */}
                    <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex flex-col justify-between">
                        <p className="text-4xl font-semibold text-[#12122A] leading-none">{awaiting}</p>
                        <div className="mt-3">
                            <p className="text-gray-600 text-xs font-semibold">Awaiting review</p>
                            <p className="text-amber-500 text-[10px] font-semibold mt-0.5">Processing</p>
                        </div>
                    </div>

                    {/* Approved */}
                    <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex flex-col justify-between">
                        <p className="text-4xl font-semibold text-[#12122A] leading-none">{approved}</p>
                        <div className="mt-3">
                            <p className="text-gray-600 text-xs font-semibold">Approved</p>
                            <p className="text-gray-400 text-[10px] mt-0.5">+2 this month</p>
                        </div>
                    </div>

                    {/* Rejected */}
                    <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex flex-col justify-between">
                        <p className="text-4xl font-semibold text-[#12122A] leading-none">{rejected}</p>
                        <div className="mt-3">
                            <p className="text-gray-600 text-xs font-semibold">Rejected</p>
                            <p className="text-gray-400 text-[10px] mt-0.5">No change</p>
                        </div>
                    </div>
                </div>

                {/* ── Filter Tabs ───────────────────────────────────────────── */}
                <div className="flex items-center gap-2 mb-4">
                    {filterTabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className="px-4 py-2 rounded-full text-xs font-semibold border transition-all"
                            style={{
                                backgroundColor: filter === tab ? "#292382" : "#fff",
                                color: filter === tab ? "#fff" : "#6b7280",
                                borderColor: filter === tab ? "#292382" : "#e5e7eb",
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ── Table ─────────────────────────────────────────────────── */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

                    {/* Table Header */}
                    <div
                        className="grid px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-chestnut/70 border-b border-gray-100 bg-[#f8f9ff]"
                        style={{ gridTemplateColumns: "2fr 1.5fr 80px 1.2fr 130px 80px" }}
                    >
                        <span>Lesson Title</span>
                        <span>Teacher</span>
                        <span>Class</span>
                        <span>Subject</span>
                        <span>Status</span>
                        <span></span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-gray-50">
                        {visible.map(lesson => {
                            const cfg = statusConfig[lesson.status];
                            const isRejected = lesson.status === "Rejected";
                            return (
                                <div
                                    key={lesson.id}
                                    className="grid items-center px-5 py-3 hover:bg-gray-50/60 transition-colors relative"
                                    style={{ gridTemplateColumns: "2fr 1.5fr 80px 1.2fr 130px 80px" }}
                                >
                                    {/* Rejected left accent bar */}
                                    {isRejected && (
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-400 rounded-l" />
                                    )}

                                    {/* Lesson Title */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-800 leading-tight">
                                            {lesson.title}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{lesson.term}</p>
                                    </div>

                                    {/* Teacher */}
                                    <span className="text-xs text-gray-600 font-medium">{lesson.teacher}</span>

                                    {/* Class */}
                                    <span className="text-xs text-gray-600 font-medium">{lesson.className}</span>

                                    {/* Subject */}
                                    <span className="text-xs text-gray-600 font-medium">{lesson.subject}</span>

                                    {/* Status badge */}
                                    <div>
                                        <span
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                                            style={{ backgroundColor: cfg.bg, color: cfg.text }}
                                        >
                                            <span
                                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                                style={{ backgroundColor: cfg.dot }}
                                            />
                                            {cfg.label}
                                        </span>
                                    </div>

                                    {/* Review button */}
                                    <button
                                        onClick={() => handleReview(lesson)}

                                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                    >
                                        Review
                                    </button>
                                </div>
                            );
                        })}

                        {visible.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-xs text-gray-400">No lessons found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {reviewingLesson && (
                <LessonReviewModal
                    open={reviewOpen}
                    onOpenChange={setReviewOpen}
                    lesson={reviewingLesson}
                    onApprove={(id) => console.log("Approved", id)}
                    onReject={(id, reason, feedback) => console.log("Rejected", id, reason, feedback)}
                />
            )}
        </>
    );
};

export default LessonApproval;