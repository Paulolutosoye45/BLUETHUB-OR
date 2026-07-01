import type { ProblemStatus } from "./group-detail-panel";

export const ProblemBadge = ({ status }: { status: ProblemStatus }) => (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status === "Solved" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-600"
        }`}>{status}</span>
);