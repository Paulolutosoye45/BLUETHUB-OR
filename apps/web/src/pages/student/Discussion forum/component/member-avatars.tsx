import type { GroupMember } from "./StudyGroupsList";

const MemberAvatars = ({ members, total }: { members: GroupMember[]; total: number }) => (
  <div className="flex items-center gap-1">
    <div className="flex -space-x-2">
      {members.slice(0, 4).map((m) => (
        <div
          key={m.id}
          className={`w-7 h-7 rounded-full ${m.color} flex items-center justify-center text-white text-[10px] font-bold border-2 border-white`}
        >
          {m.initials}
        </div>
      ))}
    </div>
    <span className="text-xs text-gray-400 ml-1">{total} members</span>
  </div>
);

export default MemberAvatars