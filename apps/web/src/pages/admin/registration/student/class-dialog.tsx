import { useEffect, useState } from "react";
import { Check, ChevronDown, Info, Loader2, Search, SquarePen, X } from "lucide-react";
import {
    Button, Dialog,
    DialogContent,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Label,
} from "@bluethub/ui-kit";
import type { Classroom } from "../course/class/class-registration";
import { schoolService } from "@/services/school";
import { AxiosError } from "axios";
import type { SchoolInfo } from "@/services";
import { localData } from "@/utils";
import type { Subject } from "../course/main";
import { authService, type IcreateUserRequest } from "@/services/auth";


type SchoolLevel = "Primary" | "Junior Secondary" | "Senior Secondary";
const levels: SchoolLevel[] = ["Primary", "Junior Secondary", "Senior Secondary"];

interface ClassCourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentName?: string;
    studentUsername?: string;
    studentDob?: string;
    onSave?: (data: IcreateUserRequest) => void;
}

const ClassDialog = ({
    open,
    onOpenChange,
    studentName,
    studentUsername,
    studentDob,
    onSave,
}: ClassCourseDialogProps) => {
    const [activeTab, setActiveTab] = useState<"general" | "subjects">("general");
    const [assignedClass, setAssignedClass] = useState("");
    const [selectedLevels, setSelectedLevels] = useState<SchoolLevel[]>(["Junior Secondary"]);
    const [classes, setClasses] = useState<Classroom[]>([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [subjectSearch, setSubjectSearch] = useState("");
    const [majorSubjects, setMajorSubjects] = useState<Subject[]>([]);
    const [minorSubjects, setMinorSubjects] = useState<Subject[]>([]);
    const [subjectIds, setSubjectIds] = useState<string[]>([])


    useEffect(() => {
        const fetchAll = async () => {
            if (!schoolId?.id) return;
            try {
                setLoading(true);
                const [subjectsRes, classroomsRes] = await Promise.all([
                    schoolService.getAllSchoolSubject(schoolId.id),
                    schoolService.getAllClassRooms(),
                ]);

                const all: Subject[] = subjectsRes.data.allSubjects;
                setMajorSubjects(all.filter(s => s.category === "Major"));
                setMinorSubjects(all.filter(s => s.category === "Minor"));
                setClasses(classroomsRes.data.data.classrooms);
            } catch (error) {
                const msg =
                    error instanceof AxiosError
                        ? error.response?.data?.responseMessage ??
                        error.response?.data?.message ??
                        error.message
                        : (error as Error).message;
                setErrorMsg(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);


    const isChecked = (id: string) => subjectIds.includes(id);
    const schoolId = localData.retrieve("schoolInfo") as SchoolInfo;

    const toggleSubject = (id: string) => {
        const updated = subjectIds.includes(id)
            ? subjectIds.filter(x => x !== id)
            : [...subjectIds, id];

        setSubjectIds(updated);
    };


    const filteredMajor = majorSubjects.filter(s =>
        s.subject.toLowerCase().includes(subjectSearch.toLowerCase())
    );

    const filteredMinor = minorSubjects.filter(s =>
        s.subject.toLowerCase().includes(subjectSearch.toLowerCase())
    );


    const toggleLevel = (level: SchoolLevel) => {
        setSelectedLevels(prev =>
            prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
        );
    };



    const handleSave = async () => {
        if (!assignedClass) {
            setErrorMsg("Student must be assigned to a class");
            return; // ← stops execution
        }

        const studentPayload = localData.retrieve("th_student") as IcreateUserRequest;
        if (!studentPayload) {
            setErrorMsg("Student information missing, please go back and try again");
            return;
        }

        if (!studentPayload) {
            console.error("Student payload missing");
            return;
        }

        if (!assignedClass) {
            setErrorMsg("Students must be assigned to a classroom");
            return;
        }

        const finalPayload: IcreateUserRequest = {
            ...studentPayload,
            userClassroomsId: [assignedClass],
            userSubjects: subjectIds,
        };

        setErrorMsg("")
        try {
            setLoading(true);
            await authService.createUser(finalPayload);
            localData.remove("th_student");
            onSave?.(finalPayload);
            onOpenChange(false);
        } catch (error) {
            const msg =
                error instanceof AxiosError
                    ? error.response?.data?.responseMessage ??
                    error.response?.data?.message ??
                    error.message
                    : (error as Error).message;
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    const initials = (studentName ?? "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
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
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="w-full ring-2 ring-chestnut/25 focus:ring-chestnut/50 rounded-lg px-3 py-2 text-sm font-medium outline-none bg-white flex items-center justify-between transition-all hover:ring-chestnut/50">
                                            <span className={assignedClass ? "text-chestnut" : "text-chestnut/30"}>
                                                {assignedClass
                                                    ? classes.find(c => c.id === assignedClass)?.name
                                                    : "Select a class"}
                                            </span>
                                            <ChevronDown className="w-3.5 h-3.5 text-chestnut/50 shrink-0" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                                        {classes.length === 0 ? (
                                            <div className="px-3 py-4 text-xs text-center text-gray-400">
                                                No classes available
                                            </div>
                                        ) : (
                                            classes.map(cls => (
                                                <DropdownMenuItem
                                                    key={cls.id}
                                                    onClick={() => setAssignedClass(cls.id)}
                                                    className={`text-sm font-medium cursor-pointer ${assignedClass === cls.id
                                                        ? "text-chestnut bg-chestnut/5"
                                                        : "text-gray-700"
                                                        }`}
                                                >
                                                    <span className="flex-1">{cls.name}</span>
                                                    {assignedClass === cls.id && (
                                                        <Check className="w-3.5 h-3.5 text-chestnut shrink-0" />
                                                    )}
                                                </DropdownMenuItem>
                                            ))
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <p className="text-[10px] font-medium text-[#3A3A3A80]">
                                    Select the class this student will be assigned to.
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
                        <div className="space-y-4">
                            {/* Search */}
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <input
                                    type="text"
                                    value={subjectSearch}
                                    onChange={e => setSubjectSearch(e.target.value)}
                                    placeholder="Search Subjects..."
                                    className="flex-1 text-xs text-gray-600 placeholder-gray-400 outline-none bg-transparent"
                                />
                            </div>

                            {/* Two columns */}
                            <div className="flex gap-4">

                                {/* Major column */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-chestnut mb-2.5">Major course</p>
                                    <div className="flex flex-col space-y-1 h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-chestnut/30 scrollbar-track-transparent">
                                        {filteredMajor.map(s => (
                                            <label
                                                key={s.schoolId}
                                                onClick={() => toggleSubject(s.schoolId)}
                                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-chestnut/5 transition-colors"
                                            >
                                                <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${isChecked(s.schoolId) ? "border-chestnut bg-chestnut" : "border-gray-300 bg-white"
                                                    }`}>
                                                    {isChecked(s.schoolId) && (
                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </span>
                                                <span className={`text-xs font-medium select-none ${isChecked(s.schoolId) ? "text-chestnut font-bold" : "text-gray-600"
                                                    }`}>
                                                    {s.subject}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="w-px bg-chestnut/10 self-stretch" />

                                {/* Minor column */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-500 mb-2.5">Minor course</p>
                                    <div className="flex flex-col space-y-1 h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-chestnut/30 scrollbar-track-transparent">
                                        {filteredMinor.map(s => (
                                            <label
                                                key={s.subject}
                                                onClick={() => toggleSubject(s.schoolId)}
                                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-chestnut/5 transition-colors"
                                            >
                                                <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${isChecked(s.schoolId) ? "border-chestnut bg-chestnut" : "border-gray-300 bg-white"
                                                    }`}>
                                                    {isChecked(s.schoolId) && (
                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </span>
                                                <span className={`text-xs font-medium select-none ${isChecked(s.schoolId) ? "text-chestnut font-bold" : "text-gray-600"
                                                    }`}>
                                                    {s.subject}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ──────────────────────────────────────────────── */}
                <div className="flex justify-between px-5 py-3 border-t border-gray-100 bg-white/60">
                    {errorMsg && (
                        <div
                            role="alert"
                            className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-5"
                        >
                            <Info className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                    <div className="flex items-center ml-auto justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 bg-[#292382] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <span>Save & Register</span>
                                </>
                            )}
                        </button>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ClassDialog;