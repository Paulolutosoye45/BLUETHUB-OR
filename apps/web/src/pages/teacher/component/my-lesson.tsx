
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@bluethub/ui-kit"
import { ChevronRight, EllipsisVertical, Plus } from "lucide-react"
import { useState } from "react";
import { ReviewModal, type RLesson } from "./review-modal";

const lessonData = [
    { count: "7", label: "Total submissions", change: "+14 this term", highlight: true },
    { count: "4", label: "Pending review", change: "Processing", highlight: false },
    { count: "2", label: "Approved", change: "Completed", highlight: false },
    { count: "1", label: "Rejected", change: "Needs revision", highlight: false },
];

const changeStyle: Record<string, string> = {
    "Processing": "text-orange-400",
    "Completed": "text-green-500",
    "Needs revision": "text-red-500",
};


const MyLesson = () => {
    // Filter tabs
    const tabs = ["All lessons", "Pending", "Approved", "Rejected"];
    const [activeTab, setActiveTab] = useState("All lessons");
    const [reviewLesson, setReviewLesson] = useState<RLesson | null>(null);

    const lessons = [
    {
        title: "Photosynthesis And Plant Nutrition",
        term: "Second Term",
        teacher: "Mrs. Adaeze",
        class: "JSS 2A",
        submitted: "12 Apr 2026",
        subject: "Basic Science",
        status: "Pending" as const,
        submittedOn: "12 Apr 2026",
        objectives: "Students will understand the process of photosynthesis and how plants make food using sunlight and water.",
        lessonNotes: "Covers chlorophyll, sunlight, carbon dioxide and water. Includes diagram labelling activity.",
        timeline: [
            { label: "Lesson submitted", date: "12 Apr 2026, 9:14am", done: true },
            { label: "Pending Review", date: "", done: false },
        ],
    },
    {
        title: "Solving Quadratic Equations",
        term: "Second Term",
        teacher: "Mrs. Adaeze",
        class: "SSS 2B",
        submitted: "10 Apr 2026",
        subject: "Mathematics",
        status: "Approved" as const,
        submittedOn: "10 Apr 2026",
        objectives: "Students will solve quadratic equations using factorisation and the quadratic formula.",
        lessonNotes: "Lesson includes worked examples, class exercises, and a short quiz at the end.",
        approvedBy: "Mr. Tunde Fashola (Academic Head)",
        approvedAt: "11 Apr 2026, 2:45pm",
        timeline: [
            { label: "Lesson submitted", date: "10 Apr 2026, 8:30am", done: true },
            { label: "Approved", date: "", done: true },
        ],
    },
    {
        title: "Supply And Demand Curves",
        term: "Second Term",
        teacher: "Mrs. Adaeze",
        class: "SSS 2B",
        submitted: "9 Apr 2026",
        subject: "Economics",
        status: "Rejected" as const,
        submittedOn: "9 Apr 2026",
        objectives: "Students will understand the law of supply and demand and how market prices are determined.",
        lessonNotes: "Includes demand and supply curve diagrams, real-world examples, and group activity.",
        rejectionReason: "The lesson objectives are too vague and the activities section is incomplete. Please add at least two classroom activities with estimated durations, and provide a sample formal letter for student reference.",
        timeline: [
            { label: "Lesson submitted", date: "9 Apr 2026, 10:00am", done: true },
            { label: "Rejected", date: "", done: false },
        ],
    },
    {
        title: "Introduction To Computer Networks",
        term: "Second Term",
        teacher: "Mrs. Adaeze",
        class: "JSS 2B",
        submitted: "8 Apr 2026",
        subject: "Computer Science",
        status: "Pending" as const,
        submittedOn: "8 Apr 2026",
        objectives: "Students will identify types of computer networks and explain how data is transmitted.",
        lessonNotes: "Covers LAN, WAN, MAN, network topologies, and basic network devices.",
        timeline: [
            { label: "Lesson submitted", date: "8 Apr 2026, 11:30am", done: true },
            { label: "Pending Review", date: "", done: false },
        ],
    },
    {
        title: "Writing Formal Letters",
        term: "Second Term",
        teacher: "Mrs. Adaeze Okafor",
        class: "JSS 2B",
        submitted: "10 Apr 2026",
        subject: "English Language",
        status: "Rejected" as const,
        submittedOn: "10 Apr 2026",
        objectives: "Students will learn the format and conventions of formal letter writing.",
        lessonNotes: "Covers salutation, body, closing, and signature. Includes practice letters.",
        rejectionReason: "The lesson objectives are too vague and the activities section is incomplete. Please add at least two classroom activities with estimated durations, and provide a sample formal letter for student reference. Also ensure alignment with the term curriculum plan.",
        timeline: [
            { label: "Lesson submitted", date: "10 Apr 2026, 8:30am", done: true },
            { label: "Rejected", date: "", done: false },
        ],
    },
    {
        title: "The Causes Of World War I",
        term: "Second Term",
        teacher: "Mrs. Adaeze",
        class: "JSS 3B",
        submitted: "7 Apr 2026",
        subject: "Social Studies",
        status: "Pending" as const,
        submittedOn: "7 Apr 2026",
        objectives: "Students will identify the main causes of World War I and explain the role of key nations.",
        lessonNotes: "Covers MAIN acronym (Militarism, Alliances, Imperialism, Nationalism), assassination of Archduke Franz Ferdinand.",
        timeline: [
            { label: "Lesson submitted", date: "7 Apr 2026, 2:00pm", done: true },
            { label: "Pending Review", date: "", done: false },
        ],
    },
    {
        title: "Laws Of Indices And Logarithms",
        term: "Second Term",
        teacher: "Mrs. Adaeze",
        class: "SSS 2B",
        submitted: "6 Apr 2026",
        subject: "Mathematics",
        status: "Approved" as const,
        submittedOn: "6 Apr 2026",
        objectives: "Students will apply the laws of indices and convert between index and logarithmic form.",
        lessonNotes: "Includes worked examples on multiplication, division, power of a power, and change of base.",
        approvedBy: "Mr. Tunde Fashola (Academic Head)",
        approvedAt: "8 Apr 2026, 10:15am",
        timeline: [
            { label: "Lesson submitted", date: "6 Apr 2026, 9:00am", done: true },
            { label: "Approved", date: "", done: true },
        ],
    },
];

    const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
        "Pending": { bg: "bg-orange-50", text: "text-orange-500", dot: "bg-orange-400" },
        "Approved": { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" },
        "Rejected": { bg: "bg-red-50", text: "text-red-500", dot: "bg-red-500" },
    };

    const filtered = activeTab === "All lessons"
        ? lessons
        : lessons.filter((l:any ) => l.status === activeTab);

    return (
        <>
            <div className="min-h-screen">
                <div className="rounded-t-2xl overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between px-6 py-5 bg-chestnut">

                        <h3 className="flex items-center gap-2 text-white font-semibold text-sm">
                            <span className="text-[#FFFFFF80]">Teaching</span>
                            <ChevronRight size={16} />
                            <span>My lessons</span>
                        </h3>

                        <button className="text-white">
                            <EllipsisVertical size={18} />
                        </button>

                    </div>
                </div>

                <div className="bg-white p-4 space-y-4">
                    <div className=" h-13.75 p-4 rounded-[15px] flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="font-bold text-lg leading-7 text-[#0F0F0E]">Lesson approvals</h2>
                            <p className="text-[#666666] font-medium text-xs">Track your submitted lessons and their approval status</p>
                        </div>
                        <Button
                            className="flex items-center justify-center gap-2 text-white bg-chestnut font-semibold text-sm px-8 py-3 rounded-md transition-opacity hover:bg-opacity-75 cursor-pointer"
                        >
                            <Plus className="size-4" aria-hidden="true" />
                            <span className="font-medium text-sm">Submit New Lesson</span>
                        </Button>
                    </div>

                    <div className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth py-2 px-1">
                        {lessonData.map((card, i) => (
                            <div
                                key={i}
                                className={`rounded-[12px] px-5 py-4 min-w-50 max-w-50 snap-start shrink-0 transition hover:shadow-md ${card.highlight
                                    ? "bg-chestnut border border-chestnut"
                                    : "bg-white border border-[#D9D9D9]"
                                    }`}
                            >
                                <h4 className={`font-bold text-[32px] leading-none tracking-tight ${card.highlight ? "text-white" : "text-[#0F0F0E]"
                                    }`}>
                                    {card.count}
                                </h4>
                                <h3 className={`font-normal text-xs capitalize mt-1.5 ${card.highlight ? "text-white/70" : "text-[#3A3A3A80]"
                                    }`}>
                                    {card.label}
                                </h3>
                                <p className={`font-medium text-sm mt-1 ${card.highlight
                                    ? "text-white/60"
                                    : changeStyle[card.change] ?? "text-gray-400"
                                    }`}>
                                    {card.change}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Filter tabs */}
                    <div className="flex gap-2 py-2 px-1">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === tab
                                    ? "bg-chestnut text-white shadow-sm"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="border border-[#E8E8E3] rounded-2xl bg-white overflow-hidden mt-2">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#F5F5F1] h-12.5 hover:bg-gray-50/80">
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#29238280] px-5">Lesson Title</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#29238280]">Teacher</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#29238280]">Class</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#29238280]">Submitted</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#29238280]">Status</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center text-xs text-gray-400">
                                            No lessons found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((l, i) => {
                                        const style = statusStyle[l.status];
                                        return (
                                            <TableRow key={i} className={`hover:bg-gray-50/60 transition-colors border-l-2 ${l.status === "Rejected" ? "border-l-red-400" : "border-l-transparent"
                                                }`}>
                                                <TableCell className="px-5 py-3">
                                                    <p className="text-[#0F0F0E] font-semibold text-sm leading-tight">{l.title}</p>
                                                    <p className="text-[#A8A8A4] text-[11px] mt-0.5">{l.term}</p>
                                                </TableCell>
                                                <TableCell className="text-[#0F0F0E] font-medium text-xs">{l.teacher}</TableCell>
                                                <TableCell className="text-[#0F0F0E] font-medium text-xs">{l.class}</TableCell>
                                                <TableCell className="text-[#0F0F0E] font-medium text-xs">
                                                    {l.submitted || l.subject || "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full py-1 px-2.5 text-[11px] font-semibold ${style.bg} ${style.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                                        {l.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <button onClick={() => setReviewLesson(l)} className="border border-[#E8E8E3] hover:border-chestnut/30 hover:text-chestnut text-[#0F0F0E] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                                                        Review
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                </div>
            </div>

            <ReviewModal
                open={!!reviewLesson}
                onOpenChange={(o) => !o && setReviewLesson(null)}
                lesson={reviewLesson}
            />
        </>
    )
}

export default MyLesson