import type { Group } from "./StudyGroupsList";

// ── Compact row (sidebar preview) ─────────────────────────────────────────────
function GroupRow({ group }: { group: Group }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl cursor-pointer">
      <div className={`w-8 h-8 rounded-lg ${group.iconBg} flex items-center justify-center text-base flex-shrink-0`}>
        {group.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700 truncate">{group.name}</p>
        <p className="text-[10px] text-gray-400 truncate">{group.subject} · {group.teacher}</p>
      </div>
      {group.unread ? (
        <span className="w-5 h-5 rounded-full bg-[#4F61E8] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
          {group.unread}
        </span>
      ) : null}
    </div>
  );
}

export default GroupRow