import { Link } from "react-router-dom";
import MemberAvatars from "./member-avatars";
import StatusBadge from "./status-badge";
import type { Group } from "./StudyGroupsList";

function GroupCard({ group }: { group: Group }) {
  return (
    <Link to={encodeURIComponent(group.name)} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${group.iconBg} flex items-center justify-center text-xl flex-shrink-0`}>
          {group.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-gray-800 truncate">{group.name}</p>
            {group.unread ? (
              <span className="w-5 h-5 rounded-full bg-[#4F61E8] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {group.unread}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-gray-400">
            {group.subject}{group.teacher ? ` · ${group.teacher}` : ""}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed mb-3">{group.description}</p>

      {/* Members + footer */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <MemberAvatars members={group.members} total={group.memberCount} />
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${group.tagColor}`}>
            {group.tag}
          </span>
          <StatusBadge status={group.status} />
        </div>
      </div>

      {/* Last activity */}
      {group.lastActivity && (
        <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
          <span>💬</span> {group.lastActivity}
        </p>
      )}
    </Link>
  );
}

export default GroupCard