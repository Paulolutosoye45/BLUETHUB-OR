import { useEffect, useMemo, useState } from "react";
import { BookOpen, Layers, Loader2, Plus, X } from "lucide-react";
import { Button, Label } from "@bluethub/ui-kit";
import { isTeacherRoleData, useAuthContext } from "@/contexts/auth-context";
import { schoolService } from "@/services/school";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type TabMode = "existing" | "new";

interface SelectItem {
  id: string;
  label: string;
}

interface TopicItem {
  id: string;
  label: string;
}

interface DraftTopic {
  draftKey: string;
  mode: TabMode;
  topicId?: string;
  topicName: string;
  subTopics: string[];
  pendingSubTopic: string;
}

const TopicSubtopicCreator = () => {
  const { user, isLoading } = useAuthContext();

  const [classroomId, setClassroomId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [subTopicName, setSubTopicName] = useState("");
  const [tabMode, setTabMode] = useState<TabMode>("existing");

  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [draftTopics, setDraftTopics] = useState<DraftTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [busy, setBusy] = useState(false);

 const classrooms: SelectItem[] = useMemo(() => {
  const roleData = user?.roleData;
  if (!roleData || !isTeacherRoleData(roleData)) return [];
  return roleData.classrooms.map((item) => ({
    id: String(item.classroomId),
    label: String(item.className),
  }));
}, [user?.roleData]);

const subjects: SelectItem[] = useMemo(() => {
  const roleData = user?.roleData;
  if (!roleData || !isTeacherRoleData(roleData)) return [];
  const selectedClassroom = roleData.classrooms.find(
    (item) => String(item.classroomId) === classroomId
  );
  return (selectedClassroom?.subjects ?? []).map((item) => ({
    id: String(item.subjectId),
    label: String(item.subjectName),
  }));
}, [user?.roleData, classroomId]);

  const refreshTopics = async (activeSubjectId: string) => {
    if (!activeSubjectId) {
      setTopics([]);
      return;
    }

    setLoadingTopics(true);
    try {
      const res = await schoolService.getSubjectCurriculum(activeSubjectId);
      const raw = (res.data as any)?.data ?? (res.data as any)?.Data ?? {};
      const apiTopics = raw.Topics ?? raw.topics ?? [];

      const mapped: TopicItem[] = apiTopics.map((topic: any) => ({
        id: String(topic.Id ?? topic.id ?? topic.topicId ?? ""),
        label: String(topic.Name ?? topic.name ?? topic.topicName ?? ""),
      }));

      setTopics(mapped);
    } catch {
      toast.error("Could not load topics");
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  useEffect(() => {
    setSubjectId("");
    setTopicId("");
    setNewTopicName("");
    setSubTopicName("");
    setTabMode("existing");
    setDraftTopics([]);
    setTopics([]);
  }, [classroomId]);

  useEffect(() => {
    setTopicId("");
    setNewTopicName("");
    setSubTopicName("");
    setTabMode("existing");
    setDraftTopics([]);

    if (subjectId && classroomId) {
      void refreshTopics(subjectId);
      return;
    }

    setTopics([]);
  }, [subjectId, classroomId]);

  const addDraftTopic = () => {
    if (!classroomId || !subjectId) {
      toast.error("Please select classroom and subject first");
      return;
    }

    const normalizedSubTopic = subTopicName.trim();

    let normalizedTopicName = "";
    let selectedTopicId: string | undefined;

    if (tabMode === "new") {
      normalizedTopicName = newTopicName.trim();
      if (!normalizedTopicName) {
        toast.error("Enter a topic name");
        return;
      }
    } else {
      selectedTopicId = topicId;
      normalizedTopicName = topics.find((topic) => topic.id === topicId)?.label?.trim() ?? "";
      if (!selectedTopicId || !normalizedTopicName) {
        toast.error("Select an existing topic");
        return;
      }

      if (!normalizedSubTopic) {
        toast.error("Existing topic requires a sub-topic");
        return;
      }
    }

    const draftKey =
      tabMode === "new"
        ? `new:${normalizedTopicName.toLowerCase()}`
        : `existing:${selectedTopicId}`;

    setDraftTopics((previous) => {
      const existingIndex = previous.findIndex((item) => item.draftKey === draftKey);
      if (existingIndex >= 0) {
        const updated = [...previous];
        const existing = updated[existingIndex];
        if (normalizedSubTopic && !existing.subTopics.includes(normalizedSubTopic)) {
          existing.subTopics.push(normalizedSubTopic);
        }
        return updated;
      }

      return [
        ...previous,
        {
          draftKey,
          mode: tabMode,
          topicId: selectedTopicId,
          topicName: normalizedTopicName,
          subTopics: normalizedSubTopic ? [normalizedSubTopic] : [],
          pendingSubTopic: "",
        },
      ];
    });

    setSubTopicName("");
    if (tabMode === "new") {
      setNewTopicName("");
      toast.success("✓ New topic draft added. Add sub-topics in the card below.");
    } else {
      setTopicId("");
      toast.success("✓ Sub-topic added to draft");
    }
  };

  const updatePendingDraftSubTopic = (draftKey: string, value: string) => {
    setDraftTopics((previous) =>
      previous.map((item) =>
        item.draftKey === draftKey ? { ...item, pendingSubTopic: value } : item
      )
    );
  };

  const appendSubTopicToDraft = (draftKey: string) => {
    setDraftTopics((previous) =>
      previous.map((item) => {
        if (item.draftKey !== draftKey) {
          return item;
        }

        const normalized = item.pendingSubTopic.trim();
        if (!normalized) {
          return item;
        }

        if (item.subTopics.includes(normalized)) {
          return { ...item, pendingSubTopic: "" };
        }

        return {
          ...item,
          subTopics: [...item.subTopics, normalized],
          pendingSubTopic: "",
        };
      })
    );
  };

  const removeSubTopicFromDraft = (draftKey: string, subTopic: string) => {
    setDraftTopics((previous) =>
      previous.map((item) => {
        if (item.draftKey !== draftKey) {
          return item;
        }

        return {
          ...item,
          subTopics: item.subTopics.filter((name) => name !== subTopic),
        };
      })
    );
  };

  const removeDraftTopic = (draftKey: string) => {
    setDraftTopics((previous) => previous.filter((item) => item.draftKey !== draftKey));
  };

  const handleSaveAll = async () => {
    if (!classroomId || !subjectId) {
      toast.error("Please select classroom and subject first");
      return;
    }

    if (draftTopics.length === 0) {
      toast.error("Add at least one topic draft");
      return;
    }

    const invalidNewTopic = draftTopics.find(
      (item) => item.mode === "new" && item.subTopics.length === 0
    );
    if (invalidNewTopic) {
      toast.error("Each new topic must have at least one sub-topic");
      return;
    }

    setBusy(true);
    try {
      const newTopicsPayload = draftTopics
        .filter((item) => item.mode === "new" && item.subTopics.length > 0)
        .map((item) => ({
          name: item.topicName,
          subTopics: item.subTopics,
        }));

      const existingSubTopicsPayload = draftTopics
        .filter((item) => item.mode === "existing" && !!item.topicId && item.subTopics.length > 0)
        .map((item) => ({
          topicId: String(item.topicId),
          subTopics: item.subTopics,
        }));

      if (newTopicsPayload.length > 0) {
        const topicResponse = await schoolService.createTopicsWithSubTopics({
          subjectId,
          topics: newTopicsPayload,
        });

        const responseData = topicResponse.data as any;
        if (responseData?.status !== "successful") {
          const errorMessage = responseData?.responseMessage || "Failed to create topics";
          toast.error(errorMessage);
          setBusy(false);
          return;
        }
      }

      if (existingSubTopicsPayload.length > 0) {
        const results = await Promise.all(
          existingSubTopicsPayload.map((item) =>
            schoolService.addSubTopicsToTopic(item.topicId, item.subTopics)
          )
        );

        const failed = results.find((res) => {
          const responseData = res.data as any;
          return responseData?.status === "failed" || responseData?.responseCode === "99999";
        });

        if (failed) {
          const responseData = failed.data as any;
          const errorMessage = responseData?.responseMessage || "Failed to create sub-topics";
          toast.error(errorMessage);
          setBusy(false);
          return;
        }
      }

      toast.success("All drafts saved successfully");
      setDraftTopics([]);
      setTopicId("");
      setNewTopicName("");
      setSubTopicName("");
      await refreshTopics(subjectId);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Could not save. Please try again.";
      toast.error(errorMsg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F8FF] via-[#F8FAFF] to-[#FFFFFF] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl border border-[#D9E4FF] bg-white shadow-[0_20px_50px_-30px_rgba(29,78,216,0.35)]">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#DBEAFE] blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-[#E0F2FE] blur-3xl" />

          <div className="relative p-4 sm:p-6 lg:p-8">
            {isLoading ? (
              <div className="flex min-h-96 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1D4ED8]" />
                  <p className="text-sm text-[#6B7280]">Loading your classroom data...</p>
                </div>
              </div>
            ) : classrooms.length === 0 ? (
              <div className="flex min-h-96 items-center justify-center">
                <div className="rounded-lg border border-[#FED7AA] bg-[#FFFBEB] p-6 text-center">
                  <p className="text-sm font-medium text-[#92400E]">No classrooms assigned</p>
                  <p className="mt-2 text-xs text-[#B45309]">Please contact your administrator to assign classrooms.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-start justify-between gap-3 sm:mb-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">Teacher Setup</p>
                    <h1 className="mt-2 text-2xl font-bold text-[#111827] sm:text-3xl">Submit Lesson</h1>
                    <p className="mt-2 text-sm text-[#4B5563] sm:text-base">
                      Create topics and subtopics for your lesson, then submit all at once.
                    </p>
                  </div>
                  <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1D4ED8] sm:flex">
                    <Layers className="h-6 w-6" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#1F2937]">Classroom</Label>
                    <select
                      value={classroomId}
                      onChange={(event) => setClassroomId(event.target.value)}
                      className="h-12 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#BFDBFE]"
                    >
                      <option value="">Select classroom</option>
                      {classrooms.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#1F2937]">Subject</Label>
                    <select
                      value={subjectId}
                      onChange={(event) => setSubjectId(event.target.value)}
                      disabled={!classroomId}
                      className="h-12 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#BFDBFE] disabled:cursor-not-allowed disabled:bg-[#F3F4F6]"
                    >
                      <option value="">{classroomId ? "Select subject" : "Select classroom first"}</option>
                      {subjects.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 sm:p-4">
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTabMode("existing");
                        setNewTopicName("");
                      }}
                      className={cn(
                        "h-11 rounded-lg text-sm font-semibold transition",
                        tabMode === "existing"
                          ? "bg-[#1D4ED8] text-white shadow"
                          : "bg-transparent text-[#374151] hover:bg-[#F3F4F6]"
                      )}
                    >
                      Existing Topic
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTabMode("new");
                        setTopicId("");
                      }}
                      className={cn(
                        "h-11 rounded-lg text-sm font-semibold transition",
                        tabMode === "new"
                          ? "bg-[#1D4ED8] text-white shadow"
                          : "bg-transparent text-[#374151] hover:bg-[#F3F4F6]"
                      )}
                    >
                      New Topic
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {tabMode === "existing" ? (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1F2937]">Topic</Label>
                        <select
                          value={topicId}
                          onChange={(event) => setTopicId(event.target.value)}
                          disabled={!subjectId || loadingTopics}
                          className="h-12 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#BFDBFE] disabled:cursor-not-allowed disabled:bg-[#F3F4F6]"
                        >
                          <option value="">
                            {!subjectId
                              ? "Select subject first"
                              : loadingTopics
                                ? "Loading topics..."
                                : "Select topic"}
                          </option>
                          {topics.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1F2937]">New Topic Name</Label>
                        <input
                          type="text"
                          value={newTopicName}
                          onChange={(event) => setNewTopicName(event.target.value)}
                          placeholder="Type new topic"
                          disabled={!subjectId}
                          className="h-12 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#BFDBFE] disabled:cursor-not-allowed disabled:bg-[#F3F4F6]"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-[#1F2937]">
                        {tabMode === "new" ? "Sub-topic (optional)" : "Sub-topic (required)"}
                      </Label>
                      <input
                        type="text"
                        value={subTopicName}
                        onChange={(event) => setSubTopicName(event.target.value)}
                        placeholder={tabMode === "new" ? "Add sub-topics after creating draft" : "Type sub-topic"}
                        disabled={!subjectId}
                        className="h-12 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#BFDBFE] disabled:cursor-not-allowed disabled:bg-[#F3F4F6]"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] sm:text-sm">
                      <BookOpen className="h-4 w-4" />
                      Draft appears instantly below. Add more sub-topics in its card, then save all together.
                    </div>
                    <Button
                      onClick={addDraftTopic}
                      disabled={busy || loadingTopics || !subjectId}
                      className="h-11 rounded-xl bg-[#1D4ED8] px-6 text-sm font-semibold text-white hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Add to Draft
                    </Button>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#C7D2FE] bg-gradient-to-br from-[#EEF2FF] to-white p-4 sm:p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-sm font-bold text-[#1E1B4B] sm:text-base">
                      Draft Queue ({draftTopics.length})
                    </h2>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveAll}
                        disabled={draftTopics.length === 0 || busy}
                        className="h-10 rounded-lg bg-[#0F766E] px-4 text-xs font-semibold text-white hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busy ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </span>
                        ) : (
                          <>
                            <Plus className="mr-1 h-4 w-4" />
                            Save All ({draftTopics.length})
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {draftTopics.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#A5B4FC] bg-white p-6 text-center text-sm text-[#475569]">
                      Your draft list is empty. Create a topic draft and add sub-topics before saving.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {draftTopics.map((draft) => (
                        <div
                          key={draft.draftKey}
                          className="rounded-xl border border-[#C7D2FE] bg-white p-4 shadow-sm"
                        >
                          <div className="mb-3 flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-[#111827]">{draft.topicName}</p>
                              <p className="text-xs text-[#64748B]">
                                {draft.mode === "new" ? "New topic draft" : "Existing topic"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDraftTopic(draft.draftKey)}
                              className="rounded-md p-1 text-[#DC2626] hover:bg-[#FEE2E2]"
                              aria-label="Remove draft topic"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mb-3 flex flex-wrap gap-2">
                            {draft.subTopics.length === 0 ? (
                              <span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-medium text-[#92400E]">
                                Add at least one sub-topic
                              </span>
                            ) : (
                              draft.subTopics.map((subTopic) => (
                                <button
                                  key={subTopic}
                                  type="button"
                                  onClick={() => removeSubTopicFromDraft(draft.draftKey, subTopic)}
                                  className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#1D4ED8]"
                                >
                                  {subTopic} x
                                </button>
                              ))
                            )}
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                              type="text"
                              value={draft.pendingSubTopic}
                              onChange={(event) =>
                                updatePendingDraftSubTopic(draft.draftKey, event.target.value)
                              }
                              placeholder="Add another sub-topic"
                              className="h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#BFDBFE]"
                            />
                            <Button
                              onClick={() => appendSubTopicToDraft(draft.draftKey)}
                              className="h-10 rounded-lg bg-[#334155] px-4 text-xs font-semibold text-white hover:bg-[#1E293B]"
                            >
                              Add Sub-topic
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicSubtopicCreator;
