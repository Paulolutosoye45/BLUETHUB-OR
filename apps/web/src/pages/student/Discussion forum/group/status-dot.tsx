import type { MemberStatus } from "./group-detail-panel";

export const StatusDot = ({ status }: { status: MemberStatus }) => {
    const c = status === "Online" ? "bg-green-400" : status === "Away" ? "bg-yellow-400" : "bg-gray-300";
    return <span className={`w-2 h-2 rounded-full ${c} flex-shrink-0`} />;
};