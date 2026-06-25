import type { GroupStatus, TeacherStatus } from "./StudyGroupsList";

const StatusBadge = ({ status }: { status: GroupStatus | TeacherStatus }) => {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    "In Class": "bg-orange-100 text-orange-600",
    Available: "bg-green-100 text-green-700",
    Idle: "bg-gray-100 text-gray-400",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge