import { useState } from "react";
import { EllipsisVertical, PlusIcon } from "lucide-react";

const BRAND = "#292382";

type SchoolLevel = "All Levels" | "Primary" | "JSS" | "SSS";
type SubjectStatus = "Active" | "Inactive";

interface Subject {
    id: number;
    name: string;
    level: SchoolLevel;
    status: SubjectStatus;
}

const allSubjects: Subject[] = [
    { id: 1, name: "Mathematics", level: "All Levels", status: "Active" },
    { id: 2, name: "English Language", level: "All Levels", status: "Active" },
    { id: 3, name: "Basic Science", level: "Primary", status: "Active" },
    { id: 4, name: "Basic Technology", level: "JSS", status: "Active" },
    { id: 5, name: "Computer Science", level: "JSS", status: "Active" },
    { id: 6, name: "Economics", level: "SSS", status: "Active" },
    { id: 7, name: "Biology", level: "SSS", status: "Active" },
    { id: 8, name: "Civic Education", level: "All Levels", status: "Active" },
    { id: 9, name: "Social Studies", level: "Primary", status: "Active" },
    { id: 10, name: "Agricultural Science", level: "JSS", status: "Active" },
    { id: 11, name: "Physics", level: "SSS", status: "Active" },
    { id: 12, name: "Chemistry", level: "SSS", status: "Active" },
    { id: 13, name: "Government", level: "SSS", status: "Active" },
    { id: 14, name: "Accounting", level: "SSS", status: "Active" },
];

/* ── Level badge colours ─────────────────────────────────────────────── */
const levelBadge: Record<SchoolLevel, { bg: string; text: string }> = {
    "All Levels": { bg: "#e0f2fe", text: "#0369a1" },
    "Primary": { bg: "#d1fae5", text: "#065f46" },
    "JSS": { bg: "#ede9fe", text: "#5b21b6" },
    "SSS": { bg: "#fee2e2", text: "#991b1b" },
};

type FilterTab = "All" | "Primary" | "JSS" | "SSS";

const ViewAllSubject = () => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterTab>("All");
    const [subjects] = useState<Subject[]>(allSubjects);

    const totalSubjects = subjects.length;
    const activeSubjects = subjects.filter(s => s.status === "Active").length;
    const nonActiveSubjects = subjects.filter(s => s.status === "Inactive").length;

    const visible = subjects.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
        const matchFilter =
            filter === "All" ||
            (filter === "Primary" && s.level === "Primary") ||
            (filter === "JSS" && s.level === "JSS") ||
            (filter === "SSS" && s.level === "SSS");
        return matchSearch && matchFilter;
    });

    return (
        <div className="p-6 font-poppins">
            <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">

                {/* ── Top Nav ──────────────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-4 py-5 sticky top-0 z-30 "
                    style={{ backgroundColor: BRAND }}
                >
                    <div className="flex items-center gap-2.5">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                        </svg>
                        <span className="text-white font-semibold text-sm">View All Subject</span>
                    </div>
                    <button className="text-white">
                        <EllipsisVertical size={18} />
                    </button>
                </div>

                {/* ── White card ───────────────────────────────────────────────── */}
                <div className="flex-1 p-8 bg-white/70 backdrop-blur-sm">
                    <div className="space-7-20">

                        {/* Page header row */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-xl font-bold text-[#3A3A3A] leading-tight">
                                    Subject Registry
                                </h1>
                                <p className="text-sm text-[#A0A8C0]  mt-0.5">
                                    All subjects registered to Greenfield College — Primary to Secondary
                                </p>
                            </div>
                            <button
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-semibold flex-shrink-0 transition-opacity hover:opacity-90"
                                style={{ backgroundColor: BRAND }}
                            >
                               <PlusIcon/>
                                Add Subject
                            </button>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[
                                {
                                    icon: (
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    ),
                                    value: totalSubjects,
                                    label: "Total subjects",
                                },
                                {
                                    icon: (
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ),
                                    value: activeSubjects,
                                    label: "Active subjects",
                                },
                                {
                                    icon: (
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ),
                                    value: nonActiveSubjects,
                                    label: "Non Active subjects",
                                },
                            ].map(({ icon, value, label }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-3 bg-gray-50 border border-[#E2E5F0] rounded-xl px-4 py-3"
                                >
                                    {icon}
                                    <div>
                                        <p className="text-xl font-bold text-[#12122A] leading-none">{value}</p>
                                        <p className="text-sm text-[#3A3A3ABF] mt-0.5">{label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Search + filter tabs */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by subject name..."
                                    className="flex-1 text-xs text-gray-600 placeholder-gray-400 outline-none bg-transparent"
                                />
                            </div>

                            {/* Filter tabs */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
                                {(["All", "Primary", "JSS", "SSS"] as FilterTab[]).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilter(tab)}
                                        className="px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all"
                                        style={{
                                            backgroundColor: filter === tab ? BRAND : "transparent",
                                            color: filter === tab ? "#fff" : "#6b7280",
                                        }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            {/* Table header */}
                            <div
                                className="grid text-[10px] font-bold uppercase tracking-wide text-gray-400 px-4 py-2 border-b border-gray-200"
                                style={{ gridTemplateColumns: "36px 1fr 130px 100px 70px" }}
                            >
                                <span>#</span>
                                <span>Subject Name</span>
                                <span>School Level</span>
                                <span>Status</span>
                                <span>Action</span>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-gray-100">
                                {visible.map((s, i) => {
                                    const badge = levelBadge[s.level];
                                    return (
                                        <div
                                            key={s.id}
                                            className="grid items-center px-4 py-2.5 hover:bg-gray-50/70 transition-colors"
                                            style={{ gridTemplateColumns: "36px 1fr 130px 100px 70px" }}
                                        >
                                            {/* # */}
                                            <span className="text-[11px] text-gray-400">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>

                                            {/* Subject name */}
                                            <span className="text-xs font-semibold text-gray-800">{s.name}</span>

                                            {/* Level badge */}
                                            <div>
                                                <span
                                                    className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                                                    style={{ backgroundColor: badge.bg, color: badge.text }}
                                                >
                                                    {s.level}
                                                </span>
                                            </div>

                                            {/* Status */}
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: s.status === "Active" ? "#22c55e" : "#f59e0b" }}
                                                />
                                                <span
                                                    className="text-[11px] font-medium"
                                                    style={{ color: s.status === "Active" ? "#15803d" : "#b45309" }}
                                                >
                                                    {s.status}
                                                </span>
                                            </div>

                                            {/* Edit link */}
                                            <button
                                                className="text-[11px] font-semibold hover:opacity-70 transition-opacity"
                                                style={{ color: BRAND }}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    );
                                })}

                                {visible.length === 0 && (
                                    <div className="py-10 text-center">
                                        <p className="text-xs text-gray-400">No subjects found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewAllSubject;