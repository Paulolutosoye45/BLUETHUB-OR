import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Label,
} from "@bluethub/ui-kit";
import { Brain, Check, ChevronDown, ClipboardList } from "lucide-react";
import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface SubjectOption {
  label: string;
  value: string;
}

interface Topic {
  name: string;
  subtopics: string[];
}

// ── Constants ──────────────────────────────────────────────────────────────
const SUBJECT_OPTIONS: SubjectOption[] = [
  { label: "Mathematics", value: "mathematics" },
  { label: "English", value: "english" },
  { label: "Physics", value: "physics" },
  { label: "Chemistry", value: "chemistry" },
  { label: "Biology", value: "biology" },
  { label: "Computer Science", value: "computer_science" },
];

const TOPIC_DATA: Record<string, Topic[]> = {
  Biology: [
    {
      name: "Cell: definition to Cell and its function",
      subtopics: [
        "Cell: Living unit- structure",
        "Cell Properties and Functions",
        "Cell Properties and Functions II",
      ],
    },
    { name: "Evolution/ Adaptation For Survival", subtopics: [] },
    { name: "Excretory System and mechanisms", subtopics: [] },
    { name: "Feeding Mechanisms / Digestive System", subtopics: [] },
    { name: "Gaseous State", subtopics: [] },
    { name: "Excretory System and mechanisms II", subtopics: [] },
    { name: "Feeding Mechanisms / Digestive System II", subtopics: [] },
    { name: "Blood Tissue", subtopics: [] },
  ],
  Mathematics: [
    {
      name: "Algebra & Equations",
      subtopics: ["Linear Equations", "Quadratic Equations", "Polynomials"],
    },
    { name: "Geometry & Shapes", subtopics: [] },
    { name: "Calculus Fundamentals", subtopics: [] },
    { name: "Statistics & Probability", subtopics: [] },
  ],
  Physics: [
    {
      name: "Mechanics & Motion",
      subtopics: ["Newton's Laws", "Kinematics", "Dynamics"],
    },
    { name: "Thermodynamics", subtopics: [] },
    { name: "Electromagnetism", subtopics: [] },
    { name: "Waves & Optics", subtopics: [] },
  ],
  Chemistry: [
    {
      name: "Atomic Structure",
      subtopics: ["Electron Configuration", "Periodic Trends"],
    },
    { name: "Chemical Bonding", subtopics: [] },
    { name: "Organic Chemistry", subtopics: [] },
  ],
  English: [
    {
      name: "Grammar & Syntax",
      subtopics: ["Parts of Speech", "Sentence Structure"],
    },
    { name: "Literature & Prose", subtopics: [] },
    { name: "Writing & Composition", subtopics: [] },
  ],
  "Computer Science": [
    {
      name: "Data Structures",
      subtopics: ["Arrays", "Linked Lists", "Trees"],
    },
    { name: "Algorithms", subtopics: [] },
    { name: "Object-Oriented Programming", subtopics: [] },
  ],
};

// ── Component ──────────────────────────────────────────────────────────────
const AssessmentSelectSubject = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<string | undefined>();
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();

  const topics: Topic[] = value ? (TOPIC_DATA[value] ?? []) : [];
  const currentTopic = topics.find((t) => t.name === selectedTopic);
  const subtopics = currentTopic?.subtopics ?? [];

  const handleSubjectSelect = (label: string) => {
    setValue(label);
    setSelectedTopic(TOPIC_DATA[label]?.[0]?.name);
  };

  return (
    <div className="min-h-screen font-poppins">
      {/* ── Main Card ── */}
      <div className="flex bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-150">

        {/* ── Left Panel ── */}
        <div className="w-[40%] shrink-0 flex flex-col gap-6 p-7 bg-slate-50/70 border-r border-slate-100">

          {/* Subject Selector — uses your existing component structure */}
          <div className="pt-2 pb-6 border border-black/10 rounded-[10px] px-4">
            <Label className="font-Poppins font-medium text-sm text-slate-700 mb-4 block">
              Select Subject
            </Label>

            <DropdownMenu onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`relative w-full justify-between font-Poppins text-sm font-medium transition-all duration-300 py-5 px-4 rounded-[6px] border border-black/30 ${
                    value ? "text-slate-800" : "text-[#9A9A9A]"
                  }`}
                >
                  <span className="capitalize font-Poppins text-sm font-medium">
                    {value || "Select Subject"}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-indigo-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] rounded-[6px] border border-black/10 shadow-md bg-white/95 backdrop-blur-sm p-2"
                align="start"
                sideOffset={8}
              >
                <DropdownMenuGroup className="space-y-1">
                  {SUBJECT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      className={`font-Poppins w-70   text-sm font-medium py-3 px-4 rounded-md cursor-pointer transition-all duration-200 ${
                        value === option.label
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-700 hover:bg-slate-50 focus:bg-slate-50"
                      }`}
                      onClick={() => handleSubjectSelect(option.label)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        {value === option.label && (
                          <Check className="w-4 h-4 ml-2 text-indigo-500" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Topic List */}
          {value && topics.length > 0 && (
            <div className="flex flex-col gap-2 flex-1 overflow-hidden">
              <Label className="font-Poppins font-medium text-sm text-slate-700 block">
                Select Topic
              </Label>
              <div className="flex flex-col gap-0.5 overflow-y-auto max-h-105 [&::-webkit-scrollbar]:w-0.75 [&::-webkit-scrollbar-thumb]:bg-indigo-100 [&::-webkit-scrollbar-thumb]:rounded-full">
                {topics.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTopic(t.name)}
                    className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-[13px] text-left leading-snug transition-all cursor-pointer border-none outline-none font-Poppins ${
                      selectedTopic === t.name
                        ? "bg-indigo-50 text-indigo-600 font-semibold"
                        : "text-slate-500 font-medium hover:bg-indigo-50/50 hover:text-indigo-500"
                    }`}
                  >
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                        selectedTopic === t.name
                          ? "bg-indigo-500"
                          : "bg-transparent"
                      }`}
                    />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state — no subject selected */}
          {!value && (
            <div className="flex-1 flex mt-40 justify-center">
              <p className="font-medium text-base text-center font-Poppins">
                Select a subject to<br />view topics
              </p>
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        <div className="flex-1 flex flex-col gap-5 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList size={15} className="text-indigo-400" />
              <span className="text-[15px] font-semibold text-slate-900 tracking-tight font-Poppins">
                Sub-Topic
              </span>
            </div>
            <span className="text-[13px] text-slate-400 font-medium font-Poppins">
              Total Questions:{" "}
              <span className="text-indigo-500 font-semibold">0</span>
            </span>
          </div>

          {/* Subtopic Rows */}
          <div className="flex flex-col gap-2.5">
            {!value ? (
              /* No subject selected */
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="text-4xl opacity-20 select-none"><Brain className="text-chestnut size-20" /></span>
                <p className="text-sm text-slate-300 font-medium text-center font-Poppins">
                  Select a subject and topic<br />to see sub-topics
                </p>
              </div>
            ) : subtopics.length === 0 ? (
              /* Topic has no subtopics */
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="text-4xl opacity-20 select-none">📂</span>
                <p className="text-sm text-slate-300 font-medium text-center font-Poppins">
                  No sub-topics available for this topic yet.
                </p>
              </div>
            ) : (
              /* Subtopic rows */
              subtopics.map((sub, i) => (
                <div
                  key={i}
                  className="group flex items-center justify-between px-5 py-4  rounded-xl border border-[#29238280] hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                      <span className="text-[11px] font-bold text-indigo-200 tabular-nums  tracking-wide group-hover:text-indigo-300 transition-colors font-Poppins">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[13.5px] font-medium text-slate-700 font-Poppins">
                      {sub}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-100 shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-Poppins">
                      No Question Yet
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSelectSubject;