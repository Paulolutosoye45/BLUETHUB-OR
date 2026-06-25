import { Plus } from "lucide-react";

// ── Create Forum CTA ──────────────────────────────────────────────────────────
function CreateForumCard({ onClick }: { onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center py-10 cursor-pointer hover:border-[#4F61E8] hover:bg-indigo-50/30 transition-all"
    >
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Plus size={22} className="text-gray-400" />
      </div>
      <p className="text-sm font-bold text-gray-600">Create New Forum</p>
      <p className="text-xs text-gray-400 mt-1">Pick a topic, invite your classmates and start discussing</p>
    </div>
  );
}

export default CreateForumCard