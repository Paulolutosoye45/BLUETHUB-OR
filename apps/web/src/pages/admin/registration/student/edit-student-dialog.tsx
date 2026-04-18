import { useState } from "react";
import { X } from "lucide-react";
import {
    Button, Dialog,
    DialogContent,
} from "@bluethub/ui-kit";


type TabType = "personal" | "subject";

 export interface StudentProfile {
    id: number;
    name: string;
    photo?: string;
    className: string;
    subjectCount: number;
    guardianName: string;
    username: string;
    dob: string;
}

interface EditStudentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student?: StudentProfile;
    onSave?: (student: StudentProfile) => void;
}

const defaultStudent: StudentProfile = {
    id: 1,
    name: "Tee Wealth",
    photo: undefined,
    className: "JSS 1",
    subjectCount: 15,
    guardianName: "yourname@gmail.com",
    username: "tee.wealth",
    dob: "May 23 2026",
};

const EditStudentDialog = ({
    open,
    onOpenChange,
    student = defaultStudent,
    onSave,
}: EditStudentDialogProps) => {
    const [activeTab, setActiveTab] = useState<TabType>("personal");
    const [form, ] = useState<StudentProfile>(student);

    const initials = form.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleSave = () => {
        onSave?.(form);
        onOpenChange(false);
    };

    const fields: { label: string; key: keyof StudentProfile; display?: string }[] = [
        { label: "Name", key: "name" },
        { label: "Class", key: "className" },
        { label: "Subject", key: "subjectCount", display: `${form.subjectCount} courses` },
        { label: "Guardian's Name", key: "guardianName" },
        { label: "Username", key: "username" },
        { label: "D . O . B", key: "dob" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg p-0 rounded-2xl overflow-hidden gap-0 border-0">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-5 py-4 bg-chestnut"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm leading-tight">
                                Edit Student's Profile
                            </p>
                            <p className="text-white/55 text-xs mt-0.5">
                                Greenfield- Academic Management
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                    >
                        <X className="w-3.5 h-3.5 text-white" />
                    </button>
                </div>

                {/* ── Tabs ────────────────────────────────────────────────── */}
                <div className="flex border-b border-gray-100 px-6 bg-white">
                    {([
                        { key: "personal", label: "Personal Data" },
                        { key: "subject", label: "Subject" },
                    ] as { key: TabType; label: string }[]).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`py-3.5 px-1 mr-8 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.key
                                ? "text-chestnut border-chestnut"
                                : "text-gray-400 border-transparent hover:text-gray-500"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>


                <div className="bg-white px-6 py-5">

                    {activeTab === "personal" && (
                        <div className="flex flex-col gap-0">

                            {/* Avatar row */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-gray-100">
                                    {form.photo ? (
                                        <img
                                            src={form.photo}
                                            alt={form.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center text-white text-lg font-bold bg-chestnut"
                                        >
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{form.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Student</p>
                                </div>
                            </div>

                            {/* Fields list */}
                            <div className="border-2 border-gray-100 rounded-xl overflow-hidden">
                                {fields.map(({ label, key, display }, idx) => (
                                    <div
                                        key={key}
                                        className={`flex items-center justify-between px-5 py-3.5 ${idx !== fields.length - 1 ? "border-b-2 border-gray-100" : ""
                                            }`}
                                    >
                                        <span className="text-sm text-gray-500 font-medium min-w-32.5">
                                            {label}
                                        </span>
                                        <span className="text-sm text-gray-800 font-medium text-right">
                                            {display ?? String(form[key])}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Save button */}
                            <div className="flex justify-center mt-6">
                                <Button
                                    onClick={handleSave}
                                    className="px-14 py-2.5 text-sm font-bold text-white rounded-md transition-opacity hover:opacity-90 bg-chestnut"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === "subject" && (
                        <div className="flex flex-col gap-3">
                            <p className="text-xs text-gray-400 mb-2">
                                Subjects assigned to <span className="font-semibold text-chestnut">{form.name}</span>
                            </p>
                            <div className="border border-gray-100 rounded-xl overflow-hidden">
                                <div className="py-10 text-center">
                                    <p className="text-xs text-gray-400">No subjects assigned yet</p>
                                </div>
                            </div>
                            <div className="flex justify-center mt-4">
                                <Button
                                    onClick={handleSave}
                                    className="px-14 py-2.5 text-sm font-semibold text-white rounded-md transition-opacity hover:opacity-90 bg-chestnut"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditStudentDialog;