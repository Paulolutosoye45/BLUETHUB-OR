
import { useState } from "react";
import TeacherRow from "./teacher-row";
import GroupRow from "./group-row";
import CreateForumCard from "./create-forum-card";
import GroupCard from "./group-card";

// ── Types ─────────────────────────────────────────────────────────────────────
export type GroupStatus = "Active" | "In Class" | "Idle";
export type TeacherStatus = "Available" | "In Class";
export type TabType = "My Groups" | "Discover Forums" | "Teacher Sessions";

export interface GroupMember {
  id: string;
  color: string;
  initials: string;
}

export interface Group {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  icon: string;
  iconBg: string;
  description: string;
  members: GroupMember[];
  memberCount: number;
  tag: string;
  tagColor: string;
  status: GroupStatus;
  lastActivity: string;
  unread?: number;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  initials: string;
  color: string;
  status: TeacherStatus;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
export const MY_GROUPS: Group[] = [
  {
    id: "g1",
    name: "Maths Olympiad Prep",
    subject: "Further Mathematics",
    teacher: "Mr. Fasikay",
    icon: "📐",
    iconBg: "bg-blue-100",
    description:
      "Working through past competition problems, integration techniques and proofs. Focus: differentiation, sequences & series.",
    members: [
      { id: "m1", color: "bg-green-400", initials: "A" },
      { id: "m2", color: "bg-blue-400", initials: "B" },
      { id: "m3", color: "bg-purple-400", initials: "C" },
      { id: "m4", color: "bg-yellow-400", initials: "D" },
      { id: "m5", color: "bg-red-400", initials: "E" },
    ],
    memberCount: 5,
    tag: "Maths",
    tagColor: "bg-blue-100 text-blue-600",
    status: "Active",
    lastActivity: "Vi Chat: 'Can someone check my working for Q7?'",
    unread: 3,
  },
  {
    id: "g2",
    name: "Bio Practicals Study",
    subject: "Biology",
    teacher: "Mrs. Umar",
    icon: "🔬",
    iconBg: "bg-green-100",
    description:
      "Preparing for the biology practical exam. We share lab notes, diagrams, and quiz each other on cell structure and genetics.",
    members: [
      { id: "m1", color: "bg-orange-400", initials: "S" },
      { id: "m2", color: "bg-teal-400", initials: "K" },
      { id: "m3", color: "bg-pink-400", initials: "T" },
      { id: "m4", color: "bg-indigo-400", initials: "U" },
    ],
    memberCount: 4,
    tag: "Biology",
    tagColor: "bg-green-100 text-green-700",
    status: "Idle",
    lastActivity: "Sade shared a diagram",
    unread: 1,
  },
  {
    id: "g3",
    name: "WAEC 2026 Prep",
    subject: "All Subjects · General Group",
    teacher: "",
    icon: "📚",
    iconBg: "bg-yellow-100",
    description:
      "General WAEC prep group for SS2 Science students. We share past questions, notes, and hold timed mock sessions every Saturday.",
    members: [
      { id: "m1", color: "bg-red-400", initials: "A" },
      { id: "m2", color: "bg-blue-400", initials: "N" },
      { id: "m3", color: "bg-green-400", initials: "K" },
    ],
    memberCount: 8,
    tag: "WAEC Focus",
    tagColor: "bg-orange-100 text-orange-600",
    status: "Active",
    lastActivity: "Kunle: 'Saturday sessions at 10am'",
    unread: 0,
  },
];

export const TEACHERS: Teacher[] = [
  { id: "t1", name: "Mr. Emeka Nwosu", subject: "Further Mathematics", initials: "EN", color: "bg-indigo-500", status: "Available" },
  { id: "t2", name: "Mrs. Aisha Umar", subject: "Biology", initials: "AU", color: "bg-orange-400", status: "Available" },
  { id: "t3", name: "Mr. Tunde Adeyemi", subject: "Chemistry", initials: "TA", color: "bg-teal-500", status: "In Class" },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS: TabType[] = ["My Groups", "Discover Forums", "Teacher Sessions"];

// ── Root ──────────────────────────────────────────────────────────────────────
function StudyGroupsList({ onCreateForum }: { onCreateForum?: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>("My Groups");

  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden">
      {/* Compact preview list */}
      <div className="bg-white border-b border-gray-100 px-2 py-2">
        {MY_GROUPS.map((g) => <GroupRow key={g.id} group={g} />)}
      </div>

      {/* Teachers Online */}
      <div className="bg-white border-b border-gray-100 px-2 py-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">Teachers Online</p>
        {TEACHERS.map((t) => <TeacherRow key={t.id} teacher={t} />)}
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center gap-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === tab
                ? "bg-[#4F61E8] text-white"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab}
            {tab === "My Groups" && (
              <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${activeTab === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {MY_GROUPS.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-3 flex flex-col gap-3">
        {activeTab === "My Groups" && (
          <>
            {MY_GROUPS.map((g) => <GroupCard key={g.id} group={g} />)}
            <CreateForumCard onClick={onCreateForum} />
          </>
        )}
        {activeTab === "Discover Forums" && (
          <div className="text-center text-sm text-gray-400 py-10">
            Discover public forums coming soon
          </div>
        )}
        {activeTab === "Teacher Sessions" && (
          <div className="text-center text-sm text-gray-400 py-10">
            Scheduled teacher sessions coming soon
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyGroupsList;