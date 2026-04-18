import { useState } from "react";
import { Check, ChevronDown, EllipsisVertical, PencilLine } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Label,
    Button,
} from "@bluethub/ui-kit";
import { ClassCategory, type course, type SubjectType } from "@/utils/constant";
import { SubjectRegisteredDialog } from "./subject-register-dialog";
import { useNavigate } from "react-router-dom";

type SchoolLevel = "Primary" | "Junior Secondary" | "Senior Secondary";

const levels: SchoolLevel[] = ["Primary", "Junior Secondary", "Senior Secondary"];

const majorList = [
    "Mathematics", "English", "Basic Science", "Basic Technology",
    "Computer Science", "Agriculture Science", "Physics", "Chemistry",
    "Biology", "Government", "commerce", "literature", "Accounting",
];

const minorList = [
    "Physical Health", "Christian knowledge", "Islamic Knowledge",
    "Yoruba Education", "Computer Science", "Agriculture Science",
    "Home Economics", "Creative Arts", "Social Studies",
    "Civic Education", "Economics", "Further Mathematics",
];

const SUBJECT_TYPE_OPTIONS = [
    { label: "MAJOR", value: 1 as SubjectType },
    { label: "MINOR", value: 2 as SubjectType },
];

const RegisterNewSubject = () => {
    const [subjectName, setSubjectName] = useState("");
    const [selectedType, setSelectedType] = useState<SubjectType | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [, setCourses] = useState<course[]>([]);
    const [classType, 
        // setClassType
    ] = useState<ClassCategory>(ClassCategory.Primary);
    const [selectedLevels, setSelectedLevels] = useState<SchoolLevel[]>(["Junior Secondary"]);
    const [open, setOpen] = useState(false);

    const navigate = useNavigate();

    const toggle = (level: SchoolLevel) => {
        setSelectedLevels(prev =>
            prev.includes(level)
                ? prev.filter(l => l !== level)
                : [...prev, level]
        );
    };

    const isSelected = (level: SchoolLevel) => selectedLevels.includes(level);

    const handleSelect = (value: SubjectType) => {
        setSelectedType(value);
        setIsOpen(false);
    };

    const handleAddToList = () => {
        if (!selectedType || !subjectName.trim()) return;
        setCourses((prev) => [
            ...prev,
            { category: selectedType, subject: subjectName.trim(), isActive: true, classCategory: classType },
        ]);
        setSubjectName("");
    };

    return (
        <>
        <div className="p-6 font-poppins">
            <div className="backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">

                {/* ── Top Nav ─────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-4 sticky top-0 z-30 py-5 bg-chestnut">
                    <div className="flex items-center gap-2.5">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                        </svg>
                        <div className="space-y-1">
                            <p className="text-white font-bold text-sm leading-tight">Register Subject</p>
                            <p className="text-white/60 text-xs leading-tight">Assign subject details</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex bg-[#EC1B2C] items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-colors">
                            <PencilLine className="size-4" />
                            Edit
                        </button>
                        <button className="text-white">
                            <EllipsisVertical size={18} />
                        </button>
                    </div>
                </div>

                {/* ── White card ──────────────────────────────────────────────── */}
                <div className="flex-1 p-8 bg-white/40 backdrop-blur-sm">
                    <div className="flex gap-6">

                        {/* Left Column */}
                        <div className="w-full md:w-95.5 relative mb-6 md:mb-0">

                            {/* Subject Name */}
                            <div className="space-y-2 mb-7">
                                <Label className="text-chestnut text-sm font-semibold">Subject</Label>
                                <input
                                    placeholder="e.g, jss 1A, primary"
                                    className="relative ring-2 ring-chestnut/40 w-full font-medium border-0 px-4 py-2 text-base rounded-md shadow-sm placeholder:text-chestnut text-chestnut placeholder:font-normal outline-none"
                                    value={subjectName}
                                    onChange={(e) => setSubjectName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddToList()}
                                />
                            </div>

                            {/* Subject Type */}
                            <div className="space-y-3 w-full max-w-105 mb-7">
                                <Label className="text-chestnut font-semibold text-sm flex items-center gap-2">
                                    Subject type
                                </Label>
                                <DropdownMenu onOpenChange={setIsOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`relative ring-2 w-full justify-between font-medium border-0 py-2 px-4 text-base rounded-md group ${selectedType
                                                ? "ring-chestnut/40 text-chestnut bg-chestnut/5"
                                                : "ring-chestnut/20 text-chestnut/50 bg-white/80"
                                                } hover:ring-chestnut/40 hover:bg-chestnut/5`}
                                        >
                                            <span className={selectedType ? "text-chestnut font-semibold" : ""}>
                                                {selectedType
                                                    ? SUBJECT_TYPE_OPTIONS.find((o) => o.value === selectedType)?.label
                                                    : "Select subject type"}
                                            </span>
                                            <ChevronDown
                                                className={`w-5 h-5 text-chestnut/70 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border-2 border-chestnut/10 shadow-xl bg-white/95 backdrop-blur-sm p-2"
                                        align="start"
                                        sideOffset={8}
                                    >
                                        <DropdownMenuGroup className="space-y-1">
                                            {SUBJECT_TYPE_OPTIONS.map(({ label, value }) => (
                                                <DropdownMenuItem
                                                    key={label}
                                                    className={`font-normal text-base py-3 px-4 rounded-lg cursor-pointer ${selectedType === value
                                                        ? "bg-chestnut text-white"
                                                        : "text-chestnut hover:bg-chestnut/10"
                                                        }`}
                                                    onClick={() => handleSelect(value)}
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{label}</span>
                                                        {selectedType === value && <Check className="w-5 h-5 ml-2 text-white" />}
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* School Level Assignment */}
                            <div className="flex flex-col gap-3 w-full">
                                <h2 className="text-base font-semibold text-gray-900">
                                    School Level Assignment
                                </h2>
                                <p className="text-xs font-semibold text-gray-600">
                                    Assign to
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {levels.map(level => {
                                        const active = isSelected(level);
                                        return (
                                            <button
                                                key={level}
                                                onClick={() => toggle(level)}
                                                className="flex items-center justify-between   rounded-md border-2 p-2 text-xs font-medium"
                                                style={{
                                                    borderColor: active ? "#292382 " : "#d1d5db",
                                                    backgroundColor: "#fff",
                                                    color: active ? "#292382 " : "#374151",
                                                }}
                                            >
                                                <span>{level}</span>
                                                {active ? (
                                                    <span
                                                        className="w-5 h-5 rounded-full flex items-center justify-center bg-chestnut shrink-0"
                                                    >
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="w-5 h-5 rounded-full border-2 shrink-0"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-end mt-1">
                                    <Button
                                        onClick={handleAddToList}
                                        className="text-white text-sm bg-chestnut font-semibold rounded-md px-6 py-2.5 transition-opacity hover:opacity-90"
                                    >
                                        Add subject
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
                        <div className="flex-1 min-w-0 pt-3 flex gap-4 bg-[#F3F6FF80]">
                            {/* Major course column */}
                            <div className="flex-1 min-w-0">
                                <div className="inline-flex items-center px-5 py-2 rounded-lg text-white text-sm font-bold mb-3 bg-chestnut">
                                    Major course
                                </div>
                                <div className="flex flex-col space-y-2">
                                    {majorList.map(subject => (
                                        <div key={subject} className="py-2 pl-4 rounded-[5px] border-b bg-[#F3F6FF] border-gray-100 last:border-0">
                                            <span className="text-xs font-medium text-chestnut">{subject}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-1 bg-chestnut/50 self-stretch" />

                            {/* Minor course column */}
                            <div className="flex-1 min-w-0">
                                <div className="inline-flex text-[#3A3A3ABF] bg-[#29238208] items-center px-5 py-2 rounded-lg text-sm font-semibold mb-3 border">
                                    Minor course
                                </div>
                                <div className="flex flex-col space-y-2">
                                    {minorList.map(subject => (
                                        <div key={subject} className="py-2 pl-4 rounded-[5px] border-b bg-[#F3F6FF] border-gray-100 last:border-0">
                                            <span className="text-xs font-medium text-gray-600">{subject}</span>
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
                        <button onClick={() => setOpen(true)} className="px-5 bg-chestnut py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90">
                            Add Subject
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <SubjectRegisteredDialog
        open={open}
        onClose={() => setOpen(false)}
        onAddAnother={() => setOpen(false)}
        onViewAll={() => navigate('/admin/registration/courses/view-all-subject')}
      />
        </>
    );
};

export default RegisterNewSubject;