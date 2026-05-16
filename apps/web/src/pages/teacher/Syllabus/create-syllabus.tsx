import {
    Button, Label,
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@bluethub/ui-kit"
import { Check, ChevronDown, EllipsisVertical, Loader2, Plus, Trash2, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { schoolService } from "@/services/school"
import { authService } from "@/services/auth"
import { AxiosError } from "axios"
import { toast } from "@bluethub/ui-kit"
import { useAuthContext } from "@/contexts/auth-context"

interface SubjectItem { id: string; name: string; }
interface ClassItem { id: string; name: string; subjects: SubjectItem[]; }
interface TopicItem { id: string; name: string; subTopics: string[]; }

const isAdminRole = (roleName?: string) =>
    roleName === "Administrator" || roleName === "SuperAdministrator" || roleName === "HeadTeacher";

const CreateSyllabus = () => {
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const isAdmin = isAdminRole(user?.roleName);

    const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [isClassOpen, setIsClassOpen] = useState(false);
    const [isSubjectOpen, setIsSubjectOpen] = useState(false);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [topics, setTopics] = useState<TopicItem[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // ── Load classrooms ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;

        if (isAdmin) {
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
        } else {
            authService.getUserById(user.id).then((res) => {
                const userData = (res.data as any)?.data;
                const classroomsData: any[] = userData?.roleData?.classrooms ?? [];
                setClasses(classroomsData.map((c: any) => ({
                    id: String(c.classroomId),
                    name: String(c.className),
                    subjects: (c.subjects ?? []).map((s: any) => ({
                        id: String(s.subjectId),
                        name: String(s.subjectName),
                    })),
                })));
            }).catch(() => {});
        }
    }, [isAdmin, user?.id]);

    // ── Load subjects when class changes ───────────────────────────────────────
    useEffect(() => {
        setSelectedSubject(null);
        if (!selectedClass) { setSubjects([]); return; }
        if (isAdmin) {
            schoolService.getSubjectsByClassroomId(selectedClass.id).then((res) => {
                const data = (res.data as any)?.data;
                const major: any[] = data?.majorSubjects ?? [];
                const minor: any[] = data?.minorSubjects ?? [];
                setSubjects([...major, ...minor].map((s: any) => ({
                    id: String(s.subjectId ?? s.id),
                    name: String(s.subjectName ?? s.name ?? ""),
                })));
            }).catch(() => setSubjects([]));
        } else {
            setSubjects(selectedClass.subjects);
        }
    }, [selectedClass, isAdmin]);

    // ── Topic helpers ──────────────────────────────────────────────────────────
    const addTopic = () => setTopics(prev => [
        ...prev,
        { id: String(Date.now()), name: "", subTopics: [] },
    ]);

    const updateTopicName = (idx: number, name: string) =>
        setTopics(prev => prev.map((t, i) => i === idx ? { ...t, name } : t));

    const deleteTopic = (idx: number) =>
        setTopics(prev => prev.filter((_, i) => i !== idx));

    const addSubTopic = (idx: number, value: string) => {
        if (!value.trim()) return;
        setTopics(prev => prev.map((t, i) =>
            i === idx ? { ...t, subTopics: [...t.subTopics, value.trim()] } : t
        ));
    };

    const removeSubTopic = (topicIdx: number, subIdx: number) =>
        setTopics(prev => prev.map((t, i) =>
            i === topicIdx ? { ...t, subTopics: t.subTopics.filter((_, j) => j !== subIdx) } : t
        ));

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!selectedClass || !selectedSubject || topics.length === 0) {
            toast.error("Please select a class, subject and add at least one topic");
            return;
        }
        const namedTopics = topics.filter(t => t.name.trim());
        if (namedTopics.length === 0) {
            toast.error("Please enter at least one topic name");
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                classroomId: selectedClass.id,
                subjectId: selectedSubject.id,
                topics: namedTopics.map(t => ({
                    name: t.name.trim(),
                    subTopics: t.subTopics,
                })),
            };
            await schoolService.createTopic(payload);
            toast.success("Topics submitted successfully");
            navigate("/teacher/syllabus");
        } catch (err) {
            const msg = err instanceof AxiosError
                ? err.response?.data?.responseMessage ?? err.response?.data?.message ?? err.message
                : (err as Error).message;
            toast.error(msg || "Failed to submit");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-3 font-poppins">
            <div className="backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 sticky top-0 z-30 bg-chestnut">
                    <div>
                        <p className="text-white font-semibold text-sm">Create Syllabus</p>
                        <p className="text-white/60 text-[10px]">Add topics and subtopics for a subject</p>
                    </div>
                    <button className="text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                        <EllipsisVertical size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="bg-white/70 backdrop-blur-sm p-6">
                    <div className="max-w-2xl mx-auto space-y-6">

                        {/* Class + Subject */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-chestnut uppercase tracking-wide">
                                    Class <span className="text-red-500">*</span>
                                </Label>
                                <DropdownMenu onOpenChange={setIsClassOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className={`w-full justify-between font-medium border-0 ring-2 py-2.5 px-4 text-sm rounded-xl transition-all ${selectedClass ? "ring-chestnut/30 text-chestnut bg-chestnut/5" : "ring-gray-200 text-gray-400 bg-white"} hover:ring-chestnut/40`}>
                                            <span className={selectedClass ? "font-semibold text-chestnut" : ""}>{selectedClass?.name ?? "Select class"}</span>
                                            <ChevronDown className={`w-4 h-4 text-chestnut/50 transition-transform ${isClassOpen ? "rotate-180" : ""}`} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) max-h-52 overflow-y-auto rounded-xl border border-gray-100 shadow-lg bg-white p-1.5" align="start" sideOffset={6}>
                                        <DropdownMenuGroup className="space-y-0.5">
                                            {classes.map(c => (
                                                <DropdownMenuItem key={c.id} onClick={() => setSelectedClass(c)}
                                                    className={`text-sm py-2.5 px-3 rounded-lg cursor-pointer ${selectedClass?.id === c.id ? "bg-chestnut text-white" : "text-gray-700 hover:bg-chestnut/5 hover:text-chestnut"}`}>
                                                    <span className="flex-1">{c.name}</span>
                                                    {selectedClass?.id === c.id && <Check className="w-3.5 h-3.5" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-chestnut uppercase tracking-wide">
                                    Subject <span className="text-red-500">*</span>
                                </Label>
                                <DropdownMenu onOpenChange={setIsSubjectOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" disabled={!selectedClass} className={`w-full justify-between font-medium border-0 ring-2 py-2.5 px-4 text-sm rounded-xl transition-all ${selectedSubject ? "ring-chestnut/30 text-chestnut bg-chestnut/5" : "ring-gray-200 text-gray-400 bg-white"} hover:ring-chestnut/40`}>
                                            <span className={selectedSubject ? "font-semibold text-chestnut" : ""}>{selectedSubject?.name ?? (selectedClass ? "Select subject" : "Select class first")}</span>
                                            <ChevronDown className={`w-4 h-4 text-chestnut/50 transition-transform ${isSubjectOpen ? "rotate-180" : ""}`} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) max-h-52 overflow-y-auto rounded-xl border border-gray-100 shadow-lg bg-white p-1.5" align="start" sideOffset={6}>
                                        <DropdownMenuGroup className="space-y-0.5">
                                            {subjects.length === 0
                                                ? <DropdownMenuItem disabled className="text-xs text-gray-400 py-2 px-3">No subjects found</DropdownMenuItem>
                                                : subjects.map(s => (
                                                    <DropdownMenuItem key={s.id} onClick={() => setSelectedSubject(s)}
                                                        className={`text-sm py-2.5 px-3 rounded-lg cursor-pointer ${selectedSubject?.id === s.id ? "bg-chestnut text-white" : "text-gray-700 hover:bg-chestnut/5 hover:text-chestnut"}`}>
                                                        <span className="flex-1">{s.name}</span>
                                                        {selectedSubject?.id === s.id && <Check className="w-3.5 h-3.5" />}
                                                    </DropdownMenuItem>
                                                ))}
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Topics */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-800">
                                    Topics <span className="text-gray-400 font-normal">({topics.length})</span>
                                </p>
                                <button onClick={addTopic}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-chestnut hover:bg-chestnut/5 px-3 py-1.5 rounded-lg transition-colors">
                                    <Plus className="w-3.5 h-3.5" /> Add Topic
                                </button>
                            </div>

                            {topics.length === 0 && (
                                <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center">
                                    <p className="text-sm text-gray-400">No topics yet — click <span className="font-semibold">Add Topic</span> to start</p>
                                </div>
                            )}

                            {topics.map((topic, ti) => (
                                <TopicCard
                                    key={topic.id}
                                    topic={topic}
                                    index={ti}
                                    onNameChange={(name) => updateTopicName(ti, name)}
                                    onDelete={() => deleteTopic(ti)}
                                    onAddSubTopic={(val) => addSubTopic(ti, val)}
                                    onRemoveSubTopic={(subIdx) => removeSubTopic(ti, subIdx)}
                                />
                            ))}
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all bg-chestnut hover:bg-chestnut/90 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {submitting ? "Submitting…" : "Submit Topics"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Topic Card ─────────────────────────────────────────────────────────────────
const TopicCard = ({
    topic, index, onNameChange, onDelete, onAddSubTopic, onRemoveSubTopic,
}: {
    topic: TopicItem;
    index: number;
    onNameChange: (name: string) => void;
    onDelete: () => void;
    onAddSubTopic: (val: string) => void;
    onRemoveSubTopic: (idx: number) => void;
}) => {
    const [subInput, setSubInput] = useState("");

    const handleAdd = () => {
        if (!subInput.trim()) return;
        onAddSubTopic(subInput.trim());
        setSubInput("");
    };

    return (
        <div className="border border-[#E8E8E3] rounded-xl bg-white overflow-hidden">
            {/* Topic name row */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E8E8E3]">
                <span className="w-6 h-6 rounded-md bg-chestnut/10 flex items-center justify-center text-chestnut font-bold text-xs shrink-0">
                    {index + 1}
                </span>
                <input
                    value={topic.name}
                    onChange={e => onNameChange(e.target.value)}
                    placeholder="Topic name e.g. Photosynthesis"
                    className="flex-1 text-sm font-medium text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
                />
                <button onClick={onDelete} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Subtopics */}
            <div className="px-4 py-3 space-y-2">
                {topic.subTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {topic.subTopics.map((st, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-chestnut/8 text-chestnut text-xs font-medium px-2.5 py-1 rounded-full">
                                {st}
                                <button onClick={() => onRemoveSubTopic(i)} className="hover:text-red-500 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <input
                        value={subInput}
                        onChange={e => setSubInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAdd()}
                        placeholder="Add subtopic e.g. Light reactions"
                        className="flex-1 border border-[#E8E8E3] rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut/30"
                    />
                    <button onClick={handleAdd}
                        className="bg-chestnut text-white text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity">
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateSyllabus;
