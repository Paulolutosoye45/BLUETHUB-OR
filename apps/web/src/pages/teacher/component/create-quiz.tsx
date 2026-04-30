import TitleBar from "@/shared/title-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Label,
  Input,
  Textarea,
} from "@bluethub/ui-kit";
import { Check, ChevronDown, PencilLine, PenTool, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// ── Types ──────────────────────────────────────────────────────────────────
type QuestionType = "Multiple Choice" | "True/False" | "Short Answer" | "Essay";

interface Option {
  key: string;
  value: string;
}

// ── Constants ─────────────────────────────────────────────────────────────
const QUESTION_TYPES: QuestionType[] = [
  "Multiple Choice",
  "True/False",
  "Short Answer",
  "Essay",
];

const DEFAULT_OPTIONS: Option[] = [
  { key: "A", value: "Tissue" },
  { key: "B", value: "Organ" },
  { key: "C", value: "Cell" },
  { key: "D", value: "Organism" },
];

const CORRECT_ANSWER_OPTIONS = ["A", "B", "C", "D"];

// ── Sub-components ─────────────────────────────────────────────────────────

const SelectDropdown = ({
  value,
  options,
  placeholder,
  onSelect,
  width = "w-44",
}: {
  value: string | undefined;
  options: string[];
  placeholder: string;
  onSelect: (v: string) => void;
  width?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`${width} font-poppins justify-between font-Poppins text-sm font-medium py-5 px-4 rounded-[6px] border border-black/20 hover:border-chestnut transition-all duration-200 ${value ? "text-chestnut" : "text-[#9A9A9A]"
            }`}
        >
          <span className="font-Poppins text-sm font-medium">
            {value || placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""
              }`}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] rounded-[6px] border border-black/10 shadow-lg bg-white/95 backdrop-blur-sm p-1.5"
        align="start"
        sideOffset={6}
      >
        <DropdownMenuGroup className="space-y-0.5">
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt}
              className={`font-Poppins text-sm font-medium py-2.5 px-3.5 rounded-md cursor-pointer transition-all duration-150 ${value === opt
                ? "bg-indigo-50 text-indigo-500"
                : "text-slate-600 hover:bg-indigo-500 focus:bg-slate-50"
                }`}
              onClick={() => onSelect(opt)}
            >
              <div className="flex items-center justify-between w-full">
                <span>{opt}</span>
                {value === opt && (
                  <Check className="w-3.5 h-3.5 ml-2 text-emerald-600" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const CreateQuizQuestion = () => {
  const [questionType, setQuestionType] = useState<QuestionType>("Multiple Choice");
  const [question, setQuestion] = useState("What is the basic unit of life?");
  const [options, setOptions] = useState<Option[]>(DEFAULT_OPTIONS);
  const [correctAnswer, setCorrectAnswer] = useState<string | undefined>("B");
  const [quizType, setQuizType] = useState<"questions" | "board">('questions')

  const updateOption = (key: string, val: string) => {
    setOptions((prev) =>
      prev.map((o) => (o.key === key ? { ...o, value: val } : o))
    );
  };

  const addOption = () => {
    const keys = ["A", "B", "C", "D", "E", "F"];
    const next = keys[options.length];
    if (!next) return;
    setOptions((prev) => [...prev, { key: next, value: "" }]);
  };

  const removeOption = (key: string) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((o) => o.key !== key));
    if (correctAnswer === key) setCorrectAnswer(undefined);
  };

  const showOptions = questionType === "Multiple Choice";
  const showTrueFalse = questionType === "True/False";

  return (
    <div className="p-6 font-poppins">
      <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">
        <TitleBar title="question" hasVertical hasBackIcons />
        <div className="flex-1 p-8 bg-white/70 backdrop-blur-sm">

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h1 className="text-chestnut font-bold " style={{ fontSize: 26, margin: 0, letterSpacing: -0.3 }}>
              Biology:  Cells
              </h1>
              <p style={{ fontSize: 13.5, color: "#7B7FA8", margin: "5px 0 0", fontWeight: 400 }}>
                Upload Question to Teacher's portal
              </p>
            </div>
            <Link to='questionlist' style={{
              background: "#E8302C",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "11px 22px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(232,48,44,0.28)",
              letterSpacing: 0.2,
              transition: "transform 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              View Past Question
            </Link>
          </div>

          <div className="bg-[#29238280] p-px w-full" />
          {quizType === 'questions' ? (<div className="border border-[#29238280] drop-shadow-[#2923821A] rounded-2xl px-7 mt-4">
            {/* ── Card Header ── */}
            <div className="flex items-center justify-between px-6 pt-7 pb-4 border-b border-[#D9D9D9]">
              <h2 className="font-semibold text-chestnut text-xl tracking-tight">
                Create Quiz Questions
              </h2>
              <Button onClick={() => setQuizType('board')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold px-4 py-2.5 rounded-[8px] transition-all duration-200 shadow-sm shadow-emerald-200 cursor-pointer">
                <PenTool size={14} className="text-white" />
                Use Board
              </Button>
            </div>

            {/* ── Card Body ── */}
            <div className="flex flex-col gap-6 pb-7">

              {/* Question Type */}
              <div className="flex items-center gap-4 pt-5.25">
                <Label className="font-poppins font-medium text-[15px] text-chestnut whitespace-nowrap w-28 shrink-0">
                  Question Type :
                </Label>
                <SelectDropdown
                  value={questionType}
                  options={QUESTION_TYPES}
                  placeholder="Select type"
                  onSelect={(v) => {
                    setQuestionType(v as QuestionType);
                    setCorrectAnswer(undefined);
                  }}
                  width="w-52"
                />
              </div>

              {/* Question */}
              <div className="flex flex-col gap-2">
                <Label className="font-Poppins text-sm font-medium text-chestnut">
                  Question:
                </Label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  rows={4}
                  className="w-full h-25.5 px-4 py-3.5 text-sm text-slate-700 font-medium placeholder:text-slate-300 bg-white border border-black/15 rounded-xl resize-none outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all duration-200 font-Poppins"
                />
              </div>

              {/* Multiple Choice Options */}
              {showOptions && (
                <div className="flex flex-col gap-3">
                  {options.map((opt) => (
                    <div key={opt.key} className="flex items-center gap-3">
                      <Label className="font-Poppins text-sm font-medium text-chestnut w-20 shrink-0">
                        Option {opt.key}:
                      </Label>
                      <div className="flex-1 relative group">
                        <Input
                          value={opt.value}
                          onChange={(e) => updateOption(opt.key, e.target.value)}
                          placeholder={`Enter option ${opt.key}`}
                          className="w-full px-4 py-5 text-sm text-student-chestnut font-medium placeholder:text-slate-300 border border-black/15 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all duration-200 font-Poppins pr-10"
                        />
                        {options.length > 2 && (
                          <button
                            onClick={() => removeOption(opt.key)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-400 transition-all duration-150 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Option */}
                  {options.length < 6 && (
                    <button
                      onClick={addOption}
                      className="self-start flex items-center gap-1.5 text-[12px] font-semibold text-student-chestnut mt-1 transition-colors cursor-pointer"
                    >
                      <Plus size={13} />
                      Add option
                    </button>
                  )}
                </div>
              )}

              {/* True / False Options */}
              {showTrueFalse && (
                <div className="flex items-center gap-4">
                  {["True", "False"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setCorrectAnswer(opt)}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 cursor-pointer ${correctAnswer === opt
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}



              {/* Correct Answer */}
              <div className="flex items-center gap-4">
                <Label className="font-Poppins text-sm font-medium text-slate-600 whitespace-nowrap w-28 shrink-0">
                  Correct Answer:
                </Label>

                {showTrueFalse ? (
                  <span className="text-sm font-semibold text-emerald-600">
                    {correctAnswer || "—"}
                  </span>
                ) : (
                  <SelectDropdown
                    value={correctAnswer}
                    options={CORRECT_ANSWER_OPTIONS.slice(0, options.length)}
                    placeholder="Select"
                    onSelect={setCorrectAnswer}
                    width="w-24"
                  />
                )}
              </div>

              <div>
                        
                <div className="bg-[#D9D9D9] p-px w-full" />
                   <div className="flex justify-end items-center gap-6 my-7">
                        <Button className="rounded-[5px] cursor-pointer p-6 bg-linear-to-r from-[#FFFFFF] to-[#E7EAFF] border border-chestnut drop-shadow-[#C3C7EB]">
                          <Plus className="size-6 text-chestnut" />
                            <span className="text-chestnut font-semibold text-[15px]">Add Another Question </span>
                        </Button>
                        <Button className=" p-6 rounded-[5px] cursor-pointer bg-linear-to-r from-chestnut to-chestnut drop-shadow-[#C3C7EB]">
                        <span className="text-white font-semibold text-[15px]" >Publish Question </span>
                        </Button>
                   </div>
              </div>
            </div>
          </div>
          ) : (
          <div className="border border-[#29238280] drop-shadow-[#2923821A] rounded-2xl px-7 mt-4">
            {/* ── Card Header ── */}
            <div className="flex items-center justify-between px-6 pt-7 pb-4 border-b border-[#D9D9D9]">
              <h2 className="font-semibold text-chestnut text-xl tracking-tight">
                Create Quiz Questions
              </h2>
              <Button onClick={() => setQuizType('questions')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold px-4 py-2.5 rounded-[8px] transition-all duration-200 shadow-sm shadow-emerald-200 cursor-pointer">
                <PencilLine size={14} className="text-white" />
                Type Your Question 
              </Button>
            </div>

            <div className="h-153 rounded-[8px] mt-4 mb-9 border border-red-900">

            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateQuizQuestion;