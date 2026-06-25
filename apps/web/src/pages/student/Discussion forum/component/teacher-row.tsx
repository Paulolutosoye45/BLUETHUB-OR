import StatusBadge from "./status-badge";
import type { Teacher } from "./StudyGroupsList";

function TeacherRow({ teacher }: { teacher: Teacher }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className={`w-8 h-8 rounded-full ${teacher.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
        {teacher.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700 truncate">{teacher.name}</p>
        <p className="text-[10px] text-gray-400 truncate">{teacher.subject}</p>
      </div>
      <StatusBadge status={teacher.status} />
    </div>
  );
}

export default TeacherRow