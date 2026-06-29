import type { TeacherStatus } from "./group-detail-panel";

export const TeacherStatusBadge = ({ status }: { status: TeacherStatus }) => (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status === "Available" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"
        }`}>{status}</span>
);