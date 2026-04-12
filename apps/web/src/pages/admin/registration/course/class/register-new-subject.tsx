import { useState } from "react";
import { EllipsisVertical, PencilLine } from "lucide-react";

const BRAND = "#292382";

/* ── Data ──────────────────────────────────────────────────────────────── */
const majorList = [
    "Mathematics",
    "English",
    "Basic Science",
    "Basic Technology",
    "Computer Science",
    "Agriculture Science",
    "Physics",
    "Chemistry",
    "Biology",
    "Government",
    "commerce",
    "literature",
    "Accounting",
];

const minorList = [
    "Physical Health",
    "Christian knowledge",
    "Islamic Knowledge",
    "Yoruba Education",
    "Computer Science",
    "Agriculture Science",
    "Home Economics",
    "Creative Arts",
    "Social Studies",
    "Civic Education",
    "Economics",
    "Further Mathematics",
];

/* ── Component ─────────────────────────────────────────────────────────── */
const RegisterNewClass = () => {
    const [subject, setSubject] = useState("");
    const [subjectName, setSubjectName] = useState("");

    return (
        <div className="p-6 font-poppins">
            <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">

                {/* ── Top Nav ─────────────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-4  sticky top-0 z-30 py-5 bg-[#292382]"
                >
                    {/* Left: grid icon + title block */}
                    <div className="flex items-center gap-2.5">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                        </svg>
                        <div>
                            <p className="text-white font-bold text-sm leading-tight">Register New Class</p>
                            <p className="text-white/60 text-[10px] leading-tight">
                                Assign class details and configure subjects
                            </p>
                        </div>
                    </div>

                    {/* Right: Edit pill + three-dot */}
                    <div className="flex items-center gap-2">
                        <button
                            className="flex bg-[#EC1B2C] items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white  transition-colors"
                        >
                            <PencilLine className="size-4" />
                            Edit
                        </button>
                        <button className="text-white">
                            <EllipsisVertical size={18} />
                        </button>
                    </div>
                </div>

                {/* ── White card ──────────────────────────────────────────────── */}
                <div className="flex-1 p-8 bg-white/70 backdrop-blur-sm">
                    <div className="flex gap-6">

                        {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
                        <div className="w-44 flex-shrink-0 flex flex-col gap-4">

                            {/* Subject field */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    Subject
                                </label>
                                <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-2.5 py-2 bg-white">
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        placeholder="e.g. JSS 1A, Primary 2B"
                                        className="flex-1 text-xs text-gray-600 placeholder-gray-400 outline-none bg-transparent min-w-0"
                                    />
                                    {/* + button */}
                                    <button
                                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-[#292382]"
                                    >
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                                    Enter the official class designation used in your school
                                </p>
                            </div>

                            {/* Subject Name field */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    Subject Name *
                                </label>
                                <input
                                    type="text"
                                    value={subjectName}
                                    onChange={e => setSubjectName(e.target.value)}
                                    placeholder="Major"
                                    className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-600 placeholder-gray-400 outline-none focus:ring-1 bg-white"
                                    style={{ "--tw-ring-color": `${BRAND}50` } as React.CSSProperties}
                                />
                                <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                                    Enter the official class designation used in your school
                                </p>
                            </div>
                        </div>

                        {/* ── RIGHT PANEL: Two columns ─────────────────────────────── */}
                        <div className="flex-1 min-w-0 flex gap-4 bg-[#F3F6FF80]">

                            {/* Major course column */}
                            <div className="flex-1 min-w-0">
                                {/* Header pill */}
                                <div
                                    className="inline-flex items-center px-5 py-2 rounded-lg text-white text-sm font-bold mb-3 bg-[#292382]"

                                >
                                    Major course
                                </div>

                                {/* Subject list */}
                                <div className="flex flex-col space-y-2 gap-0">
                                    {majorList.map((subject) => {
                                        return (
                                            <div
                                                key={subject}
                                                className="py-2 pl-4 rounded-[5px] border-b bg-[#F3F6FF] border-b border-gray-100 last:border-0"
                                            >
                                                <span
                                                    className="text-xs font-[500] text-[#292382]">
                                                    {subject}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Vertical divider */}
                            <div className="w-px bg-gray-200 self-stretch" />

                            {/* Minor course column */}
                            <div className="flex-1 min-w-0">
                                {/* Header pill */}
                                <div
                                    className="inline-flex text-[#292382] bgorder-[#29238240] bg-[#29238208] items-center px-5 py-2 rounded-lg text-sm font-semibold mb-3 border">
                                    Minor course
                                </div>

                                {/* Subject list */}
                                <div className="flex flex-col space-y-2 gap-0">
                                    {minorList.map((subject) => (
                                        <div
                                            key={subject}
                                            className="py-2 pl-4 rounded-[5px] border-b bg-[#F3F6FF] border-gray-100 last:border-0"
                                        >
                                            <span className="text-xs font-[500] text-gray-600">
                                                {subject}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Footer ───────────────────────────────────────────────── */}
                    <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-100">
                        <button className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: BRAND }}
                        >
                            Add Subject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterNewClass;