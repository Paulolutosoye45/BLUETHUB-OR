import {
    Button, Input, Label,
    // Dialog,
    // DialogContent,
    // DialogTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@bluethub/ui-kit"
import { BookTextIcon, CalendarRange, Check, ChevronDown, Clock3, EllipsisVertical, Plus} from "lucide-react"
import { useNavigate } from "react-router-dom"
// import { extractLabel, FieldSelect } from "../component/submit-lesson"
import { useEffect, useState } from "react"
import { schoolService } from "@/services/school"
// import toast from "react-hot-toast"
import { WeekRow, type Week } from "@/shared/week-row"
import Completion from "./completion"
import SubmissionGuide from "./submission-guide"
import type { Classroom } from "@/pages/admin/registration/course/class/class-registration"
import { AxiosError } from "axios"



// interface SelectItem {
//     id: string;
//     label: string;
// }

const CreateSyllabus = () => {
    const navigate = useNavigate();
    const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
    const [aim, setAim] = useState("");
    const [isClassOpen, setIsClassOpen] = useState(false);
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [expandAll, setExpandAll] = useState(false);
    const [classes, setClasses] = useState<Classroom[]>([]);
    const [, setLoading] = useState(false);
    const [, setErrorMsg] = useState("");

    const fetchClassrooms = async () => {
        setErrorMsg("")
        try {
            setLoading(true);
            const { data } = await schoolService.getAllClassRooms();
            setClasses(data.data.classrooms); // ← data.data.classrooms not data.classrooms
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

    useEffect(() => {
        const init = async () => {
            await fetchClassrooms();
        };

        init();
    }, []);

    const handleAddWeek = () => {
        const newWeek: Week = {
            id: crypto.randomUUID(),
            title: `Week ${weeks.length + 1}`,
            topics: [],
        };
        setWeeks(prev => [...prev, newWeek]);
    };

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
                                <h1 className="text-xl font-bold font-Instrument text-blck-b2 leading-tight">
                                    Syllabus builder
                                </h1>
                                <p className="text-sm text-[#A0A8C0]  mt-0.5">
                                    Build a complete term syllabus week by week and submit for admin approval
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate('/teacher/syllabus')}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[#0F0F0E] text-xs font-medium  bg-white shrink-0 transition-opacity border border-[#E8E8E3] hover:bg-white"
                            >
                                <BookTextIcon className="text-[#0F0F0E]" />
                                My Syllabus
                            </Button>
                        </div>

                        <div className="rounded-[16px] pl-[34px] py-[22px] bg-chestnut">
                            <div className="space-y-1">
                                <h1 className="text-white font-normal font-Instrument text-[22px] ">Syllabus builder</h1>
                                <p className="text-[#FFFFFF8C]">Define your subject plan, add weekly topics and submit for approval</p>
                                <div className="pt-[2.5px] flex items-center gap-2">
                                    <div className="flex items-center gap-[6px] bg-[#FFFFFF1A] rounded-[20px] py-[6px] px-3">
                                        <CalendarRange className="size-[13px] text-[#FFFFFFCC]" />
                                        <span className="text-[#FFFFFFCC] text-xs ">Second term 2025/2026</span>
                                    </div>
                                    <div className="flex items-center gap-[6px] bg-[#FFFFFF1A] rounded-[20px] py-[6px] px-3">
                                        <Clock3 className="size-[13px] text-[#FFFFFFCC]" />
                                        <span className="text-[#FFFFFFCC] text-xs ">3 Syllabus  pending admin review</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-5 mt-10">

                            <div className="space-y-4 flex-1 grow">
                                {/* form */}
                                <div className="border border-[#D9D9D9] bg-white rounded-[10px] pb-5 pt-2.5  px-4">
                                    <div className="p-[2px] border-b-2 border-[#D9D9D9] pb-[6px]  mb-[20px]">
                                        <h2 className="text-[#3A3A3A] font-medium font-poppins text-sm">Syllabus details</h2>
                                        <span className="font-medium text-xs text-[#3A3A3A80]">Define the subject, class and term for this syllabus</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 items-center sm:grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-sm font-medium text-[#3A3A3A]">
                                                    Subject <span className="text-red-500">*</span>
                                                </Label>

                                                <Input
                                                    type="text"
                                                    placeholder="Enter quiz ID"
                                                    className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-chestnut/40 focus:border-chestnut/40 outline-none transition"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-chestnut uppercase tracking-wide">Class</Label>
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
                                                    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) h-50 rounded-xl border border-gray-100 shadow-lg bg-white p-1.5" align="start" sideOffset={6}>
                                                        <DropdownMenuGroup className="space-y-0.5">
                                                            {classes.map((classroom) => (
                                                                <DropdownMenuItem
                                                                    key={classroom.id}
                                                                    onClick={() => setSelectedClass(classroom)}
                                                                    className={`text-sm py-2.5 px-3 rounded-lg cursor-pointer ${selectedClass?.id === classroom.id ? "bg-chestnut text-white" : "text-gray-700 hover:bg-chestnut/5 hover:text-chestnut"
                                                                        }`}
                                                                >
                                                                    <span className="flex-1">{classroom.name}</span>
                                                                    {selectedClass?.id === classroom.id && <Check className="w-3.5 h-3.5" />}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 items-center sm:grid-cols-2 gap-3">

                                            <div className="space-y-1.5">
                                                <Label className="text-sm font-medium text-[#3A3A3A]">
                                                    Syllabus title<span className="text-red-500">*</span>
                                                </Label>

                                                <Input
                                                    type="text"
                                                    placeholder="Enter quiz ID"
                                                    className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-chestnut/40 focus:border-chestnut/40 outline-none transition"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-sm font-medium text-[#3A3A3A]">
                                                    Recommended textbook <span className="text-red-500">*</span>
                                                </Label>

                                                <Input
                                                    type="text"
                                                    placeholder="Enter quiz ID"
                                                    className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-chestnut/40 focus:border-chestnut/40 outline-none transition"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-medium text-[#3A3A3A]">
                                                Objectives / overview <span className="text-red-500">*</span>
                                            </Label>
                                            <textarea rows={3} value={aim} onChange={(e) => setAim(e.target.value)}
                                                placeholder=" e.g Students will explore living things, matter, and energy. By end of term they will classify organisms, explain states of matter, and describe energy transfer."
                                                className="w-full rounded-xl border border-gray-200 ring-2 ring-chestnut/20 px-4 py-3 text-sm text-[#0F0F0E] placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-chestnut/50 transition-all" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-[#E8E8E3] rounded-2xl bg-white overflow-hidden">
                                    {/* Header */}
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

                                    {/* Week list */}
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

                                        {/* Add Week */}
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

                                <div className="rounded-[10px] border border-[#E8E8E3] bg-white p-6">

                                    <div className="relative flex items-center justify-between gap-6">
                                        {/* Left */}
                                        <div className="flex items-center gap-4">

                                            {/* Text */}
                                            <div>
                                                <h3 className="text-[#0F0F0E] font-semibold text-base">Ready to submit?</h3>
                                                <p className="text-[#A0A09C] text-xs mt-0.5">
                                                    Fill in details and add at least 4 weeks with topics
                                                </p>

                                            </div>
                                        </div>

                                        {/* Right — CTA */}
                                        <button className="shrink-0 flex items-center gap-2 bg-[#292382] hover:bg-[#1e1a6e] transition-colors text-white text-sm font-semibold px-5 py-3 rounded-[10px]">
                                            <svg width="20" height="20" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2.5 7.25C2.5 7.25 3.25 7.25 4.25 9C4.25 9 7.0295 4.4165 9.5 3.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                            Submit For Approval
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 shrink-0">
                                <Completion
                                    weeksPlanned={3}
                                    totalWeeks={12}
                                    totalTopics={8}
                                    weeksDone={2}
                                    checks={{
                                        subjectSelected: true,
                                        titleAdded: true,
                                        atLeast4Weeks: false,
                                        eachWeekHasTopics: false,
                                    }}
                                />
                                <SubmissionGuide />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateSyllabus
