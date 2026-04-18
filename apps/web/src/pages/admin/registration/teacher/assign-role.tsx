import { useState } from "react";
import { ChevronRight, Check, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Label,
    Button,
} from "@bluethub/ui-kit";

const BRAND = "#292382";

const majorList = [
    "Mathematics", "English", "Basic Science", "Basic Technology",
    "Computer Science", "Agriculture Science", "Home Economics",
    "Creative Arts", "Social Studies", "Civic Education",
];

const minorList = [
    "Christian Studies", "Islamic Studies", "Vocational",
    "Short Hand Writing", "Health Education",
];

const ROLE_OPTIONS = ["Class Teacher", "Subject Teacher"];

const RegisterTeacherRole = () => {
    const [, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [role, setRole] = useState<string>("");
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [className, setClassName] = useState("");

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [tempSelected, setTempSelected] = useState<Set<string>>(new Set());
    const [registeredSubjects, setRegisteredSubjects] = useState<string[]>([]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleOpenDialog = () => {
        setTempSelected(new Set(registeredSubjects));
        setDialogOpen(true);
    };

    const handleToggleSubject = (subject: string) => {
        setTempSelected(prev => {
            const next = new Set(prev);
            next.has(subject) ? next.delete(subject) : next.add(subject);
            return next;
        });
    };

    const handleSubmitSubjects = () => {
        setRegisteredSubjects([...tempSelected]);
        setDialogOpen(false);
    };

    const handleRemoveSubject = (subject: string) => {
        setRegisteredSubjects(prev => prev.filter(s => s !== subject));
    };

    return (
        <div className="p-6 font-poppins">
            <div className="rounded-2xl border border-white/20 overflow-hidden shadow-lg">
                {/* ── Top Nav ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-5 py-4 bg-chestnut">
                    <div className="flex items-center gap-2 text-white text-sm font-semibold">
                        <span>Register Teacher's Role</span>
                        <span className="text-white/50">
                        <ChevronRight className="text-white"/>
                        </span>
                    </div>
                    <button className="flex bg-[#EC1B2C] items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-colors hover:opacity-90">
                        Edit Profile
                    </button>
                </div>

                {/* ── Body ────────────────────────────────────────────────── */}
                <div className="p-8 bg-white/40 backdrop-blur-sm">
                    <div className="flex gap-8">

                        {/* ── Left Column ─────────────────────────────────── */}
                        <div className="flex flex-col gap-6 w-56 shrink-0">

                            {/* Photo Upload */}
                            <div className="space-y-2">
                                <Label className="text-chestnut text-sm font-semibold">
                                    Photo<span className="text-red-500">*</span>
                                </Label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-chestnut/30 rounded-xl cursor-pointer hover:border-chestnut/60 transition-colors bg-white/60 overflow-hidden">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1">
                                            <svg className="w-6 h-6 text-chestnut/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                            </svg>
                                            <span className="text-xs font-semibold text-chestnut/60">Upload</span>
                                            <span className="text-[10px] text-chestnut/40">Click here to select file</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                </label>
                            </div>

                            {/* Role Dropdown */}

                        </div>

                        {/* ── Right Column ────────────────────────────────── */}
                        <div className="grid grid-cols-2 gap-6 flex-1">

                            <div className="space-y-2">
                                <Label className="text-chestnut text-sm font-semibold">
                                    Role<span className="text-red-500">*</span>
                                </Label>
                                <DropdownMenu onOpenChange={setIsRoleOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`relative ring-2 w-full justify-between font-medium border-0 py-2 px-4 text-sm rounded-md ${role
                                                    ? "ring-chestnut/40 text-chestnut bg-chestnut/5"
                                                    : "ring-chestnut/20 text-chestnut/40 bg-white/80"
                                                } hover:ring-chestnut/40 hover:bg-chestnut/5`}
                                        >
                                            <span className={role ? "text-chestnut font-semibold" : ""}>
                                                {role || "Select Role"}
                                            </span>
                                            <svg
                                                className={`w-4 h-4 text-chestnut/70 transition-transform duration-300 ${isRoleOpen ? "rotate-180" : ""}`}
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border-2 border-chestnut/10 shadow-xl bg-white p-2"
                                        align="start"
                                        sideOffset={6}
                                    >
                                        <DropdownMenuGroup className="space-y-1">
                                            {ROLE_OPTIONS.map((option) => (
                                                <DropdownMenuItem
                                                    key={option}
                                                    className={`text-sm py-2.5 px-4 rounded-lg cursor-pointer ${role === option
                                                            ? "bg-chestnut text-white"
                                                            : "text-chestnut hover:bg-chestnut/10"
                                                        }`}
                                                    onClick={() => setRole(option)}
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{option}</span>
                                                        {role === option && <Check className="w-4 h-4 text-white" />}
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Class Input */}
                            <div className="space-y-2">
                                <Label className="text-chestnut text-sm font-semibold">
                                    Class<span className="text-red-500">*</span>
                                </Label>
                                <input
                                    placeholder="jss 1 love"
                                    className="ring-2 ring-chestnut/40 w-full font-medium border-0 px-4 py-2 text-sm rounded-md shadow-sm placeholder:text-chestnut/30 text-chestnut outline-none bg-white/80"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                />
                            </div>

                            {/* Register Subject display + Add button */}
                            <div className="space-y-2">
                                <Label className="text-chestnut text-sm font-semibold">
                                    Register Subject<span className="text-red-500">*</span>
                                </Label>
                                <div className="min-h-16 ring-2 ring-chestnut/30 rounded-md bg-white/80 px-3 py-2 flex flex-wrap gap-1.5">
                                    {registeredSubjects.length === 0 ? (
                                        <span className="text-xs text-chestnut/30 w-auto mx-auto self-center">No subjects added</span>
                                    ) : (
                                        registeredSubjects.map(subject => (
                                            <span
                                                key={subject}
                                                className="inline-flex items-center gap-1 bg-chestnut/10 text-chestnut text-xs font-semibold px-2.5 py-1 rounded-full"
                                            >
                                                {subject}
                                                <button
                                                    onClick={() => handleRemoveSubject(subject)}
                                                    className="hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleOpenDialog}
                                        className="text-white text-xs font-semibold rounded-lg px-4 py-2 transition-opacity hover:opacity-90"
                                        style={{ backgroundColor: BRAND }}
                                    >
                                        Add subject
                                    </Button>
                                </div>
                            </div>

                            {/*Registered Course display */}
                            <div className="space-y-2">
                                <Label className="text-chestnut text-sm font-semibold">
                                    Registered Course<span className="text-red-500">*</span>
                                </Label>
                                <div className="min-h-24 ring-2 ring-chestnut/30 rounded-md bg-white/80 px-3 py-2 flex flex-wrap gap-1.5">
                                    {registeredSubjects.length === 0 ? (
                                        <span className="text-xs text-chestnut/30 w-auto mx-auto font-medium self-center">No subjects added yet </span>
                                    ) : (
                                        registeredSubjects.map(subject => (
                                            <span
                                                key={subject}
                                                className="inline-flex items-center gap-1 bg-chestnut/10 text-chestnut text-xs font-semibold px-2.5 py-1 rounded-full"
                                            >
                                                {subject}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>





                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end mt-auto">
                        <Button
                            className="text-white text-sm font-semibold rounded-xl px-8 py-2.5 transition-opacity hover:opacity-90"
                            style={{ backgroundColor: BRAND }}
                        >
                            Save and Continue
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Select Subject Dialog ────────────────────────────────────── */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-center text-base font-bold text-chestnut">
                            Select Subject
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex gap-0 mt-2">
                        {/* Major Column */}
                        <div className="flex-1 pr-4 border-r border-chestnut/15">
                            <p className="text-xs font-bold text-chestnut mb-3 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                                </svg>
                                Major course
                            </p>
                            <div className="flex flex-col gap-0.5">
                                {majorList.map(subject => {
                                    const checked = tempSelected.has(subject);
                                    return (
                                        <label
                                            key={subject}
                                            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-chestnut/5 transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => handleToggleSubject(subject)}
                                                className="accent-chestnut w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span className={`text-xs ${checked ? "text-chestnut font-bold" : "text-gray-600 font-medium"}`}>
                                                {subject}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Minor Column */}
                        <div className="flex-1 pl-4">
                            <p className="text-xs font-bold text-gray-500 mb-3">Minor course</p>
                            <div className="flex flex-col gap-0.5">
                                {minorList.map(subject => {
                                    const checked = tempSelected.has(subject);
                                    return (
                                        <label
                                            key={subject}
                                            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-chestnut/5 transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => handleToggleSubject(subject)}
                                                className="accent-chestnut w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <span className={`text-xs ${checked ? "text-chestnut font-bold" : "text-gray-600 font-medium"}`}>
                                                {subject}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4 flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            className="border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg px-6 py-2 hover:bg-gray-50"
                            onClick={() => setDialogOpen(false)}
                        >
                            Back
                        </Button>
                        <Button
                            className="text-white text-sm font-semibold rounded-lg px-6 py-2 hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: BRAND }}
                            onClick={handleSubmitSubjects}
                        >
                            Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RegisterTeacherRole;