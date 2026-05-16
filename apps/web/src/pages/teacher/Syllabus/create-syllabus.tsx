import {
    Button, Input, Label,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@bluethub/ui-kit"
import { BookTextIcon, CalendarRange, Check, ChevronDown, Clock3, EllipsisVertical, Loader2, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { schoolService } from "@/services/school"
import { WeekRow, type Week } from "@/shared/week-row"
import Completion from "./completion"
import SubmissionGuide from "./submission-guide"
import { AxiosError } from "axios"
import toast from "react-hot-toast"
import { API } from "@/services"
import { X_Tenant_ID } from "@/utils/tenant"
import { useAuthContext } from "@/contexts/auth-context"

interface SubjectItem { id: string; name: string; }
interface ClassItem { id: string; name: string; subjects: SubjectItem[]; }

const isTeacherRole = (roleName?: string) =>
    !!roleName?.toLowerCase().includes("teacher");

const CreateSyllabus = () => {
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const isTeacher = isTeacherRole(user?.roleName);

    const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [isSubjectOpen, setIsSubjectOpen] = useState(false);
    const [isClassOpen, setIsClassOpen] = useState(false);
    const [classes, setClasses] = useState<ClassItem[]>([]);

    const [title, setTitle] = useState("");
    const [textbook, setTextbook] = useState("");
    const [aim, setAim] = useState("");
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [expandAll, setExpandAll] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ── Populate classrooms ────────────────────────────────────────────────────
    useEffect(() => {
        if (isTeacher) {
            // Teacher: classrooms + their subjects come directly from roleData
            const roleClassrooms = user?.roleData?.classrooms ?? [];
            setClasses(roleClassrooms.map((c: any) => ({
                id: String(c.classroomId),
                name: String(c.className),
                subjects: (c.subjects ?? []).map((s: any) => ({
                    id: String(s.subjectId),
                    name: String(s.subjectName),
                })),
            })));
        } else {
            // Admin/HeadTeacher: fetch all classrooms from API
            schoolService.getAllClassRooms()
                .then(({ data }) => {
                    const raw: any[] = (data as any).data?.classrooms ?? [];
                    setClasses(raw.map((c: any) => ({
                        id: String(c.id ?? c.classroomId),
                        name: String(c.name ?? c.className),
                        subjects: [],
                    })));
                })
                .catch(() => {});
        }
    }, [isTeacher, user]);

    // ── Populate subjects when class changes ───────────────────────────────────
    useEffect(() => {
        setSelectedSubject(null);
        if (!selectedClass) { setSubjects([]); return; }

        if (isTeacher) {
            // Subjects already embedded in the class item from roleData
            setSubjects(selectedClass.subjects);
        } else {
            // Admin: fetch subjects for the selected classroom
            schoolService.getSubjectsByClassroomId(selectedClass.id).then((res) => {
                const data = (res.data as any)?.data;
                const major: any[] = data?.majorSubjects ?? [];
                const minor: any[] = data?.minorSubjects ?? [];
                setSubjects([...major, ...minor].map((s: any) => ({
                    id: String(s.subjectId ?? s.id),
                    name: String(s.subjectName ?? s.name ?? ""),
                })));
            }).catch(() => setSubjects([]));
        }
    }, [selectedClass, isTeacher]);

    // ── Completion checks ──────────────────────────────────────────────────────
    const totalTopics = useMemo(() => weeks.reduce((acc, w) => acc + w.topics.length, 0), [weeks]);
    const weeksDone = useMemo(() => weeks.filter(w => w.topics.length > 0).length, [weeks]);
    const checks = useMemo(() => ({
        subjectSelected: !!(selectedClass && selectedSubject),
        titleAdded: title.trim().length > 0,
        atLeast4Weeks: weeks.length >= 4,
        eachWeekHasTopics: weeks.length > 0 && weeks.every(w => w.topics.length > 0),
    }), [selectedClass, selectedSubject, title, weeks]);

    const canSubmit = checks.subjectSelected && checks.titleAdded && checks.atLeast4Weeks && checks.eachWeekHasTopics;

    const handleAddWeek = () => {
        if (weeks.length >= 12) return;
        setWeeks(prev => [...prev, {
            id: crypto.randomUUID(),
            title: `Week ${prev.length + 1}`,
            topics: [],
        }]);
    };

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!canSubmit || !selectedClass || !selectedSubject) return;
        if (!aim.trim()) { toast.error("Please add an objective / overview"); return; }

        setSubmitting(true);
        try {
            const payload = {
                classroomId: selectedClass.id,
                subjectId: selectedSubject.id,
                title: title.trim(),
                recommendedTextbook: textbook.trim(),
                objectives: aim.trim(),
                weeks: weeks.map((w, i) => ({
                    weekNumber: i + 1,
                    title: w.title,
                    topics: w.topics,
                })),
            };
            await API.post("/api/Syllabus/create", payload, {
                headers: { "X-Tenant-ID": X_Tenant_ID },
            });
            toast.success("Syllabus submitted for approval");
            navigate("/teacher/syllabus");
        } catch (err) {
            const msg = err instanceof AxiosError
                ? err.response?.data?.responseMessage ?? err.response?.data?.message ?? err.message
                : (err as Error).message;
            toast.error(msg || "Failed to submit syllabus");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-3 font-poppins">
            <div className="backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">

                {/* ── Top Nav ──────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-4 py-5 sticky top-0 z-30 bg-chestnut">
                    <span className="text-white font-semibold text-sm">Syllabus</span>
                    <button className="text-white">
                        <EllipsisVertical size={18} />
                    </button>
                </div>

                {/* ── White card ───────────────────────────────────────────────── */}
                <div className="flex-1 p-3 bg-white/70 backdrop-blur-sm">

                    {/* Page header row */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-bold font-Instrument text-blck-b2 leading-tight">
                                Syllabus builder
                            </h1>
                            <p className="text-sm text-[#A0A8C0] mt-0.5">
                                Build a complete term syllabus week by week and submit for admin approval
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate('/teacher/syllabus')}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[#0F0F0E] text-xs font-medium bg-white shrink-0 transition-opacity border border-[#E8E8E3] hover:bg-white"
                        >
                            <BookTextIcon className="text-[#0F0F0E]" />
                            My Syllabus
                        </Button>
                    </div>

                    {/* Banner */}
                    <div className="rounded-[16px] pl-[34px] py-[22px] bg-chestnut">
                        <div className="space-y-1">
                            <h1 className="text-white font-normal font-Instrument text-[22px]">Syllabus builder</h1>
                            <p className="text-[#FFFFFF8C]">Define your subject plan, add weekly topics and submit for approval</p>
                            <div className="pt-[2.5px] flex items-center gap-2">
                                <div className="flex items-center gap-[6px] bg-[#FFFFFF1A] rounded-[20px] py-[6px] px-3">
                                    <CalendarRange className="size-[13px] text-[#FFFFFFCC]" />
                                    <span className="text-[#FFFFFFCC] text-xs">Second term 2025/2026</span>
                                </div>
                                <div className="flex items-center gap-[6px] bg-[#FFFFFF1A] rounded-[20px] py-[6px] px-3">
                                    <Clock3 className="size-[13px] text-[#FFFFFFCC]" />
                                    <span className="text-[#FFFFFFCC] text-xs">{weeks.length} week{weeks.length !== 1 ? "s" : ""} planned</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-5 mt-10">

                        {/* ── Left column ───────────────────────────────────────── */}
                        <div className="space-y-4 flex-1 grow">

                            {/* Syllabus details form */}
                            <div className="border border-[#D9D9D9] bg-white rounded-[10px] pb-5 pt-2.5 px-4">
                                <div className="p-[2px] border-b-2 border-[#D9D9D9] pb-[6px] mb-[20px]">
                                    <h2 className="text-[#3A3A3A] font-medium font-poppins text-sm">Syllabus details</h2>
                                    <span className="font-medium text-xs text-[#3A3A3A80]">Define the subject, class and term for this syllabus</span>
                                </div>
                                <div className="space-y-3">
                                    {/* Row 1: Class → Subject */}
                                    <div className="grid grid-cols-1 items-center sm:grid-cols-2 gap-3">
                                        {/* Class (first — Subject depends on it) */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-chestnut uppercase tracking-wide">
                                                Class <span className="text-red-500">*</span>
                                            </Label>
                                            <DropdownMenu onOpenChange={setIsClassOpen}>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`w-full justify-between font-medium border-0 ring-2 py-2.5 px-4 text-sm rounded-xl transition-all ${selectedClass
                                                            ? "ring-chestnut/30 text-chestnut bg-chestnut/5"
                                                            : "ring-gray-200 text-gray-400 bg-white"
                                                            } hover:ring-chestnut/40`}
                                                    >
                                                        <span className={selectedClass ? "font-semibold text-chestnut" : ""}>
                                                            {selectedClass ? selectedClass.name : "Select class"}
                                                        </span>
                                                        <ChevronDown className={`w-4 h-4 text-chestnut/50 transition-transform duration-200 ${isClassOpen ? "rotate-180" : ""}`} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) max-h-52 overflow-y-auto rounded-xl border border-gray-100 shadow-lg bg-white p-1.5" align="start" sideOffset={6}>
                                                    <DropdownMenuGroup className="space-y-0.5">
                                                        {classes.map((classroom) => (
                                                            <DropdownMenuItem
                                                                key={classroom.id}
                                                                onClick={() => setSelectedClass(classroom)}
                                                                className={`text-sm py-2.5 px-3 rounded-lg cursor-pointer ${selectedClass?.id === classroom.id ? "bg-chestnut text-white" : "text-gray-700 hover:bg-chestnut/5 hover:text-chestnut"}`}
                                                            >
                                                                <span className="flex-1">{classroom.name}</span>
                                                                {selectedClass?.id === classroom.id && <Check className="w-3.5 h-3.5" />}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Subject (loads after class is selected) */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-chestnut uppercase tracking-wide">
                                                Subject <span className="text-red-500">*</span>
                                            </Label>
                                            <DropdownMenu onOpenChange={setIsSubjectOpen}>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        disabled={!selectedClass}
                                                        className={`w-full justify-between font-medium border-0 ring-2 py-2.5 px-4 text-sm rounded-xl transition-all ${selectedSubject
                                                            ? "ring-chestnut/30 text-chestnut bg-chestnut/5"
                                                            : "ring-gray-200 text-gray-400 bg-white"
                                                            } hover:ring-chestnut/40`}
                                                    >
                                                        <span className={selectedSubject ? "font-semibold text-chestnut" : ""}>
                                                            {selectedSubject ? selectedSubject.name : selectedClass ? "Select subject" : "Select class first"}
                                                        </span>
                                                        <ChevronDown className={`w-4 h-4 text-chestnut/50 transition-transform duration-200 ${isSubjectOpen ? "rotate-180" : ""}`} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) max-h-52 overflow-y-auto rounded-xl border border-gray-100 shadow-lg bg-white p-1.5" align="start" sideOffset={6}>
                                                    <DropdownMenuGroup className="space-y-0.5">
                                                        {subjects.length === 0 ? (
                                                            <DropdownMenuItem disabled className="text-xs text-gray-400 py-2 px-3">No subjects found</DropdownMenuItem>
                                                        ) : subjects.map((s) => (
                                                            <DropdownMenuItem
                                                                key={s.id}
                                                                onClick={() => setSelectedSubject(s)}
                                                                className={`text-sm py-2.5 px-3 rounded-lg cursor-pointer ${selectedSubject?.id === s.id ? "bg-chestnut text-white" : "text-gray-700 hover:bg-chestnut/5 hover:text-chestnut"}`}
                                                            >
                                                                <span className="flex-1">{s.name}</span>
                                                                {selectedSubject?.id === s.id && <Check className="w-3.5 h-3.5" />}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Row 2: Title + Textbook */}
                                    <div className="grid grid-cols-1 items-center sm:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-medium text-[#3A3A3A]">
                                                Syllabus title <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="e.g. Basic Science — Second Term"
                                                className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-chestnut/40 focus:border-chestnut/40 outline-none transition"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-medium text-[#3A3A3A]">
                                                Recommended textbook
                                            </Label>
                                            <Input
                                                type="text"
                                                value={textbook}
                                                onChange={(e) => setTextbook(e.target.value)}
                                                placeholder="e.g. New School Science for JSS 2"
                                                className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-chestnut/40 focus:border-chestnut/40 outline-none transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Objectives */}
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium text-[#3A3A3A]">
                                            Objectives / overview <span className="text-red-500">*</span>
                                        </Label>
                                        <textarea
                                            rows={3}
                                            value={aim}
                                            onChange={(e) => setAim(e.target.value)}
                                            placeholder="e.g. Students will explore living things, matter, and energy. By end of term they will classify organisms, explain states of matter, and describe energy transfer."
                                            className="w-full rounded-xl border border-gray-200 ring-2 ring-chestnut/20 px-4 py-3 text-sm text-[#0F0F0E] placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-chestnut/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Weekly Plan */}
                            <div className="border border-[#E8E8E3] rounded-2xl bg-white overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E3]">
                                    <div>
                                        <h3 className="text-[#0F0F0E] font-semibold text-sm">Weekly Plan</h3>
                                        <p className="text-[#A8A8A4] text-xs mt-0.5">Add topics for each week</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[#A8A8A4] text-xs font-medium">
                                            {weeks.length}/12 weeks planned
                                        </span>
                                        <button
                                            onClick={() => setExpandAll(p => !p)}
                                            className="border border-[#E8E8E3] text-xs font-semibold text-[#0F0F0E] px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            {expandAll ? "Collapse all" : "Expand all"}
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 space-y-3">
                                    {weeks.map((week, i) => (
                                        <WeekRow
                                            key={week.id}
                                            week={week}
                                            index={i}
                                            expanded={expandAll}
                                            onChange={(updated) =>
                                                setWeeks(prev => prev.map(w => w.id === updated.id ? updated : w))
                                            }
                                            onDelete={() =>
                                                setWeeks(prev => prev.filter(w => w.id !== week.id))
                                            }
                                        />
                                    ))}

                                    <button
                                        onClick={handleAddWeek}
                                        disabled={weeks.length >= 12}
                                        className="w-full border-2 bg-[#F9FBFF] border-dashed border-[#E8E8E3] rounded-xl py-5 flex items-center justify-center gap-2 text-sm font-semibold text-[#3A3A3A] hover:border-[#292382]/30 hover:text-[#292382] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4 text-[#3A3A3A]" />
                                        Add Week
                                    </button>
                                </div>
                            </div>

                            {/* Submit CTA */}
                            <div className="rounded-[10px] border border-[#E8E8E3] bg-white p-6">
                                <div className="relative flex items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-[#0F0F0E] font-semibold text-base">Ready to submit?</h3>
                                        <p className="text-[#A0A09C] text-xs mt-0.5">
                                            {canSubmit
                                                ? "All requirements met — your syllabus is ready for approval"
                                                : "Fill in details and add at least 4 weeks with topics"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!canSubmit || submitting}
                                        className={`shrink-0 flex items-center gap-2 transition-colors text-white text-sm font-semibold px-5 py-3 rounded-[10px] ${canSubmit && !submitting
                                            ? "bg-[#292382] hover:bg-[#1e1a6e]"
                                            : "bg-gray-300 cursor-not-allowed"
                                            }`}
                                    >
                                        {submitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2.5 7.25C2.5 7.25 3.25 7.25 4.25 9C4.25 9 7.0295 4.4165 9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                        {submitting ? "Submitting…" : "Submit For Approval"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── Right column ──────────────────────────────────────── */}
                        <div className="space-y-3 shrink-0">
                            <Completion
                                weeksPlanned={weeks.length}
                                totalWeeks={12}
                                totalTopics={totalTopics}
                                weeksDone={weeksDone}
                                checks={checks}
                            />
                            <SubmissionGuide />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateSyllabus
