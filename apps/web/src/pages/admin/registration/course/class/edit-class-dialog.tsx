import { useState } from "react";
import { X, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Checkbox, Button, Dialog, DialogContent,
} from "@bluethub/ui-kit";

// const BRAND = "#292382";

interface SubjectItem {
    id: string;
    name: string;
}

const majorList: SubjectItem[] = [
    { id: "mathematics",        name: "Mathematics" },
    { id: "english",            name: "English" },
    { id: "basic-science",      name: "Basic Science" },
    { id: "basic-technology",   name: "Basic Technology" },
    { id: "computer-science",   name: "Computer Science" },
    { id: "agriculture-science",name: "Agriculture Science" },
    { id: "home-economics",     name: "Home Economics" },
    { id: "creative-art",       name: "Creative Art" },
    { id: "social-studies",     name: "Social Studies" },
    { id: "civic-education",    name: "Civic Education" },
];

const minorList: SubjectItem[] = [
    { id: "physical-health",    name: "Physical Health" },
    { id: "christian-knowledge",name: "Christian Knowledge" },
    { id: "islamic-knowledge",  name: "Islamic Knowledge" },
    { id: "yoruba-education",   name: "Yoruba Education" },
    { id: "home-econs-minor",   name: "Home Economics" },
    { id: "creative-art-minor", name: "Creative Arts" },
    { id: "social-minor",       name: "Social Studies" },
    { id: "civic-minor",        name: "Civic Education" },
];

type Tab = "General Info" | "Subjects";

interface EditClassDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialClassName?: string;
    initialTeacher?: string;
}

const tabVariants = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit:    { opacity: 0, y: -10, scale: 0.98 },
};

const EditClassModal = ({
    open,
    onOpenChange,
    initialClassName = "Jss1",
    initialTeacher = "Dr Roy Akinwale",
}: EditClassDialogProps) => {
    const [tab, setTab]           = useState<Tab>("General Info");
    const [className, setClassName] = useState(initialClassName);
    const [teacher, setTeacher]   = useState(initialTeacher);
    const [majorChecked, setMajorChecked] = useState<Set<string>>(new Set());
    const [minorChecked, setMinorChecked] = useState<Set<string>>(new Set());

    const toggleMajor = (id: string) =>
        setMajorChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

    const toggleMinor = (id: string) =>
        setMinorChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

    // Derive initials from class name
    const initials = className
        .split(/\s+/)
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "JS";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-w-md w-full">

                {/* ── HEADER ────────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-5 py-4 bg-chestnut"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                            <Pencil size={15} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm leading-tight">
                                Edit {className || "Jss 1A"}
                            </p>
                            <p className="text-white/55 text-[10px] mt-0.5">
                                Greenfield- Academic Management
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                    >
                        <X size={14} className="text-white" />
                    </button>
                </div>

                {/* ── TABS ──────────────────────────────────────────────── */}
                <div className="flex border-b border-gray-100 bg-white">
                    {(["General Info", "Subjects"] as Tab[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className="flex-1 py-3.5 text-xs font-bold relative transition-colors"
                            style={{ color: tab === t ? "#292382" : "#9ca3af" }}
                        >
                            {t}
                            {tab === t && (
                                <motion.div
                                    layoutId="tab-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-chestnut"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* ── CONTENT ───────────────────────────────────────────── */}
                <div className="bg-white relative overflow-hidden">
                    <AnimatePresence mode="wait">

                        {/* ── GENERAL INFO TAB ──────────────────────────── */}
                        {tab === "General Info" && (
                            <motion.div
                                key="general"
                                variants={tabVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.22, ease: "easeInOut" }}
                                className="px-5 py-5 flex flex-col gap-5"
                            >
                                {/* Class preview card */}
                                <div
                                    className="flex items-center justify-between px-4 py-3 rounded-xl border bg-chestnut/10 border-chestnut/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 bg-chestnut"
                                        >
                                            {initials}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 leading-tight">
                                                currently Editing
                                            </p>
                                            <p
                                                className="text-sm font-semibold leading-tight uppercase text-chestnut"
                                            >
                                                {className || "JSS1"}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className="text-xs font-semibold px-3 py-1 rounded-full bg-chestnut/12 text-chestnut"
                                    >
                                        Secondary Level
                                    </span>
                                </div>

                                {/* Enter Class field */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700">
                                        Enter Class <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            value={className}
                                            onChange={e => setClassName(e.target.value)}
                                            placeholder="e.g. Jss1"
                                            className="w-full ring-2 ring-chestnut/25 focus:ring-chestnut/50 border-0 rounded-lg px-3 py-2.5 pr-9 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none bg-white"
                                        />
                                        {className && (
                                            <button
                                                onClick={() => setClassName("")}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400">
                                        Edit the name and it will update everywhere it's used
                                    </p>
                                </div>

                                {/* Subject Teacher's Name field */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700">
                                        Subject Teacher's Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            value={teacher}
                                            onChange={e => setTeacher(e.target.value)}
                                            placeholder="e.g. Dr Roy Akinwale"
                                            className="w-full ring-2 ring-chestnut/25 focus:ring-chestnut/50 border-0 rounded-lg px-3 py-2.5 pr-9 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none bg-white"
                                        />
                                        {teacher && (
                                            <button
                                                onClick={() => setTeacher("")}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400">
                                        Enter assigned subject Teacher name
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* ── SUBJECTS TAB ──────────────────────────────── */}
                        {tab === "Subjects" && (
                            <motion.div
                                key="subjects"
                                variants={tabVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.22, ease: "easeInOut" }}
                                className="px-5 py-4"
                            >
                                <div className="flex gap-6">
                                    {/* Major column */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-chestnut mb-2.5">
                                            Major course
                                        </p>
                                        <div className="flex flex-col gap-1">
                                            {majorList.map(s => {
                                                const checked = majorChecked.has(s.id);
                                                return (
                                                    <label
                                                        key={s.id}
                                                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-chestnut/5 transition-colors"
                                                    >
                                                        <Checkbox
                                                            checked={checked}
                                                            onCheckedChange={() => toggleMajor(s.id)}
                                                            className="data-[state=checked]:bg-chestnut data-[state=checked]:border-chestnut"
                                                        />
                                                        <span className={`text-xs font-medium ${checked ? "text-chestnut font-bold" : "text-gray-600"}`}>
                                                            {s.name}
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
                                        <p className="text-xs font-bold text-gray-500 mb-2.5">
                                            Minor course
                                        </p>
                                        <div className="flex flex-col gap-1">
                                            {minorList.map(s => {
                                                const checked = minorChecked.has(s.id);
                                                return (
                                                    <label
                                                        key={s.id}
                                                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-chestnut/5 transition-colors"
                                                    >
                                                        <Checkbox
                                                            checked={checked}
                                                            onCheckedChange={() => toggleMinor(s.id)}
                                                            className="data-[state=checked]:bg-chestnut data-[state=checked]:border-chestnut"
                                                        />
                                                        <span className={`text-xs font-medium ${checked ? "text-chestnut font-bold" : "text-gray-600"}`}>
                                                            {s.name}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* ── FOOTER ────────────────────────────────────────────── */}
                <div className="flex justify-end gap-2.5 px-5 py-4 border-t border-gray-100 bg-white">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="px-6 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        className="px-6 py-2 text-sm font-bold text-white rounded-lg hover:opacity-90 transition-opacity bg-chestnut"
                    >
                        Save Changes
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default EditClassModal;