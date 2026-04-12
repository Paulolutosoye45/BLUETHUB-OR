import { useState } from "react";
import { EllipsisVertical, X, Pencil } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const BRAND = "#292382";

/* ─── Subject data ──────────────────────────────────────────────────── */
interface SubjectItem {
  id: string;
  name: string;
}

const subjectList: SubjectItem[] = [
  { id: "mathematics",         name: "Mathematics"        },
  { id: "english",             name: "English"            },
  { id: "basic-science",       name: "Basic Science"      },
  { id: "basic-technology",    name: "Basic Technology"   },
  { id: "computer-science",    name: "Computer Science"   },
  { id: "agriculture-science", name: "Agriculture Science"},
  { id: "home-economics",      name: "Home Economics"     },
  { id: "creative-art",        name: "Creative Art"       },
  { id: "social-studies",      name: "Social Studies"     },
  { id: "civic-education",     name: "Civic Education"    },
];

/* Major: first 9 checked; Minor: id 4–10 checked */
const defaultMajorChecked = new Set([
  "mathematics","english","basic-science","basic-technology",
  "computer-science","agriculture-science","home-economics",
  "creative-art","social-studies","civic-education",
]);
const defaultMinorChecked = new Set([
  "basic-technology","computer-science","agriculture-science",
  "home-economics","creative-art","social-studies","civic-education",
]);

/* ─── Tab type ──────────────────────────────────────────────────────── */
type Tab = "General Info" | "Subjects";

/* ─── EditClassDialog ───────────────────────────────────────────────── */
interface EditClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditClassDialog: React.FC<EditClassDialogProps> = ({ open, onOpenChange }) => {
  const [tab, setTab]             = useState<Tab>("General Info");
  const [className, setClassName] = useState("Jss1");
  const [teacher, setTeacher]     = useState("Dr Roy Akinwale");
  const [majorChecked, setMajorChecked] = useState<Set<string>>(new Set(defaultMajorChecked));
  const [minorChecked, setMinorChecked] = useState<Set<string>>(new Set(defaultMinorChecked));

  const toggleMajor = (id: string) => {
    setMajorChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleMinor = (id: string) => {
    setMinorChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-w-sm w-full"
        style={{ fontFamily: "inherit" }}
      >
        {/* ── Modal Header ──────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: BRAND }}
        >
          <div className="flex items-center gap-2.5">
            {/* Pencil icon box */}
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Pencil size={14} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Edit JSS 1A</p>
              <p className="text-white/60 text-[10px] leading-tight">
                Greenfield · Academic Management
              </p>
            </div>
          </div>
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-white" />
          </button>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <div className="flex border-b border-gray-200 bg-white">
          {(["General Info", "Subjects"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 text-xs font-semibold border-b-2 transition-all"
              style={{
                borderColor: tab === t ? BRAND : "transparent",
                color: tab === t ? BRAND : "#9ca3af",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab Content ───────────────────────────────────────── */}
        <div className="bg-white">

          {/* ══ GENERAL INFO TAB ══════════════════════════════════ */}
          {tab === "General Info" && (
            <div className="px-5 py-4 flex flex-col gap-4">

              {/* Currently editing chip + Secondary Level */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* JS avatar */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{ backgroundColor: BRAND }}
                  >
                    JS
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 leading-none">currently Editing</p>
                    <p className="text-xs font-bold" style={{ color: BRAND }}>JSS1</p>
                  </div>
                </div>
                {/* Secondary Level badge */}
                <Badge
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full border-0"
                  style={{ backgroundColor: `${BRAND}15`, color: BRAND }}
                >
                  Secondary Level
                </Badge>
              </div>

              {/* Divider */}
              <hr className="border-gray-100" />

              {/* Enter Class * */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Enter Class *
                </label>
                <div className="relative">
                  <Input
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                    placeholder="Jss1"
                    className="text-xs pr-8 rounded-xl border-gray-200 focus-visible:ring-1"
                    style={{ "--tw-ring-color": `${BRAND}50` } as React.CSSProperties}
                  />
                  {className && (
                    <button
                      onClick={() => setClassName("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Edit the name and it will update everywhere it's used
                </p>
              </div>

              {/* Subject Teacher's Name* */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Subject Teacher's Name*
                </label>
                <div className="relative">
                  <Input
                    value={teacher}
                    onChange={e => setTeacher(e.target.value)}
                    placeholder="Dr Roy Akinwale"
                    className="text-xs pr-8 rounded-xl border-gray-200 focus-visible:ring-1"
                    style={{ "--tw-ring-color": `${BRAND}50` } as React.CSSProperties}
                  />
                  {teacher && (
                    <button
                      onClick={() => setTeacher("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  enter assigned subject Teacher name
                </p>
              </div>
            </div>
          )}

          {/* ══ SUBJECTS TAB ══════════════════════════════════════ */}
          {tab === "Subjects" && (
            <div className="px-5 py-4">
              <div className="grid grid-cols-2 gap-5">

                {/* Major Course */}
                <div>
                  <p className="text-xs font-bold text-gray-800 mb-3">Major course</p>
                  <div className="flex flex-col gap-2.5">
                    {subjectList.map(s => (
                      <div key={s.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`major-${s.id}`}
                          checked={majorChecked.has(s.id)}
                          onCheckedChange={() => toggleMajor(s.id)}
                          className="rounded data-[state=checked]:bg-[#292382] data-[state=checked]:border-[#292382] w-3.5 h-3.5"
                        />
                        <label
                          htmlFor={`major-${s.id}`}
                          className="text-xs cursor-pointer leading-none"
                          style={{ color: majorChecked.has(s.id) ? "#1f2937" : "#6b7280" }}
                        >
                          {s.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minor Course */}
                <div>
                  <p className="text-xs font-bold text-gray-800 mb-3">Minor Course</p>
                  <div className="flex flex-col gap-2.5">
                    {subjectList.map(s => (
                      <div key={s.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`minor-${s.id}`}
                          checked={minorChecked.has(s.id)}
                          onCheckedChange={() => toggleMinor(s.id)}
                          className="rounded data-[state=checked]:bg-[#292382] data-[state=checked]:border-[#292382] w-3.5 h-3.5"
                        />
                        <label
                          htmlFor={`minor-${s.id}`}
                          className="text-xs cursor-pointer leading-none"
                          style={{ color: minorChecked.has(s.id) ? "#1f2937" : "#6b7280" }}
                        >
                          {s.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Footer ──────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-2.5 px-5 pb-5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 px-4"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs rounded-xl px-4 text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: BRAND }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Demo wrapper (trigger button) ────────────────────────────────── */
const EditClassDialogDemo: React.FC = () => {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#ecedf8" }}
    >
      <Button
        onClick={() => setOpen(true)}
        className="text-white text-sm font-semibold rounded-xl px-5 py-2.5"
        style={{ backgroundColor: BRAND }}
      >
        Open Edit Class Dialog
      </Button>

      <EditClassDialog open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default EditClassDialogDemo;