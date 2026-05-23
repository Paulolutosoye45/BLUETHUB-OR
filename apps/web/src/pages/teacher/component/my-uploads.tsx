import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import TitleBar from "@/shared/title-bar";
import { useAuthContext } from "@/contexts/auth-context";
import { schoolService } from "@/services/school";
import {
  questionJobService,
  type JobStatusItem,
  type JobStatusesSummary,
} from "@/services/question-job";

type SelectItem = { id: string; name: string };

const statusPillClass = (status: JobStatusItem["status"]) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Failed":
      return "bg-red-50 text-red-700 border-red-200";
    case "Processing":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const SummaryCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "pending" | "processing" | "completed" | "failed";
}) => {
  const toneClass =
    tone === "completed"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : tone === "failed"
      ? "bg-red-50 border-red-200 text-red-700"
      : tone === "processing"
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : tone === "pending"
      ? "bg-sky-50 border-sky-200 text-sky-700"
      : "bg-white border-slate-200 text-slate-700";

  return (
    <div className={`rounded-xl border px-4 py-3 ${toneClass}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

const MyUploads = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, refreshUser } = useAuthContext();

  const [classroomId, setClassroomId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subTopicId, setSubTopicId] = useState("");

  const [topics, setTopics] = useState<SelectItem[]>([]);
  const [subTopics, setSubTopics] = useState<SelectItem[]>([]);
  const [topicsData, setTopicsData] = useState<any[]>([]);

  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [summary, setSummary] = useState<JobStatusesSummary>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });
  const [jobs, setJobs] = useState<JobStatusItem[]>([]);

  const classrooms = useMemo<SelectItem[]>(() => {
    return (user?.roleData?.classrooms ?? []).map((c) => ({
      id: String(c.classroomId),
      name: String(c.className),
    }));
  }, [user?.roleData?.classrooms]);

  const subjects = useMemo<SelectItem[]>(() => {
    const selectedClassroom = (user?.roleData?.classrooms ?? []).find(
      (c) => String(c.classroomId) === classroomId
    );
    return (selectedClassroom?.subjects ?? []).map((s) => ({
      id: String(s.subjectId),
      name: String(s.subjectName),
    }));
  }, [user?.roleData?.classrooms, classroomId]);

  useEffect(() => {
    if (!authLoading) {
      void refreshUser();
    }
  }, [authLoading]);

  useEffect(() => {
    if (classroomId && !classrooms.some((c) => c.id === classroomId)) {
      setClassroomId("");
      setSubjectId("");
      setTopicId("");
      setSubTopicId("");
      setTopics([]);
      setSubTopics([]);
      setTopicsData([]);
    }
  }, [classroomId, classrooms]);

  useEffect(() => {
    if (subjectId && !subjects.some((s) => s.id === subjectId)) {
      setSubjectId("");
      setTopicId("");
      setSubTopicId("");
      setTopics([]);
      setSubTopics([]);
      setTopicsData([]);
    }
  }, [subjectId, subjects]);

  useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      setSubTopics([]);
      setTopicsData([]);
      return;
    }

    setLoadingTopics(true);
    setTopicId("");
    setSubTopicId("");
    setTopics([]);
    setSubTopics([]);
    setTopicsData([]);

    schoolService
      .getSubjectCurriculum(subjectId)
      .then((res) => {
        const raw = (res.data as any)?.data ?? (res.data as any)?.Data ?? {};
        const nextTopics: any[] = raw.Topics ?? raw.topics ?? [];

        setTopicsData(nextTopics);
        setTopics(
          nextTopics.map((t: any) => ({
            id: String(t.Id ?? t.id ?? t.topicId ?? ""),
            name: String(t.Name ?? t.name ?? t.topicName ?? ""),
          }))
        );
      })
      .catch(() => {
        setTopics([]);
        toast.error("Could not load topics");
      })
      .finally(() => setLoadingTopics(false));
  }, [subjectId]);

  useEffect(() => {
    if (!topicId) {
      setSubTopics([]);
      return;
    }

    const matched = topicsData.find(
      (t: any) => String(t.Id ?? t.id ?? t.topicId) === topicId
    );

    const nextSubTopics: SelectItem[] = (matched?.SubTopics ?? matched?.subTopics ?? []).map((s: any) => ({
      id: String(s.Id ?? s.id ?? s.subTopicId ?? ""),
      name: String(s.Name ?? s.name ?? s.subTopicName ?? ""),
    }));

    setSubTopicId("");
    setSubTopics(nextSubTopics);
  }, [topicId, topicsData]);

  const fetchStatuses = async () => {
    if (!classroomId || !subjectId) {
      setSummary({ total: 0, pending: 0, processing: 0, completed: 0, failed: 0 });
      setJobs([]);
      return;
    }

    setLoadingJobs(true);
    try {
      const { data } = await questionJobService.getJobStatuses({
        classroomId,
        subjectId,
        topicId: topicId || undefined,
        subTopicId: subTopicId || undefined,
      });

      const payload = (data as any)?.data ?? {};
      setSummary(
        payload.summary ?? {
          total: 0,
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
        }
      );
      setJobs(payload.jobs ?? []);
    } catch {
      setSummary({ total: 0, pending: 0, processing: 0, completed: 0, failed: 0 });
      setJobs([]);
      toast.error("Failed to load upload statuses");
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    void fetchStatuses();
  }, [classroomId, subjectId, topicId, subTopicId]);

  const FilterSelect = ({
    label,
    value,
    options,
    placeholder,
    onChange,
    disabled,
    loading,
  }: {
    label: string;
    value: string;
    options: SelectItem[];
    placeholder: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    loading?: boolean;
  }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{label}</label>
      <select
        value={value}
        disabled={disabled || loading}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-chestnut/15 focus:border-chestnut disabled:opacity-50"
      >
        <option value="">{loading ? "Loading..." : placeholder}</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="p-3 sm:p-5 font-poppins">
      <div className="rounded-2xl border border-white/20 overflow-hidden bg-white/80 backdrop-blur-sm">
        <TitleBar title="My Uploads" hasVertical hasBackIcons onBack={() => navigate(-1)} />

        <div className="p-3 sm:p-5 lg:p-7 space-y-5">
          <div className="rounded-2xl bg-gradient-to-r from-[#fff4ec] via-[#fff] to-[#eef6ff] border border-[#f3dccb] p-4 sm:p-5">
            <h1 className="text-lg sm:text-xl font-bold text-chestnut leading-tight">Question Upload Status</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track pending, processing, completed and failed question extraction jobs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <FilterSelect
              label="Classroom"
              value={classroomId}
              options={classrooms}
              placeholder="Select classroom"
              onChange={(v) => {
                setClassroomId(v);
                setSubjectId("");
                setTopicId("");
                setSubTopicId("");
              }}
              loading={authLoading}
            />
            <FilterSelect
              label="Subject"
              value={subjectId}
              options={subjects}
              placeholder={classroomId ? "Select subject" : "Select classroom first"}
              onChange={(v) => {
                setSubjectId(v);
                setTopicId("");
                setSubTopicId("");
              }}
              disabled={!classroomId}
              loading={authLoading}
            />
            <FilterSelect
              label="Topic"
              value={topicId}
              options={topics}
              placeholder={subjectId ? "Select topic (optional)" : "Select subject first"}
              onChange={(v) => {
                setTopicId(v);
                setSubTopicId("");
              }}
              disabled={!subjectId}
              loading={loadingTopics}
            />
            <FilterSelect
              label="Sub-topic"
              value={subTopicId}
              options={subTopics}
              placeholder={topicId ? "Select sub-topic (optional)" : "Select topic first"}
              onChange={setSubTopicId}
              disabled={!topicId}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <SummaryCard label="Total" value={summary.total} tone="default" />
            <SummaryCard label="Pending" value={summary.pending} tone="pending" />
            <SummaryCard label="Processing" value={summary.processing} tone="processing" />
            <SummaryCard label="Completed" value={summary.completed} tone="completed" />
            <SummaryCard label="Failed" value={summary.failed} tone="failed" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Jobs</h2>
              {loadingJobs && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </div>

            {!loadingJobs && jobs.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                No upload jobs found for the selected filters.
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <article key={job.jobId} className="px-4 py-3 sm:py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {job.topicName} • {job.subTopicName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Type: {job.questionType} • Extracted: {job.extractedCount} • Attempts: {job.attemptCount}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Created: {job.createdAt}</p>
                      {job.completedAt && (
                        <p className="text-xs text-slate-400">Completed: {job.completedAt}</p>
                      )}
                      {job.failureReason && (
                        <p className="text-xs text-red-600 mt-1">Reason: {job.failureReason}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusPillClass(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyUploads;
