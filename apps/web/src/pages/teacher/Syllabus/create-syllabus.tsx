import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Loader2,
  Send,
  GripVertical,
} from "lucide-react";
import { Button } from "@bluethub/ui-kit";
import { schoolService } from "@/services/school";
import { authService } from "@/services/auth";
import { useAuthContext } from "@/contexts/auth-context";
import toast from "react-hot-toast";

interface Subtopic {
  id: string;
  title: string;
}

interface Topic {
  id: string;
  name: string;
  subtopics: Subtopic[];
}

interface SelectItem {
  id: string;
  label: string;
}


const generateId = () => Math.random().toString(36).substring(2, 9);

const extractLabel = (item: Record<string, unknown>): string =>
  String(item.name ?? item.subjectName ?? item.subject ?? item.className ?? item.title ?? "");

const emptyTopic = (): Topic => ({
  id: generateId(),
  name: "",
  subtopics: [{ id: generateId(), title: "" }],
});

const CreateSyllabus = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [submitting, setSubmitting] = useState(false);

  // Data state
  const [classrooms, setClassrooms] = useState<SelectItem[]>([]);
  const [subjects, setSubjects] = useState<SelectItem[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Form state
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [selectedClassroomLabel, setSelectedClassroomLabel] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSubjectLabel, setSelectedSubjectLabel] = useState("");
  const [topics, setTopics] = useState<Topic[]>([emptyTopic()]);

  const [roleDataClassrooms, setRoleDataClassrooms] = useState<any[]>([]);
  const [isAdminRole, setIsAdminRole] = useState(false);

  // Fetch user data / classrooms
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserData = async () => {
      try {
        const response = await authService.getUserById(user.id);
        const userData = (response.data as any)?.data;

        if (!userData) {
          toast.error("Could not load user data");
          setLoadingClassrooms(false);
          return;
        }

        const roleName = userData?.roleName || "";
        const isAdmin = roleName === "Administrator" || roleName === "SuperAdministrator";
        setIsAdminRole(isAdmin);

        if (isAdmin) {
          const classroomsRes = await schoolService.getAllClassRooms();
          const raw: Record<string, unknown>[] =
            (classroomsRes.data as any)?.data?.classrooms ?? (classroomsRes.data as any)?.data ?? [];
          setClassrooms(raw.map((r) => ({ id: String(r.id), label: extractLabel(r) })));
          setLoadingClassrooms(false);
          return;
        }

        const classroomsData = userData?.roleData?.classrooms;
        if (classroomsData && Array.isArray(classroomsData) && classroomsData.length > 0) {
          setRoleDataClassrooms(classroomsData);
          setClassrooms(
            classroomsData.map((c: any, index: number) => ({
              id: String(c.classroomId),
              label: c.className || `Classroom ${index + 1}`,
            }))
          );
        } else {
          setClassrooms([]);
        }
        setLoadingClassrooms(false);
      } catch (err) {
        toast.error("Could not load user data");
        setLoadingClassrooms(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  // Fetch subjects when classroom changes
  useEffect(() => {
    if (!selectedClassroom) {
      setSubjects([]);
      return;
    }

    setSelectedSubject("");
    setSelectedSubjectLabel("");

    if (isAdminRole) {
      setSubjects([]);
      setLoadingSubjects(true);
      schoolService
        .getSubjectsByClassroomId(selectedClassroom)
        .then((res) => {
          const raw: Record<string, unknown>[] = (res.data as any)?.data ?? [];
          setSubjects(raw.map((r) => ({ id: String(r.id), label: extractLabel(r) })));
        })
        .catch(() => toast.error("Could not load subjects"))
        .finally(() => setLoadingSubjects(false));
      return;
    }

    if (roleDataClassrooms.length > 0) {
      const selectedClass = roleDataClassrooms.find(
        (c: any) => String(c.classroomId) === selectedClassroom
      );
      const subjectsData = selectedClass?.subjects;
      if (subjectsData && Array.isArray(subjectsData) && subjectsData.length > 0) {
        setSubjects(subjectsData.map((s: any) => ({ id: String(s.subjectId), label: s.subjectName })));
        setLoadingSubjects(false);
        return;
      }
    }

    setSubjects([]);
    setLoadingSubjects(false);
  }, [selectedClassroom, roleDataClassrooms, isAdminRole]);

  // ── Topic management ─────────────────────────────────────────────────────────

  const addTopic = () => setTopics((prev) => [...prev, emptyTopic()]);

  const removeTopic = (topicId: string) => {
    if (topics.length === 1) return;
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
  };

  const updateTopicName = (topicId: string, name: string) =>
    setTopics((prev) => prev.map((t) => (t.id === topicId ? { ...t, name } : t)));

  const addSubtopic = (topicId: string) =>
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? { ...t, subtopics: [...t.subtopics, { id: generateId(), title: "" }] }
          : t
      )
    );

  const removeSubtopic = (topicId: string, subtopicId: string) =>
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId && t.subtopics.length > 1
          ? { ...t, subtopics: t.subtopics.filter((s) => s.id !== subtopicId) }
          : t
      )
    );

  const updateSubtopic = (topicId: string, subtopicId: string, title: string) =>
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? {
              ...t,
              subtopics: t.subtopics.map((s) => (s.id === subtopicId ? { ...s, title } : s)),
            }
          : t
      )
    );

  // ── Validation ───────────────────────────────────────────────────────────────

  const isValid =
    !!selectedClassroom &&
    !!selectedSubject &&
    topics.length > 0 &&
    topics.every(
      (t) => t.name.trim() && t.subtopics.length > 0 && t.subtopics.every((s) => s.title.trim())
    );

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmitForReview = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      const res = await schoolService.createTopic({
        subjectId: selectedSubject,
        classroomId: selectedClassroom,
        topics: topics.map((t) => ({
          name: t.name.trim(),
          subTopics: t.subtopics.map((s) => s.title.trim()),
        })),
      });

      const data = (res.data as any);
      const ok =
        data?.responseCode === "00" ||
        data?.status === "successful" ||
        res.status === 200 ||
        res.status === 201;

      if (ok) {
        toast.success(
          topics.length === 1
            ? "Topic submitted for review"
            : `${topics.length} topics submitted for review`
        );
        navigate("/teacher/syllabus");
      } else {
        toast.error(data?.responseMessage || "Submission failed");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.responseMessage ||
        err?.response?.data?.message ||
        "Failed to submit";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const totalSubtopics = topics.reduce((sum, t) => sum + t.subtopics.length, 0);

  return (
    <div className="p-6 font-poppins">
      <div className="backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 sticky top-0 z-30 bg-chestnut">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/teacher/syllabus")}
              className="text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-white font-semibold text-sm">Create New Syllabus</p>
              <p className="text-white/60 text-[10px]">
                {topics.length} topic{topics.length !== 1 ? "s" : ""} · {totalSubtopics} subtopic
                {totalSubtopics !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSubmitForReview}
            disabled={submitting || !isValid}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Submit for Review
          </Button>
        </div>

        {/* Body */}
        <div className="bg-white/70 backdrop-blur-sm p-6">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Class & Subject */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Class & Subject</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Class</label>
                  <select
                    value={selectedClassroom}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedClassroom(id);
                      setSelectedClassroomLabel(classrooms.find((c) => c.id === id)?.label || "");
                    }}
                    disabled={loadingClassrooms}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">{loadingClassrooms ? "Loading..." : "Select a class"}</option>
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedSubject(id);
                      setSelectedSubjectLabel(subjects.find((s) => s.id === id)?.label || "");
                    }}
                    disabled={!selectedClassroom || loadingSubjects}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">
                      {loadingSubjects ? "Loading..." : !selectedClassroom ? "Select a class first" : "Select a subject"}
                    </option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedSubject && selectedClassroom && (
                <div className="mt-4 p-3 bg-chestnut/5 rounded-lg border border-chestnut/10">
                  <p className="text-sm font-semibold text-chestnut">
                    {selectedSubjectLabel} — {selectedClassroomLabel}
                  </p>
                </div>
              )}
            </div>

            {/* Topics */}
            <div className="space-y-4">
              {topics.map((topic, topicIndex) => (
                <div key={topic.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  {/* Topic header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-7 h-7 bg-chestnut rounded-full shrink-0">
                      <span className="text-xs font-bold text-white">{topicIndex + 1}</span>
                    </div>
                    <input
                      type="text"
                      value={topic.name}
                      onChange={(e) => updateTopicName(topic.id, e.target.value)}
                      placeholder={`Topic ${topicIndex + 1} name`}
                      maxLength={200}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut outline-none"
                    />
                    <button
                      onClick={() => removeTopic(topic.id)}
                      disabled={topics.length === 1}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subtopics */}
                  <div className="space-y-2 ml-10">
                    {topic.subtopics.map((subtopic, subIndex) => (
                      <div key={subtopic.id} className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                          <span className="text-xs text-gray-400 w-4 text-right">{subIndex + 1}.</span>
                        </div>
                        <input
                          type="text"
                          value={subtopic.title}
                          onChange={(e) => updateSubtopic(topic.id, subtopic.id, e.target.value)}
                          placeholder="Subtopic title"
                          className="flex-1 border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut outline-none"
                        />
                        <button
                          onClick={() => removeSubtopic(topic.id, subtopic.id)}
                          disabled={topic.subtopics.length === 1}
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => addSubtopic(topic.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-chestnut hover:bg-chestnut/5 px-3 py-2 rounded-lg transition-colors border border-dashed border-chestnut/20 w-full justify-center mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Subtopic
                    </button>
                  </div>

                </div>
              ))}

              {/* Add Topic button */}
              <button
                onClick={addTopic}
                className="flex items-center gap-2 w-full py-3.5 text-sm font-medium text-chestnut hover:bg-chestnut/5 rounded-xl transition-colors justify-center border-2 border-dashed border-chestnut/20"
              >
                <Plus className="w-4 h-4" />
                Add Another Topic
              </button>
            </div>

            {/* Validation hint */}
            {!isValid && (selectedClassroom || selectedSubject || topics.some((t) => t.name)) && (
              <p className="text-xs text-amber-600 text-center">
                Select a class and subject, then give each topic a name with at least one subtopic title.
              </p>
            )}

            {/* Bottom actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => navigate("/teacher/syllabus")}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-gray-600 text-sm font-medium bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitForReview}
                disabled={submitting || !isValid}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold bg-chestnut hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit {topics.length > 1 ? `${topics.length} Topics` : "for Review"}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSyllabus;
