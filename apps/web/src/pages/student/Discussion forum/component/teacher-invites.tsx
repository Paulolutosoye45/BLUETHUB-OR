import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Status = "Available" | "In Class";

interface Teacher {
    id: string;
    initials: string;
    avatarColor: string;
    name: string;
    subject: string;
    status: Status;
}

const TEACHERS: Teacher[] = [
    {
        id: "1",
        initials: "EU",
        avatarColor: "bg-blue-700",
        name: "Mr. Emeka Nwosu",
        subject: "Further Mathematics",
        status: "Available",
    },
    {
        id: "2",
        initials: "Au",
        avatarColor: "bg-orange-800",
        name: "Mrs. Aisha Umar",
        subject: "Biology",
        status: "Available",
    },
    {
        id: "3",
        initials: "TA",
        avatarColor: "bg-green-700",
        name: "Mr. Tunde AdeYemi",
        subject: "Chemistry",
        status: "In Class",
    },
];

const StatusBadge = ({ status }: { status: Status }) => {
    const config: Record<Status, string> = {
        Available: "bg-green-50 text-green-600",
        "In Class": "bg-orange-50 text-orange-500",
    };
    return (
        <span className={cn("px-3 py-1 rounded-full text-xs font-medium", config[status])}>
            {status}
        </span>
    );
};

function TeacherInvites({ setSelectedIdx }: { setSelectedIdx: (id: string | null) => void }) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        setSelectedIdx(selectedId)
    }, [selectedId, setSelectedIdx])

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {TEACHERS.map((teacher) => (
                <div
                    key={teacher.id}
                    onClick={() => setSelectedId(teacher.id)}
                    className={cn(
                        "flex flex-col items-center text-center bg-[#F5F5FB] rounded-2xl border-2 p-6 cursor-pointer transition-colors",
                        selectedId === teacher.id
                            ? "border-[#A00000]"
                            : "border-transparent hover:border-gray-200"
                    )}
                >
                    <div
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm mb-3",
                            teacher.avatarColor
                        )}
                    >
                        {teacher.initials}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{teacher.name}</p>
                    <p className="text-xs text-gray-400 mb-3">{teacher.subject}</p>
                    <StatusBadge status={teacher.status} />
                </div>
            ))}
        </div>
    );
}

export default TeacherInvites;