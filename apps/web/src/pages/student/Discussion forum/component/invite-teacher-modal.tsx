import { useState } from "react";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type TeacherStatus = "Available" | "Offline" | "In a Class";

interface Teacher {
    id: string;
    initials: string;
    avatarColor: string;
    name: string;
    subject: string;
    status: TeacherStatus;
}

const TEACHERS: Teacher[] = [
    {
        id: "1",
        initials: "CU",
        avatarColor: "bg-purple-700",
        name: "Mr Emeka Nwosu",
        subject: "Further Mathematics",
        status: "Available",
    },
    {
        id: "2",
        initials: "NK",
        avatarColor: "bg-blue-700",
        name: "Mrs. Aisha Umar",
        subject: "Biology",
        status: "Offline",
    },
    {
        id: "3",
        initials: "EB",
        avatarColor: "bg-green-700",
        name: "Mr Tunde Adeyemi",
        subject: "Chemistry",
        status: "In a Class",
    },
];

const statusDotColor: Record<TeacherStatus, string> = {
    Available: "bg-green-500",
    Offline: "bg-red-400",
    "In a Class": "bg-orange-400",
};

const StatusBadge = ({ status }: { status: TeacherStatus }) => {
    const config: Record<TeacherStatus, string> = {
        Available: "bg-green-50 text-green-600",
        Offline: "bg-red-50 text-red-500",
        "In a Class": "bg-orange-50 text-orange-500",
    };
    return (
        <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap", config[status])}>
            <span className={cn("w-1.5 h-1.5 rounded-full", statusDotColor[status])} />
            {status}
        </span>
    );
};

interface InviteTeacherModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit?: (data: { teacherId: string; question: string; subject: string }) => void;
}

const InviteTeacherModal = ({ open, onClose, onSubmit }: InviteTeacherModalProps) => {
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>("1");
    const [question, setQuestion] = useState("");
    const [subject, setSubject] = useState("Further Math - Sequence and series");

    const handleClose = () => {
        onClose();
    };

    const handleSend = () => {
        if (!selectedTeacherId) return;
        onSubmit?.({ teacherId: selectedTeacherId, question, subject });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-auto">
                <div className="font-geist">
                    {/* Header */}
                    <div className="flex items-start justify-between p-5 pb-4 border-b border-gray-100">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-base">
                                🛡️
                            </div>
                            <div>
                                <h2 className="text-[15px] font-semibold text-gray-900 leading-5">
                                    Invite Teacher to Group
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Ask a teacher to join and help solve your problem
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors shrink-0 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* Teacher select list */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Select Teachers</p>
                            <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
                                {TEACHERS.map((teacher) => (
                                    <div
                                        key={teacher.id}
                                        onClick={() => setSelectedTeacherId(teacher.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                                            selectedTeacherId === teacher.id
                                                ? "bg-amber-50"
                                                : "hover:bg-gray-50"
                                        )}
                                    >
                                        <div className="relative shrink-0">
                                            <div
                                                className={cn(
                                                    "w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs",
                                                    teacher.avatarColor
                                                )}
                                            >
                                                {teacher.initials}
                                            </div>
                                            <span
                                                className={cn(
                                                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white",
                                                    statusDotColor[teacher.status]
                                                )}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {teacher.name}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">{teacher.subject}</p>
                                        </div>
                                        <StatusBadge status={teacher.status} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Topic / Description */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-2 block">
                                TOPIC / DESCRIPTION
                            </label>
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Ask your Question........"
                                rows={3}
                                className="w-full rounded-xl bg-[#F6F6FA] border border-transparent px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                            />
                        </div>

                        {/* Subject / Topic */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-2 block">
                                SUBJECT/ TOPIC <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                            />
                        </div>

                        {/* Actions */}
                        <div className="space-y-2.5 pt-1">
                            <button
                                onClick={handleClose}
                                className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-medium text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={!selectedTeacherId || !subject.trim()}
                                className={cn(
                                    "w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer",
                                    !selectedTeacherId || !subject.trim()
                                        ? "bg-amber-300 text-white/70 cursor-not-allowed"
                                        : "bg-amber-600 text-white hover:bg-amber-700"
                                )}
                            >
                                <Send className="w-4 h-4" />
                                Send Invitation to Teacher
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteTeacherModal;