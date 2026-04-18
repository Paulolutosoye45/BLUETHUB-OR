import { useState } from "react";
import { X, EllipsisVertical } from "lucide-react";
import ClassRegistered from "./class-registered";
import { useNavigate } from "react-router-dom";

const BRAND = "#292382";

const majorList = [
    "Mathematics", "English", "Basic Science", "Basic Technology",
    "Computer Science", "Agriculture Science", "Home Economics",
    "Creative Arts", "Social Studies", "Civic Education",
];

const minorList = [
    "Physical Health", "Christian Knowledge", "Islamic Knowledge",
    "Yoruba Education", "Computer Science", "Agriculture Science",
    "Home Economics", "Creative Arts", "Social Studies", "Civic Education",
];

type SubjectTab = "Major" | "Minor";

interface ClassPill {
    id: string;
    label: string;
}

const RegisterNewClass = () => {
    const [className, setClassName] = useState("");
    const [selectedClasses, setSelectedClasses] = useState<ClassPill[]>([
        { id: "jss1",     label: "JSS1" },
        { id: "jss2",     label: "JSS2" },
        { id: "jss3",     label: "JSS3" },
        { id: "ss1",      label: "SS1" },
        { id: "ss2",      label: "SS2" },
        { id: "ss3",      label: "SS3" },
        { id: "basic6l",  label: "Basic 6 Love" },
        { id: "basic5l",  label: "Basic 5 Love" },
        { id: "basic4l",  label: "Basic 4 Love" },
        { id: "basic3l",  label: "Basic 3 Love" },
        { id: "basic2l",  label: "Basic 2 Love" },
        { id: "basic1l",  label: "Basic 1 Love" },
    ]);

    const [subjectTab, setSubjectTab] = useState<SubjectTab>("Major");
    const [subjectSearch, setSubjectSearch] = useState("");
    const [selectedMajor, setSelectedMajor] = useState<Set<string>>(
        new Set(["Mathematics", "English", "Basic Science", "Basic Technology", "Computer Science", "Agriculture Science"])
    );
    const [selectedMinor, setSelectedMinor] = useState<Set<string>>(
        new Set(["Home Economics", "Creative Arts", "Social Studies", "Civic Education"])
    );

    const [open, setOpen] = useState(false);

    const handleAddClass = () => {
        const trimmed = className.trim();
        if (!trimmed) return;
        const id = trimmed.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
        setSelectedClasses(prev => [...prev, { id, label: trimmed }]);
        setClassName("");
    };

    const handleRemoveClass = (id: string) => {
        setSelectedClasses(prev => prev.filter(c => c.id !== id));
    };

    const toggleMajor = (subject: string) => {
        setSelectedMajor(prev => {
            const next = new Set(prev);
            next.has(subject) ? next.delete(subject) : next.add(subject);
            return next;
        });
    };

    const toggleMinor = (subject: string) => {
        setSelectedMinor(prev => {
            const next = new Set(prev);
            next.has(subject) ? next.delete(subject) : next.add(subject);
            return next;
        });
    };

    const filteredMajor = majorList.filter(s =>
        s.toLowerCase().includes(subjectSearch.toLowerCase())
    );
    const filteredMinor = minorList.filter(s =>
        s.toLowerCase().includes(subjectSearch.toLowerCase())
    );

    const handleSubmit = () => {
        console.log({
            classes: selectedClasses,
            majorSubjects: [...selectedMajor],
            minorSubjects: [...selectedMinor],
        });
        setOpen(true)
    };

    const navigate = useNavigate()

    return (
        <>
        <div className="p-6 font-poppins">
            <div className="backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">

                {/* ── Top Nav ───────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-30 bg-chestnut">
                    <div className="flex items-center gap-2.5">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                        </svg>
                        <div>
                            <p className="text-white font-bold text-sm leading-tight">Register New Class</p>
                            <p className="text-white/60 text-[10px] leading-tight">Assign class details and configure subjects</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 bg-[#EC1B2C] px-3 py-1.5 rounded-md text-xs font-semibold text-white hover:opacity-90 transition-opacity">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            View all Classes
                        </button>
                        <button className="text-white">
                            <EllipsisVertical size={18} />
                        </button>
                    </div>
                </div>

                {/* ── Body ──────────────────────────────────────────────── */}
                <div className="flex gap-0 bg-white/40 backdrop-blur-sm">

                    {/* ── LEFT PANEL ──────────────────────────────────────── */}
                    <div className="w-64 shrink-0 border-r border-chestnut/10 p-5 flex flex-col gap-4">

                        {/* Class Name input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-chestnut">
                                Class Name<span className="text-red-500">*</span>
                            </label>
                            <input
                                value={className}
                                onChange={e => setClassName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleAddClass()}
                                placeholder="e.g. JSS 1A, Primary 3B"
                                className="w-full ring-2 ring-chestnut/25 focus:ring-chestnut/50 border-0 rounded-lg px-3 py-2 text-sm text-chestnut font-medium placeholder:text-chestnut/30 outline-none bg-white"
                            />
                            <p className="text-[10px] text-gray-400">
                                Enter the official class designation used in your school
                            </p>
                        </div>

                        {/* Add Subject button */}
                        <button
                            onClick={handleAddClass}
                            className="w-full py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: BRAND }}
                        >
                            Add Subject
                        </button>

                        {/* Selected Class pills */}
                        <div className="flex flex-col gap-1.5">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                Selected Class
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {selectedClasses.map(cls => (
                                    <div
                                        key={cls.id}
                                        className="flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border-2 border-chestnut/20 bg-chestnut/5 text-chestnut"
                                    >
                                        <span className="truncate">{cls.label}</span>
                                        <button
                                            onClick={() => handleRemoveClass(cls.id)}
                                            className="fshrink-0 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT PANEL ─────────────────────────────────────── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-3 p-5">

                        {/* Header: label + Major/Minor toggle */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold text-chestnut">Class — Subjects</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    Toggle major and minor classification per subject
                                </p>
                            </div>
                            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5 shrink-0">
                                {(["Major", "Minor"] as SubjectTab[]).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setSubjectTab(tab)}
                                        className="px-4 py-1.5 rounded-md text-xs font-bold transition-all"
                                        style={{
                                            backgroundColor: subjectTab === tab ? BRAND : "transparent",
                                            color: subjectTab === tab ? "#fff" : "#6b7280",
                                        }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search */}
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={subjectSearch}
                                onChange={e => setSubjectSearch(e.target.value)}
                                placeholder="Search Subjects..."
                                className="flex-1 text-xs text-gray-600 placeholder-gray-400 outline-none bg-transparent"
                            />
                        </div>

                        {/* Two columns */}
                        <div className="flex gap-6">

                            {/* Major column */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-chestnut mb-2.5">Major course</p>
                                <div className="flex flex-col gap-0.5">
                                    {filteredMajor.map(subject => {
                                        const checked = selectedMajor.has(subject);
                                        return (
                                            <label
                                                key={subject}
                                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-chestnut/5 transition-colors"
                                            >
                                                <span
                                                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${
                                                        checked
                                                            ? "border-chestnut bg-chestnut"
                                                            : "border-gray-300 bg-white"
                                                    }`}
                                                    onClick={() => toggleMajor(subject)}
                                                >
                                                    {checked && (
                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </span>
                                                <span
                                                    onClick={() => toggleMajor(subject)}
                                                    className={`text-xs font-medium select-none ${
                                                        checked ? "text-chestnut font-bold" : "text-gray-600"
                                                    }`}
                                                >
                                                    {subject}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-px bg-chestnut/10 self-stretch" />

                            {/* Minor column */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-500 mb-2.5">Minor course</p>
                                <div className="flex flex-col gap-0.5">
                                    {filteredMinor.map(subject => {
                                        const checked = selectedMinor.has(subject);
                                        return (
                                            <label
                                                key={subject}
                                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-chestnut/5 transition-colors"
                                            >
                                                <span
                                                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${
                                                        checked
                                                            ? "border-chestnut bg-chestnut"
                                                            : "border-gray-300 bg-white"
                                                    }`}
                                                    onClick={() => toggleMinor(subject)}
                                                >
                                                    {checked && (
                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </span>
                                                <span
                                                    onClick={() => toggleMinor(subject)}
                                                    className={`text-xs font-medium select-none ${
                                                        checked ? "text-chestnut font-bold" : "text-gray-600"
                                                    }`}
                                                >
                                                    {subject}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer ────────────────────────────────────────────── */}
                <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-100 bg-white/60">
                    <button className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: BRAND }}
                    >
                        Submit Registration
                    </button>
                </div>
            </div>
        </div>
         <ClassRegistered
                open={open}
                onClose={() => setOpen(false)}
                onAddAnother={() => setOpen(false)}
                onViewAll={() => navigate('/admin/registration/courses/view-all-subject')}
              />
        </>
    );
};

export default RegisterNewClass;