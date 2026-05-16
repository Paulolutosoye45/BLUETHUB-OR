import { useEffect, useState } from "react";
import { ChevronRight, Check, X, LayoutGrid, Users, ChevronDown, Plus, Info, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Label,
    Button,
} from "@bluethub/ui-kit";
import type { Classroom } from "../course/class/class-registration";
import { schoolService } from "@/services/school";
import { AxiosError } from "axios";
import type { Subject } from "../course/main";
import { authService, type IcreateUserRequest } from "@/services/auth";
import { localData } from "@/utils";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/utils/validate";

interface LineManager {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    emailAddress: string;
    roleId: number;
    roleName: string;
    isActive: boolean;
    hasAccess: boolean;
    profileImage: string | null;
    guardianName: string | null;
    createdDate: string;
    modifiedDate: string;
}


const ROLE_OPTIONS = ["Class Teacher", "Subject Teacher"];

const RegisterTeacherRole = () => {
    const [, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [role, setRole] = useState<string>("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [classes, setClasses] = useState<Classroom[]>([]);
    const [isClassOpen, setIsClassOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [, setClassroomError] = useState("");
    // subject
    const [majorSubjects, setMajorSubjects] = useState<Subject[]>([]);
    const [minorSubjects, setMinorSubjects] = useState<Subject[]>([]);
    const [, setSubjectErrorMsg] = useState("");
    const [, setSubjectLoading] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
    const [lineManagers, setLineManagers] = useState<LineManager[]>([]);
    const [isLineManagerOpen, setIsLineManagerOpen] = useState(false);
    const [selectedLineManager, setSelectedLineManager] = useState<LineManager | null>(null);

    const navigate = useNavigate();

    const isChecked = (id: string) => selectedSubjects.some(s => s.id === id);
    const fetchSubjects = async () => {
        setSubjectErrorMsg("")
        try {
            setSubjectLoading(true);
            const response = await schoolService.getAllSubject();
            const all: Subject[] = response.data.data.subjects; // adjust to actual response key


            setMajorSubjects(all.filter(s => s.subjectCategoryName === "Major"));
            setMinorSubjects(all.filter(s => s.subjectCategoryName === "Minor"));
        } catch (error) {
            const msg =
                error instanceof AxiosError
                    ? error.response?.data?.responseMessage ??
                    error.response?.data?.message ??
                    error.message
                    : (error as Error).message;
            setSubjectErrorMsg(msg);
        } finally {
            setSubjectLoading(false);
        }
    };


    const fetchClassrooms = async () => {
        setClassroomError("")
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
            setClassroomError(msg);
        } finally {
            setLoading(false);
        }
    };
    let roleId = UserRole.HeadTeacher;

    useEffect(() => {
        const init = async () => {
            await fetchClassrooms();
            await fetchSubjects();
            const { data } = await authService.getUserByRole(roleId);
            setLineManagers(data.data.users);
        };

        init();
    }, []);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleSubmitSubjects = () => {
        if (selectedSubjects.length === 0) return;
        setDialogOpen(false);
    };

    const handleRemoveSubject = (id: string) => {
        setSelectedSubjects(prev => prev.filter(s => s.id !== id));
    };

    const toggleSubject = (subject: Subject) => {
        setSelectedSubjects(prev =>
            prev.some(s => s.id === subject.id)
                ? prev.filter(s => s.id !== subject.id)
                : [...prev, subject]
        );
    };


    const handleSave = async () => {
        setErrorMsg("")
        if (!role) { setErrorMsg("Please select a role"); return; }
        if (!selectedClass) { setErrorMsg("Please select a class"); return; }
        if (selectedSubjects.length === 0) { setErrorMsg("Please add at least one subject"); return; }
        if (!selectedLineManager) { setErrorMsg("Please add line Manager"); return; }

        const teacherPayload = localData.retrieve("th_t") as IcreateUserRequest;
        if (!teacherPayload) {
            setErrorMsg("Teacher information missing, please go back and try again");
            return;
        }

        const finalPayload: IcreateUserRequest = {
            ...teacherPayload,
            lineManagerId: selectedLineManager?.id,
            userClassroomsId: [selectedClass.id],
            userSubjects: selectedSubjects.map(s => s.id),
        };

        try {
            setLoading(true);
            await authService.createUser(finalPayload);
            localData.remove("th_t");
            navigate('/admin');
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


    return (
        <div className="p-6 font-poppins">
            <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-white">

                {/* ── Top Nav ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4 bg-chestnut">
                    <div className="flex items-center gap-2 text-white text-sm font-semibold">
                        <Users className="w-4 h-4 text-white/70" />
                        <span>Register Teacher's Role</span>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                    </div>
                </div>

                {/* ── Body ────────────────────────────────────────────────── */}
                <div className="p-8">
                    <div className="flex gap-10">

                        {/* ── Left Column ─────────────────────────────────── */}
                        <div className="flex flex-col gap-6 w-48 shrink-0">
                            {/* Photo Upload */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-chestnut uppercase tracking-wide">
                                    Photo
                                </Label>
                                <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-chestnut/20 rounded-2xl cursor-pointer hover:border-chestnut/40 hover:bg-chestnut/2 transition-all bg-gray-50/60 overflow-hidden group">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-chestnut/10 flex items-center justify-center group-hover:bg-chestnut/20 transition-colors">
                                                <svg className="w-5 h-5 text-chestnut/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-semibold text-chestnut/60">Upload photo</span>
                                            <span className="text-[10px] text-chestnut/30 text-center px-2">Click to select image file</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                </label>
                            </div>

                        </div>

                        {/* ── Right Column ────────────────────────────────── */}
                        <div className="flex-1 space-y-6">

                            {/* Row 1 — Role + Class */}
                            <div className="grid grid-cols-2 gap-5">
                                {/* Role */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-chestnut uppercase tracking-wide">Role</Label>
                                    <DropdownMenu onOpenChange={setIsRoleOpen}>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-between font-medium border-0 ring-2 py-2.5 px-4 text-sm rounded-xl transition-all ${role
                                                    ? "ring-chestnut/30 text-chestnut bg-chestnut/5"
                                                    : "ring-gray-200 text-gray-400 bg-white"
                                                    } hover:ring-chestnut/40`}
                                            >
                                                <span className={role ? "font-semibold text-chestnut" : ""}>
                                                    {role || "Select role"}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-chestnut/50 transition-transform duration-200 ${isRoleOpen ? "rotate-180" : ""}`} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border border-gray-100 shadow-lg bg-white p-1.5" align="start" sideOffset={6}>
                                            <DropdownMenuGroup className="space-y-0.5">
                                                {ROLE_OPTIONS.map((option) => (
                                                    <DropdownMenuItem
                                                        key={option}
                                                        className={`text-sm py-2.5 px-3 rounded-lg cursor-pointer ${role === option ? "bg-chestnut text-white" : "text-gray-700 hover:bg-chestnut/5 hover:text-chestnut"
                                                            }`}
                                                        onClick={() => setRole(option)}
                                                    >
                                                        <span className="flex-1">{option}</span>
                                                        {role === option && <Check className="w-3.5 h-3.5" />}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Class */}
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

                            {/* Line Manager */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-chestnut uppercase tracking-wide">Line Manager</Label>
                                <DropdownMenu onOpenChange={setIsLineManagerOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-between font-medium border-0 ring-2 py-2.5 px-4 text-sm rounded-xl transition-all ${selectedLineManager
                                                ? "ring-chestnut/30 text-chestnut bg-chestnut/5"
                                                : "ring-gray-200 text-gray-400 bg-white"
                                                } hover:ring-chestnut/40`}
                                        >
                                            <span className={selectedLineManager ? "font-semibold text-chestnut" : ""}>
                                                {selectedLineManager
                                                    ? `${selectedLineManager.firstName} ${selectedLineManager.lastName}`
                                                    : "Select line manager"}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-chestnut/50 transition-transform duration-200 ${isLineManagerOpen ? "rotate-180" : ""}`} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) h-50 rounded-xl border border-gray-100 shadow-lg bg-white p-1.5" align="start" sideOffset={6}>
                                        <DropdownMenuGroup className="space-y-0.5">
                                            {lineManagers.map((lm) => (
                                                <DropdownMenuItem
                                                    key={lm.id}
                                                    onClick={() => setSelectedLineManager(lm)}
                                                    className={`text-sm py-2.5 px-3 rounded-lg cursor-pointer ${selectedLineManager?.id === lm.id
                                                        ? "bg-chestnut text-white"
                                                        : "text-gray-700 hover:bg-chestnut/5 hover:text-chestnut"
                                                        }`}
                                                >
                                                    <span className="flex-1">{lm.firstName} {lm.lastName}</span>
                                                    {selectedLineManager?.id === lm.id && <Check className="w-3.5 h-3.5" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Row 2 — Subjects */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-chestnut uppercase tracking-wide">
                                        Assigned Subjects
                                    </Label>
                                    {selectedSubjects.length > 0 && (
                                        <span className="text-[10px] font-semibold text-chestnut/50">
                                            {selectedSubjects.length} selected
                                        </span>
                                    )}
                                </div>

                                <div className="min-h-20 ring-2 ring-gray-200 focus-within:ring-chestnut/30 rounded-xl bg-gray-50/60 px-3 py-2.5 flex flex-wrap gap-1.5 transition-all">
                                    {selectedSubjects.length === 0 ? (
                                        <span className="text-xs text-gray-400 w-full text-center self-center py-2">
                                            No subjects added yet — click below to add
                                        </span>
                                    ) : (
                                        selectedSubjects.map(subject => (
                                            <span
                                                key={subject.id}
                                                className="inline-flex items-center gap-1 bg-chestnut/10 text-chestnut text-xs font-semibold px-2.5 py-1 rounded-full"
                                            >
                                                {subject.name}
                                                <button
                                                    onClick={() => handleRemoveSubject(subject.id)}
                                                    className="hover:text-red-500 transition-colors ml-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))
                                    )}
                                </div>

                                <button
                                    onClick={handleOpenDialog}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-chestnut hover:opacity-70 transition-opacity mt-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add subjects
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100" />

                            {/* Save Button */}
                            <div className="flex justify-between">
                                {errorMsg && (
                                    <div
                                        role="alert"
                                        className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-xs mb-5"
                                    >
                                        <Info className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                                        <span>{errorMsg}</span>
                                    </div>
                                )}

                                <Button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex ml-auto items-center gap-2 text-white text-sm font-semibold rounded-xl px-8 py-2.5 transition-opacity hover:opacity-90 bg-chestnut shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Save and Continue</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Select Subject Dialog ──────────────────────────────────── */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">
                    {/* Dialog header */}
                    <div className="px-6 py-5 border-b border-gray-100">
                        <DialogTitle className="text-sm font-bold text-chestnut">
                            Select Subjects
                        </DialogTitle>
                        <p className="text-[11px] text-gray-400 mt-0.5">Choose major and minor subjects for this teacher</p>
                    </div>

                    <div className="flex gap-0 px-6 py-5">
                        {/* Major Column */}
                        <div className="flex-1 pr-5 border-r border-gray-100">
                            <p className="text-[10px] font-bold text-chestnut mb-3 uppercase tracking-wide flex items-center gap-1.5">
                                <LayoutGrid className="w-3 h-3" />
                                Major
                            </p>
                            <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto pr-1">
                                {majorSubjects.map(s => (
                                    <label
                                        key={s.id}
                                        onClick={() => toggleSubject(s)}
                                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-chestnut/5 transition-colors"
                                    >
                                        <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${isChecked(s.id) ? "border-chestnut bg-chestnut" : "border-gray-300 bg-white"
                                            }`}>
                                            {isChecked(s.id) && (
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        <span className={`text-xs select-none ${isChecked(s.id) ? "text-chestnut font-semibold" : "text-gray-600 font-medium"}`}>
                                            {s.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Minor Column */}
                        <div className="flex-1 pl-5">
                            <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wide">Minor</p>
                            <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto pr-1">
                                {minorSubjects.map(s => (
                                    <label
                                        key={s.id}
                                        onClick={() => toggleSubject(s)}
                                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-chestnut/5 transition-colors"
                                    >
                                        <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${isChecked(s.id) ? "border-chestnut bg-chestnut" : "border-gray-300 bg-white"
                                            }`}>
                                            {isChecked(s.id) && (
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        <span className={`text-xs select-none ${isChecked(s.id) ? "text-chestnut font-semibold" : "text-gray-600 font-medium"}`}>
                                            {s.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dialog footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 font-medium">
                            {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? "s" : ""} selected
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-5 py-2 hover:bg-gray-50"
                                onClick={() => setDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="text-white text-xs font-semibold rounded-lg px-5 py-2 hover:opacity-90 transition-opacity bg-chestnut"
                                onClick={handleSubmitSubjects}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RegisterTeacherRole;