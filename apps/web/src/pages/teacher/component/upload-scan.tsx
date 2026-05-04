import TitleBar from "@/shared/title-bar";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { CheckCircle2, ChevronDown, ImagePlus, Loader2, Upload } from "lucide-react";
import { schoolService } from "@/services/school";
import { lessonService, type LessonTopic, type LessonSubTopic } from "@/services/lesson";
import { questionJobService, type JobQuestionType } from "@/services/question-job";

// ── Types ──────────────────────────────────────────────────────────────────
interface Subject { id: string; name: string; }
interface Classroom { id: string; name: string; }

// ── Small helpers ──────────────────────────────────────────────────────────
const Field = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Sel = ({
  value, options, placeholder, onSelect, loading, disabled,
}: {
  value: string; options: { id: string; name: string }[];
  placeholder: string; onSelect: (id: string) => void;
  loading?: boolean; disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.id === value);
  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-black/15 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-400 transition-colors"
      >
        <span className={selected ? "text-slate-700 font-medium" : "text-slate-400"}>
          {loading ? "Loading…" : selected?.name || placeholder}
        </span>
        {loading ? <Loader2 size={14} className="animate-spin text-slate-400" /> : <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>
      {open && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-black/10 rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {options.length === 0 ? (
            <div className="py-3 text-center text-sm text-slate-400">No options</div>
          ) : options.map(o => (
            <button
              key={o.id}
              type="button"
              onClick={() => { onSelect(o.id); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${value === o.id ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
            >
              {o.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
const UploadScan = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  // Cascade state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectId, setSubjectId] = useState("");

  const [topics, setTopics] = useState<LessonTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicId, setTopicId] = useState("");

  const [subtopics, setSubtopics] = useState<LessonSubTopic[]>([]);
  const [subtopicsLoading, setSubtopicsLoading] = useState(false);
  const [subtopicId, setSubtopicId] = useState("");

  // Form fields
  const [questionType, setQuestionType] = useState<JobQuestionType>("Objective");
  const [hasImages, setHasImages] = useState(false);
  const [marksAllocation, setMarksAllocation] = useState(1);

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submittedJobId, setSubmittedJobId] = useState<string | null>(null);

  // ── Cascade loaders ──────────────────────────────────────────────────────
  const loadSubjects = async () => {
    if (subjects.length > 0) return;
    setSubjectsLoading(true);
    try {
      const { data } = await schoolService.getAllSubject();
      setSubjects((data.data?.subjects ?? []).map((s: any) => ({ id: s.id, name: s.name })));
    } catch {
      toast.error("Failed to load subjects");
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleSubjectChange = async (id: string) => {
    setSubjectId(id);
    setTopicId(""); setSubtopicId("");
    setTopics([]); setSubtopics([]);
    setTopicsLoading(true);
    try {
      const { data } = await lessonService.getTopicsBySubject(id);
      setTopics(data.data ?? []);
    } catch {
      toast.error("Failed to load topics");
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleTopicChange = async (id: string) => {
    setTopicId(id);
    setSubtopicId(""); setSubtopics([]);
    setSubtopicsLoading(true);
    try {
      const { data } = await lessonService.getSubTopicsByTopic(id);
      setSubtopics(data.data ?? []);
    } catch {
      toast.error("Failed to load sub-topics");
    } finally {
      setSubtopicsLoading(false);
    }
  };

  // ── Image pick ───────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { toast.error("Only JPEG, PNG, WebP supported"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10 MB"); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!imageFile) { toast.error("Select an image first"); return; }
    if (!subtopicId) { toast.error("Select a sub-topic"); return; }
    if (marksAllocation < 1) { toast.error("Marks must be at least 1"); return; }

    const form = new FormData();
    form.append("image", imageFile);
    form.append("SubTopicId", subtopicId);
    form.append("QuestionType", questionType);
    form.append("HasImages", String(hasImages));
    form.append("MarksAllocation", String(marksAllocation));

    setSubmitting(true);
    try {
      const { data } = await questionJobService.submitJob(form);
      const jobId = data.data?.jobId ?? (data as any).jobId;
      setSubmittedJobId(jobId);
      toast.success("Job submitted! AI is processing your image.");
    } catch (err) {
      const e = err as AxiosError<{ responseMessage?: string }>;
      toast.error(e.response?.data?.responseMessage ?? e.message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ────────────────────────────────────────────────────────
  if (submittedJobId) {
    return (
      <div className="p-6 font-poppins">
        <div className="backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
          <TitleBar title="Upload and scan" hasVertical hasBackIcons />
          <div className="p-8 bg-white/70 backdrop-blur-sm flex flex-col items-center gap-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">Job Submitted!</h2>
              <p className="text-sm text-slate-500 mt-1">Your image is being processed by AI. Check My Uploads for the status.</p>
              <p className="text-xs text-slate-400 mt-2 font-mono">Job ID: {submittedJobId}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setSubmittedJobId(null); setImageFile(null); setImagePreview(null); }}
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Upload Another
              </button>
              <button
                onClick={() => navigate("/teacher/assessment/My-Uploads")}
                className="px-5 py-2.5 rounded-lg bg-chestnut text-white text-sm font-semibold hover:bg-chestnut/90 transition-colors"
              >
                View My Jobs →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-poppins">
      <div className="backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
        <TitleBar title="Upload and scan" hasVertical hasBackIcons />

        <div className="p-6 sm:p-8 bg-white/70 backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              AI Question Scanner
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Upload a photo or screenshot of a past question — AI will extract and format it for you
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── LEFT: Image upload ─────────────────────────────── */}
            <div className="flex-1 flex flex-col gap-4">
              <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleFileChange} />

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50" style={{ minHeight: 280 }}>
                  <img
                    src={imagePreview}
                    alt="Question"
                    className="w-full h-full object-contain"
                    style={{ maxHeight: 400, display: "block", margin: "0 auto" }}
                  />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-3 right-3 bg-black/50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-black/70 transition-colors cursor-pointer"
                  >
                    Change image
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 w-full rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 cursor-pointer"
                  style={{ minHeight: 280 }}
                >
                  <ImagePlus size={40} className="text-indigo-300" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-indigo-500">Click to upload question image</p>
                    <p className="text-xs text-slate-400 mt-1">JPEG · PNG · WebP — max 10 MB</p>
                  </div>
                </button>
              )}
            </div>

            {/* ── RIGHT: Form fields ─────────────────────────────── */}
            <div className="lg:w-80 shrink-0 flex flex-col gap-4">

              {/* Subject */}
              <Field label="Subject" required>
                <Sel
                  value={subjectId}
                  options={subjects}
                  placeholder="Select subject"
                  onSelect={handleSubjectChange}
                  loading={subjectsLoading}
                  disabled={false}
                />
                {subjects.length === 0 && !subjectsLoading && (
                  <button type="button" onClick={loadSubjects} className="text-xs text-indigo-500 self-start mt-0.5 hover:underline cursor-pointer">
                    Load subjects
                  </button>
                )}
              </Field>

              {/* Topic */}
              <Field label="Topic" required>
                <Sel
                  value={topicId}
                  options={topics}
                  placeholder={subjectId ? "Select topic" : "Select subject first"}
                  onSelect={handleTopicChange}
                  loading={topicsLoading}
                  disabled={!subjectId}
                />
              </Field>

              {/* Sub-topic */}
              <Field label="Sub-topic" required>
                <Sel
                  value={subtopicId}
                  options={subtopics}
                  placeholder={topicId ? "Select sub-topic" : "Select topic first"}
                  onSelect={setSubtopicId}
                  loading={subtopicsLoading}
                  disabled={!topicId}
                />
              </Field>

              {/* Question Type */}
              <Field label="Question Type" required>
                <div className="flex gap-2">
                  {(["Objective", "Theory", "TrueFalse"] as JobQuestionType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setQuestionType(t)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all cursor-pointer ${
                        questionType === t
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {t === "TrueFalse" ? "True/False" : t}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Marks */}
              <Field label="Marks Allocation" required>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={marksAllocation}
                  onChange={e => setMarksAllocation(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm border border-black/15 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                />
              </Field>

              {/* Has Images */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasImages}
                  onChange={e => setHasImages(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <span className="text-sm font-medium text-slate-600">
                  Question contains images / diagrams
                </span>
              </label>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !imageFile || !subtopicId}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-chestnut hover:bg-chestnut/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all cursor-pointer mt-2"
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                ) : (
                  <><Upload size={16} /> Submit for AI Processing</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadScan;
