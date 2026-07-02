import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Button,
  Label,
} from "@bluethub/ui-kit";
import {
  ArrowLeft,
  Check,
  Clock,
  Eye,
  Hash,
  Menu,
  RotateCcw,
  Save,
  Settings2,
  SlidersHorizontal,
  Star,
  Trophy,
  Weight,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// Config Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface AssessmentConfig {
  passMarkPercent: number;
  defaultTimeLimitMinutes: number;
  defaultMarksAllocation: number;
  defaultDifficultyLevel: number;
  questionsPerQuiz: number;
  allowRetakes: boolean;
  randomizeQuestions: boolean;
  showResultsImmediately: boolean;
  maxRetakes: number;
}

const STORAGE_KEY = "bluethub-assessment-config";

const DEFAULT_CONFIG: AssessmentConfig = {
  passMarkPercent: 50,
  defaultTimeLimitMinutes: 30,
  defaultMarksAllocation: 1,
  defaultDifficultyLevel: 1,
  questionsPerQuiz: 10,
  allowRetakes: true,
  randomizeQuestions: false,
  showResultsImmediately: true,
  maxRetakes: 3,
};

export const loadAssessmentConfig = (): AssessmentConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<AssessmentConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const saveAssessmentConfig = (config: AssessmentConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

// ═══════════════════════════════════════════════════════════════════════════════
// UI Helpers
// ═══════════════════════════════════════════════════════════════════════════════

const DIFFICULTY_META = [
  { label: "Easy", fill: "#10b981", color: "text-emerald-500" },
  { label: "Medium", fill: "#fbbf24", color: "text-amber-400" },
  { label: "Hard", fill: "#f97316", color: "text-orange-500" },
  { label: "Expert", fill: "#ef4444", color: "text-red-500" },
];

const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (level: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const meta = active ? DIFFICULTY_META[active - 1] : null;

  return (
    <div className="flex items-center gap-4">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4].map((level) => {
          const lit = level <= active;
          const m = DIFFICULTY_META[level - 1];
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              onMouseEnter={() => setHovered(level)}
              title={m.label}
              className="cursor-pointer transition-transform duration-100 hover:scale-110 active:scale-95 p-0.5"
            >
              <Star
                size={28}
                strokeWidth={1.5}
                fill={lit ? m.fill : "none"}
                color={lit ? m.fill : "#cbd5e1"}
              />
            </button>
          );
        })}
      </div>
      {meta && (
        <span
          className="text-sm font-semibold px-3 py-1 rounded-full"
          style={{ color: meta.fill, backgroundColor: `${meta.fill}18` }}
        >
          {meta.label}
        </span>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Number Input Component
// ═══════════════════════════════════════════════════════════════════════════════

const ConfigNumberInput = ({
  label,
  icon,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (val: number) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium text-chestnut flex items-center gap-1.5">
        {icon}
        {label}
      </Label>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
          className="w-24 px-3 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-all text-center"
        />
        {unit && (
          <span className="text-sm text-slate-500 font-medium">{unit}</span>
        )}
        {/* Quick buttons */}
        <div className="flex items-center gap-1 ml-auto">
          {[min, Math.floor((min + max) / 2), max].filter((v, i, a) => a.indexOf(v) === i).map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                value === preset
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Toggle Switch Component (inline, since Switch isn't in ui-kit)
// ═══════════════════════════════════════════════════════════════════════════════

const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? "bg-indigo-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Toggle Row Component
// ═══════════════════════════════════════════════════════════════════════════════

const ConfigToggle = ({
  label,
  description,
  icon,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (val: boolean) => void;
}) => {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-0.5 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          <div className="text-indigo-500">{icon}</div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

const AssessmentConfigPage = () => {
  const navigate = useNavigate();
  const { openMobileNav } = useOutletContext<{ openMobileNav: () => void }>();

  const [config, setConfig] = useState<AssessmentConfig>(loadAssessmentConfig);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const update = <K extends keyof AssessmentConfig>(key: K, val: AssessmentConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = () => {
    saveAssessmentConfig(config);
    setSaved(true);
    setHasChanges(false);
    toast.success("Assessment settings saved.");
    setTimeout(() => setSaved(false), 4000);
  };

  const handleReset = () => {
    if (window.confirm("Reset all settings to defaults?")) {
      setConfig(DEFAULT_CONFIG);
      saveAssessmentConfig(DEFAULT_CONFIG);
      setSaved(true);
      setHasChanges(false);
      toast.success("Settings reset to defaults.");
    }
  };

  // Compare with saved to detect if truly dirty
  useEffect(() => {
    const saved = loadAssessmentConfig();
    const dirty = Object.keys(config).some(
      (k) => (config as any)[k] !== (saved as any)[k]
    );
    setHasChanges(dirty);
  }, [config]);

  return (
    <div className="font-poppins min-h-screen">
      <div className="backdrop-blur-sm lg:rounded-2xl border border-white/20 overflow-hidden bg-white/70">
        {/* Header */}
        <div className="bg-gradient-to-r from-chestnut to-chestnut/90 px-4 sm:px-6 py-4 sm:py-5 lg:rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Menu className="lg:hidden w-5 h-5 text-white" onClick={openMobileNav} />
            <button
              onClick={() => navigate(-1)}
              className="p-1.5"
            >
              <ArrowLeft size={16} className="text-white" />
            </button>
            <h2 className="font-semibold text-base text-white leading-none">Assessment Settings</h2>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-100">
                <Check size={12} strokeWidth={3} />
                Saved
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
            >
              <Save size={14} />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left Sidebar */}
          <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-6 p-6 border-r border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Settings2 size={18} className="text-indigo-500" />
              <span className="text-sm font-bold text-slate-800">Configuration</span>
            </div>

            <nav className="flex flex-col gap-1">
              {[
                { label: "Grading & Marks", icon: <Trophy size={14} />, href: "#grading" },
                { label: "Time & Duration", icon: <Clock size={14} />, href: "#timing" },
                { label: "Quiz Behaviour", icon: <SlidersHorizontal size={14} />, href: "#behaviour" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-slate-100">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-[11px] font-semibold text-rose-500 hover:text-rose-600 px-2 py-1 rounded-md hover:bg-rose-50 transition-all"
              >
                <RotateCcw size={12} />
                Reset to defaults
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl">
            {/* Unsaved indicator (mobile) */}
            {hasChanges && (
              <div className="lg:hidden flex items-center gap-2 text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                You have unsaved changes
              </div>
            )}

            {/* ── Section: Grading & Marks ── */}
            <section id="grading" className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Trophy size={18} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800">Grading & Marks</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Pass Mark */}
                <ConfigNumberInput
                  label="Pass Mark"
                  icon={<Trophy size={14} className="text-emerald-500" />}
                  value={config.passMarkPercent}
                  min={0}
                  max={100}
                  unit="%"
                  onChange={(v) => update("passMarkPercent", v)}
                />

                {/* Default Marks per Question */}
                <ConfigNumberInput
                  label="Default Marks"
                  icon={<Weight size={14} className="text-indigo-500" />}
                  value={config.defaultMarksAllocation}
                  min={1}
                  max={20}
                  unit="marks"
                  onChange={(v) => update("defaultMarksAllocation", v)}
                />
              </div>

              {/* Difficulty */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-chestnut flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400" />
                  Default Difficulty
                </Label>
                <StarPicker
                  value={config.defaultDifficultyLevel}
                  onChange={(v) => update("defaultDifficultyLevel", v)}
                />
              </div>
            </section>

            {/* ── Section: Time & Duration ── */}
            <section id="timing" className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Clock size={18} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800">Time & Duration</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ConfigNumberInput
                  label="Time Limit"
                  icon={<Clock size={14} className="text-indigo-500" />}
                  value={config.defaultTimeLimitMinutes}
                  min={5}
                  max={180}
                  unit="minutes"
                  onChange={(v) => update("defaultTimeLimitMinutes", v)}
                />

                <ConfigNumberInput
                  label="Questions per Quiz"
                  icon={<Hash size={14} className="text-indigo-500" />}
                  value={config.questionsPerQuiz}
                  min={1}
                  max={100}
                  unit="questions"
                  onChange={(v) => update("questionsPerQuiz", v)}
                />
              </div>
            </section>

            {/* ── Section: Quiz Behaviour ── */}
            <section id="behaviour" className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <SlidersHorizontal size={18} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800">Quiz Behaviour</h3>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 px-4">
                <ConfigToggle
                  label="Allow Retakes"
                  description="Students can attempt the quiz multiple times. Set max retakes below."
                  icon={<RotateCcw size={16} />}
                  checked={config.allowRetakes}
                  onChange={(v) => update("allowRetakes", v)}
                />
                {config.allowRetakes && (
                  <div className="py-3 pl-12">
                    <ConfigNumberInput
                      label="Maximum Retakes"
                      icon={<Hash size={14} />}
                      value={config.maxRetakes}
                      min={1}
                      max={10}
                      unit="attempts"
                      onChange={(v) => update("maxRetakes", v)}
                    />
                  </div>
                )}
                <ConfigToggle
                  label="Randomize Questions"
                  description="Shuffle question order for each student attempt."
                  icon={<Hash size={16} />}
                  checked={config.randomizeQuestions}
                  onChange={(v) => update("randomizeQuestions", v)}
                />
                <ConfigToggle
                  label="Show Results Immediately"
                  description="Display score and correct answers right after submission."
                  icon={<Eye size={16} />}
                  checked={config.showResultsImmediately}
                  onChange={(v) => update("showResultsImmediately", v)}
                />
              </div>
            </section>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 text-sm font-semibold text-rose-500 hover:text-rose-600 px-4 py-2.5 rounded-lg hover:bg-rose-50 transition-all"
              >
                <RotateCcw size={14} />
                Reset to Defaults
              </button>
              <div className="flex items-center gap-2">
                {saved && (
                  <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                    <Check size={14} strokeWidth={3} />
                    Saved
                  </span>
                )}
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="flex items-center justify-center gap-2 px-6 py-5 rounded-xl bg-chestnut hover:bg-chestnut/90 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Save size={14} className="text-white" />
                  <span className="text-white font-semibold text-sm">
                    {hasChanges ? "Save Settings" : "Up to Date"}
                  </span>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AssessmentConfigPage;
