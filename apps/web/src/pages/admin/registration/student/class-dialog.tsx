import { useState } from "react";
import { Check, Pencil, SquarePen, X } from "lucide-react";
import {
    Button, Dialog,
    DialogContent,
    Label,
} from "@bluethub/ui-kit";

// const BRAND = "#292382";

const majorList = [
    "Mathematics", "English", "Basic Science", "Basic Technology",
    "Computer Science", "Agriculture Science", "Home Economics",
    "Creative Art", "Social Studies", "Civic Education",
];

const minorList = [
    "Mathematics", "English", "Basic Science", "Basic Technology",
    "Computer Science", "Agriculture Science", "Home Economics",
    "Creative Art", "Social Studies", "Civic Education",
];

type SchoolLevel = "Primary" | "Junior Secondary" | "Senior Secondary";
const levels: SchoolLevel[] = ["Primary", "Junior Secondary", "Senior Secondary"];

interface ClassCourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentName?: string;
    studentUsername?: string;
    studentDob?: string;
    onSave?: (data: { assignedClass: string; levels: SchoolLevel[]; subjects: string[] }) => void;
}

const ClassDialog = ({
    open,
    onOpenChange,
    studentName = "Tee Wealth",
    studentUsername = "@tee-wealth",
    studentDob = "DOB: 22 Apr 1326",
    onSave,
}: ClassCourseDialogProps) => {
    const [activeTab, setActiveTab] = useState<"general" | "subjects">("general");
    const [assignedClass, setAssignedClass] = useState("");
    const [selectedLevels, setSelectedLevels] = useState<SchoolLevel[]>(["Junior Secondary"]);
    const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());

    const toggleLevel = (level: SchoolLevel) => {
        setSelectedLevels(prev =>
            prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
        );
    };

    const toggleSubject = (subject: string) => {
        setSelectedSubjects(prev => {
            const next = new Set(prev);
            next.has(subject) ? next.delete(subject) : next.add(subject);
            return next;
        });
    };

    const handleSave = () => {
        onSave?.({
            assignedClass,
            levels: selectedLevels,
            subjects: [...selectedSubjects],
        });
        onOpenChange(false);
    };

    const initials = studentName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 rounded-md overflow-hidden gap-0">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex items-start justify-between px-5 py-4 bg-chestnut">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                            <SquarePen className="size-4 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-medium text-sm leading-tight">Class & course</p>
                            <p className="text-white/60 text-xs mt-0.5">
                                Assign this student to a class and select their courses for the term
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors mt-0.5"
                    >
                        <X className="w-3.5 h-3.5 text-white" />
                    </button>
                </div>

                {/* ── Tabs ────────────────────────────────────────────────── */}
                <div className="flex border-b border-gray-100 px-5 bg-white">
                    {(["general", "subjects"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                                    ? "border-chestnut text-chestnut"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {tab === "general" ? "General Info" : "Subjects"}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ─────────────────────────────────────────── */}
                <div className="bg-white px-5 py-5">

                    {/* ── General Info Tab ──────────────────────────────────── */}
                    {activeTab === "general" && (
                        <div className="flex flex-col gap-5">

                            {/* Student card */}
                            <div className="flex items-center gap-3 bg-[#F3F6FF] border border-gray-100 rounded-xl px-4 py-3">
                                <div
                                    className="w-9 h-9  bg-chestnut rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                                >
                                    {initials}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#3A3A3ABF] leading-tight">{studentName}</p>
                                    <p className="text-xs text-blck-b2">
                                        {studentUsername} · {studentDob}
                                    </p>
                                </div>
                            </div>

                            {/* Assigned Class */}
                            <div className="space-y-3 mt-3.5">
                                <Label className="text-xs font-medium text-blck-b2">
                                    Assigned Class
                                </Label>
                                <div className="relative">
                                    <input
                                        value={assignedClass}
                                        onChange={e => setAssignedClass(e.target.value)}
                                        placeholder="Jss1"
                                        className="w-full ring-2 ring-chestnut/25 focus:ring-chestnut/50 border-0 rounded-lg px-3 py-2 pr-8 text-sm text-chestnut font-medium placeholder:text-chestnut/30 outline-none bg-white"
                                    />
                                    {assignedClass && (
                                        <button
                                            onClick={() => setAssignedClass("")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                    <p className="text-[10px] font-medium  text-[#3A3A3A80]">
                                    Edit the name post and it will update everywhere it's used.
                                </p>
                            </div>

                            {/* School Level Assignment */}
                            <div className="space-y-3">
                                <Label className="text-xs font-medium text-blck-b2">
                                    School Level Assignment
                                </Label>
                                <p className="text-[10px] font-semibold text-gray-500 ">
                                    Assign to 
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {levels.map(level => {
                                        const active = selectedLevels.includes(level);
                                        return (
                                            <button
                                                key={level}
                                                onClick={() => toggleLevel(level)}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#3A3A3A80] text-xs font-semibold transition-all"
                                                style={{
                                                    borderColor: active ? "#292382" : "#e5e7eb",
                                                    backgroundColor: active ? "#292382/10" : "#ffff",
                                                    color: active ? "#292382" : "#6b7280",
                                                }}
                                            >
                                                {active ? (
                                                    <span
                                                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-chestnut"
                                                    >
                                                        <Check className="w-2.5 h-2.5 text-white" />
                                                    </span>
                                                ) : (
                                                    <span className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0 bg-white" />
                                                )}
                                                {level}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Subjects Tab ──────────────────────────────────────── */}
                    {activeTab === "subjects" && (
                        <div>
                            {/* Class banner */}
                            <div className="flex items-center gap-2 mb-4">
                               <Pencil className="size-4 text-chestnut" />
                                <div>
                                    <p className="text-xs font-semibold text-chestnut leading-tight">
                                        Edit {assignedClass || "Jss 1A"}
                                    </p>
                                    <p className="text-[10px] text-gray-400">Greenfield - Academic Management</p>
                                </div>
                            </div>

                            {/* Two columns */}
                            <div className="flex gap-4">
                                {/* Major */}
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-chestnut mb-3">Major course</p>
                                    <div className="flex flex-col gap-1">
                                        {majorList.map(subject => {
                                            const checked = selectedSubjects.has(`major:${subject}`);
                                            return (
                                                <label
                                                    key={subject}
                                                    className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-chestnut/5 transition-colors"
                                                >
                                                    <span
                                                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${checked
                                                                ? "border-chestnut bg-chestnut"
                                                                : "border-gray-300 bg-white"
                                                            }`}
                                                        onClick={() => toggleSubject(`major:${subject}`)}
                                                    >
                                                        {checked && <Check className="w-2.5 h-2.5 text-white" />}
                                                    </span>
                                                    <span
                                                        className={`text-xs font-medium ${checked ? "text-chestnut font-bold" : "text-gray-600"}`}
                                                        onClick={() => toggleSubject(`major:${subject}`)}
                                                    >
                                                        {subject}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="w-px bg-gray-100 self-stretch" />

                                {/* Minor */}
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 mb-3">Minor Course</p>
                                    <div className="flex flex-col gap-1">
                                        {minorList.map(subject => {
                                            const checked = selectedSubjects.has(`minor:${subject}`);
                                            return (
                                                <label
                                                    key={subject}
                                                    className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-chestnut/5 transition-colors"
                                                >
                                                    <span
                                                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${checked
                                                                ? "border-chestnut bg-chestnut"
                                                                : "border-gray-300 bg-white"
                                                            }`}
                                                        onClick={() => toggleSubject(`minor:${subject}`)}
                                                    >
                                                        {checked && <Check className="w-2.5 h-2.5 text-white" />}
                                                    </span>
                                                    <span
                                                        className={`text-xs font-medium ${checked ? "text-chestnut font-bold" : "text-gray-600"}`}
                                                        onClick={() => toggleSubject(`minor:${subject}`)}
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
                    )}
                </div>

                {/* ── Footer ──────────────────────────────────────────────── */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-white">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="px-5 py-2 text-sm font-semibold bg-chestnut text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Save & Register
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ClassDialog;