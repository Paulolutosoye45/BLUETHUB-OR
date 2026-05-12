import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Loader2,
  Save,
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
  description: string;
}

interface SelectItem {
  id: string;
  label: string;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const extractLabel = (item: Record<string, unknown>): string =>
  String(
    item.name ?? item.subjectName ?? item.subject ?? item.className ?? item.title ?? ""
  );

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
  const [subtopics, setSubtopics] = useState<Subtopic[]>([
    { id: generateId(), title: "", description: "" },
  ]);

  // Store the full roleData classrooms for subject lookup
  const [roleDataClassrooms, setRoleDataClassrooms] = useState<any[]>([]);
  const [isAdminRole, setIsAdminRole] = useState(false);

  // Fetch user data from getUserById to get roleData
  useEffect(() => {
    if (!user?.id) {
      return;
    }

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

        // Admin/SuperAdmin: fetch ALL classrooms from API
        if (isAdmin) {
          const classroomsRes = await schoolService.getAllClassRooms();
          const raw: Record<string, unknown>[] =
            (classroomsRes.data as any)?.data?.classrooms ?? (classroomsRes.data as any)?.data ?? [];
          setClassrooms(raw.map((r) => ({ id: String(r.id), label: extractLabel(r) })));
          setLoadingClassrooms(false);
          return;
        }

        // ClassTeacher / SubjectTeacher: use roleData from user object
        const roleData = userData?.roleData;
        const classroomsData = roleData?.classrooms;

        if (classroomsData && Array.isArray(classroomsData) && classroomsData.length > 0) {
          setRoleDataClassrooms(classroomsData);
          setClassrooms(
            classroomsData.map((c: any, index: number) => ({
              id: String(c.classroomId),
              // Handle null className - show fallback
              label: c.className || `Classroom ${index + 1}`,
            }))
          );
        } else {
          // No classrooms assigned
          setClassrooms([]);
        }
        setLoadingClassrooms(false);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        toast.error("Could not load user data");
        setLoadingClassrooms(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  // Get subjects when classroom changes - based on user role
  useEffect(() => {
    if (!selectedClassroom) {
      setSubjects([]);
      return;
    }

    setSelectedSubject("");
    setSelectedSubjectLabel("");

    // Admin/SuperAdmin: fetch ALL subjects for this classroom from API
    if (isAdminRole) {
      setSubjects([]);
      setLoadingSubjects(true);

      schoolService.getSubjectsByClassroomId(selectedClassroom)
        .then((res) => {
          const raw: Record<string, unknown>[] = (res.data as any)?.data ?? [];
          setSubjects(raw.map((r) => ({ id: String(r.id), label: extractLabel(r) })));
        })
        .catch(() => toast.error("Could not load subjects"))
        .finally(() => setLoadingSubjects(false));
      return;
    }

    // ClassTeacher / SubjectTeacher: use subjects from roleData
    if (roleDataClassrooms.length > 0) {
      const selectedClass = roleDataClassrooms.find(
        (c: any) => String(c.classroomId) === selectedClassroom
      );

      const subjectsData = selectedClass?.subjects;

      if (subjectsData && Array.isArray(subjectsData) && subjectsData.length > 0) {
        setSubjects(
          subjectsData.map((s: any) => ({
            id: String(s.subjectId),
            label: s.subjectName,
          }))
        );
        setLoadingSubjects(false);
        return;
      }
    }

    // No subjects found
    setSubjects([]);
    setLoadingSubjects(false);
  }, [selectedClassroom, roleDataClassrooms, isAdminRole]);

  // Subtopic management
  const addSubtopic = () => {
    setSubtopics([...subtopics, { id: generateId(), title: "", description: "" }]);
  };

  const removeSubtopic = (id: string) => {
    if (subtopics.length === 1) return;
    setSubtopics(subtopics.filter((s) => s.id !== id));
  };

  const updateSubtopic = (id: string, field: keyof Subtopic, value: string) => {
    setSubtopics(
      subtopics.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Form validation
  const isValid =
    selectedClassroom &&
    selectedSubject &&
    subtopics.length > 0 &&
    subtopics.every((s) => s.title.trim());

  // Submit handlers
  const handleSaveDraft = async () => {
    setSubmitting(true);
    try {
      // TODO: Call API to save as draft
      console.log("Saving draft:", {
        classroomId: selectedClassroom,
        subjectId: selectedSubject,
        subtopics: subtopics.map((s) => ({ title: s.title, description: s.description })),
        status: "draft",
      });
      toast.success("Draft saved");
      navigate("/teacher/syllabus");
    } catch (err) {
      console.error("Failed to save draft:", err);
      toast.error("Failed to save draft");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      // TODO: Call API to submit for review
      console.log("Submitting for review:", {
        classroomId: selectedClassroom,
        subjectId: selectedSubject,
        subtopics: subtopics.map((s) => ({ title: s.title, description: s.description })),
        status: "pending",
      });
      toast.success("Syllabus submitted for review");
      navigate("/teacher/syllabus");
    } catch (err) {
      console.error("Failed to submit:", err);
      toast.error("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

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
              <p className="text-white/60 text-[10px]">Define subtopics for your class subject</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveDraft}
              disabled={submitting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-chestnut text-xs font-medium bg-white hover:bg-gray-100"
            >
              <Save className="w-3.5 h-3.5" />
              Save Draft
            </Button>
            <Button
              onClick={handleSubmitForReview}
              disabled={submitting || !isValid}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Submit for Review
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white/70 backdrop-blur-sm p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Basic Info Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Select Class & Subject</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Classroom Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Class</label>
                  <select
                    value={selectedClassroom}
                    onChange={(e) => {
                      const id = e.target.value;
                      const item = classrooms.find((c) => c.id === id);
                      setSelectedClassroom(id);
                      setSelectedClassroomLabel(item?.label || "");
                    }}
                    disabled={loadingClassrooms}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">
                      {loadingClassrooms ? "Loading..." : "Select a class"}
                    </option>
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      const id = e.target.value;
                      const item = subjects.find((s) => s.id === id);
                      setSelectedSubject(id);
                      setSelectedSubjectLabel(item?.label || "");
                    }}
                    disabled={!selectedClassroom || loadingSubjects}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">
                      {loadingSubjects
                        ? "Loading..."
                        : !selectedClassroom
                        ? "Select a class first"
                        : "Select a subject"}
                    </option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview */}
              {selectedSubject && selectedClassroom && (
                <div className="mt-4 p-3 bg-chestnut/5 rounded-lg border border-chestnut/10">
                  <p className="text-sm font-semibold text-chestnut">
                    {selectedSubjectLabel} — {selectedClassroomLabel}
                  </p>
                </div>
              )}
            </div>

            {/* Subtopics Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Subtopics</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add the topics to be covered in this syllabus
                  </p>
                </div>
                <span className="text-xs font-medium text-chestnut bg-chestnut/10 px-2.5 py-1 rounded-full">
                  {subtopics.length} topic{subtopics.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-3">
                {subtopics.map((subtopic, index) => (
                  <div
                    key={subtopic.id}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-start gap-2 pt-2">
                      <GripVertical className="w-4 h-4 text-gray-300" />
                      <div className="flex items-center justify-center w-6 h-6 bg-chestnut/10 rounded-full shrink-0">
                        <span className="text-xs font-semibold text-chestnut">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={subtopic.title}
                        onChange={(e) => updateSubtopic(subtopic.id, "title", e.target.value)}
                        placeholder="Subtopic title"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut outline-none"
                      />
                      <textarea
                        value={subtopic.description}
                        onChange={(e) => updateSubtopic(subtopic.id, "description", e.target.value)}
                        placeholder="Brief description or learning objectives (optional)"
                        rows={2}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut outline-none resize-none"
                      />
                    </div>
                    <button
                      onClick={() => removeSubtopic(subtopic.id)}
                      disabled={subtopics.length === 1}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors h-fit mt-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={addSubtopic}
                  className="flex items-center gap-2 w-full py-3 text-sm font-medium text-chestnut hover:bg-chestnut/5 rounded-lg transition-colors justify-center border border-dashed border-chestnut/30"
                >
                  <Plus className="w-4 h-4" />
                  Add Subtopic
                </button>
              </div>
            </div>

            {/* Validation Message */}
            {!isValid && (
              <p className="text-xs text-amber-600 text-center">
                Please select a class, subject, and add at least one subtopic with a title.
              </p>
            )}

            {/* Bottom Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => navigate("/teacher/syllabus")}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-gray-600 text-sm font-medium bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveDraft}
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-chestnut text-sm font-medium bg-white border border-chestnut hover:bg-chestnut/5"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
              <Button
                onClick={handleSubmitForReview}
                disabled={submitting || !isValid}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold bg-chestnut hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit for Review
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSyllabus;
