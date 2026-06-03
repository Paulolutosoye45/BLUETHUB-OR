import { Button, Input, Label } from "@bluethub/ui-kit";
import { authService } from "@/services/auth";
import { schoolService } from "@/services/school";
import { UserRole } from "@/utils/validate";
import { Hashing } from "@/utils";
import { ArrowLeft, BookOpen, GraduationCap, Loader2, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

// ── Types ──────────────────────────────────────────────────────────────────────

type SubjectDto = {
  subjectId: string;
  subjectName: string;
  subjectCategory: string;
};

type ClassroomDto = {
  classroomId: string;
  className: string;
  subjects?: SubjectDto[];
};

type SchoolClassroomDto = {
  id: string;
  name: string;
};

type FullUserDto = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  emailAddress: string;
  roleId: number;
  roleName?: string;
  isActive: boolean;
  hasAccess: boolean;
  profileImage?: string | null;
  guardianName?: string | null;
  roleData?: {
    classrooms?: ClassroomDto[];
    classroom?: Partial<ClassroomDto>;
    Classroom?: Partial<ClassroomDto>;
    Classrooms?: Array<Partial<ClassroomDto>>;
  };
};

const normalizeClassroomsFromUser = (payload: any): ClassroomDto[] => {
  const roleData = payload?.roleData ?? payload?.RoleData ?? {};
  const rawClassrooms =
    roleData?.classrooms ??
    roleData?.Classrooms ??
    (roleData?.classroom ? [roleData.classroom] : roleData?.Classroom ? [roleData.Classroom] : []);

  return (rawClassrooms as Array<Record<string, any>>)
    .map((classroom) => ({
      classroomId: String(
        classroom?.classroomId ?? classroom?.ClassroomId ?? classroom?.id ?? classroom?.Id ?? "",
      ),
      className: String(
        classroom?.className ?? classroom?.ClassName ?? classroom?.name ?? classroom?.Name ?? "",
      ),
      subjects: (classroom?.subjects ?? classroom?.Subjects ?? []).map((subject: any) => ({
        subjectId: String(subject?.subjectId ?? subject?.SubjectId ?? subject?.id ?? subject?.Id ?? ""),
        subjectName: String(subject?.subjectName ?? subject?.SubjectName ?? subject?.name ?? subject?.Name ?? ""),
        subjectCategory: String(
          subject?.subjectCategory ?? subject?.SubjectCategory ?? subject?.category ?? subject?.Category ?? "",
        ),
      })),
    }))
    .filter((classroom) => !!classroom.classroomId);
};

const roleLabel: Record<string, string> = {
  teacher: "Subject Teacher",
  "class-teacher": "Class Teacher",
  "head-teacher": "Head Teacher",
  "admin-user": "Admin User",
};

// ── Component ──────────────────────────────────────────────────────────────────

const TeacherEditProfile = () => {
  const location = useLocation();
  const { rolePath } = useParams<{ rolePath: string }>();
  const userId = (location.state as { userId?: string } | null)?.userId;
  const navigate = useNavigate();

  // ── loading / error ────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ── raw user from API ──────────────────────────────────────────────────────
  const [userData, setUserData] = useState<FullUserDto | null>(null);

  // ── profile form ───────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    isActive: true,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // ── assignments state ──────────────────────────────────────────────────────
  const [keptClassrooms, setKeptClassrooms] = useState<ClassroomDto[]>([]);
  const [savingAssign, setSavingAssign] = useState(false);
  const [submittingAll, setSubmittingAll] = useState(false);
  const [assignMsg, setAssignMsg] = useState({ type: "", text: "" });
  const [allClassrooms, setAllClassrooms] = useState<SchoolClassroomDto[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [selectedClassroomIds, setSelectedClassroomIds] = useState<string[]>([]);
  const [subjectPickerClassroomId, setSubjectPickerClassroomId] = useState("");
  const [availableClassroomSubjects, setAvailableClassroomSubjects] = useState<SubjectDto[]>([]);
  const [selectedSubjectIdsToAdd, setSelectedSubjectIdsToAdd] = useState<string[]>([]);
  const [loadingClassroomSubjects, setLoadingClassroomSubjects] = useState(false);

  // ── derived ───────────────────────────────────────────────────────────────
  const isAdmin = useMemo(() => userData?.roleId === UserRole.Administrator, [userData]);
  const isSubjectTeacher = useMemo(() => userData?.roleId === UserRole.SubjectTeacher, [userData]);
  const isClassTeacher = useMemo(() => userData?.roleId === UserRole.ClassTeacher, [userData]);
  const isHeadTeacher = useMemo(() => userData?.roleId === UserRole.HeadTeacher, [userData]);
  const isClassOrHeadTeacher = isClassTeacher || isHeadTeacher;

  const pageTitle = useMemo(() => {
    if (userData?.roleName) return `Edit ${userData.roleName}`;
    return `Edit ${roleLabel[rolePath ?? ""] ?? "User"}`;
  }, [rolePath, userData]);

  // ── fetch user ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setErrorMsg("Missing user id.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setErrorMsg("");
      try {
        const { data } = await authService.getUserById(userId);
        const payload: FullUserDto =
          (data as any)?.data ?? (data as any)?.Data;
        if (!payload?.id) throw new Error("User data was not returned.");
        setUserData(payload);
        setProfileForm({
          firstName: payload.firstName ?? "",
          lastName: payload.lastName ?? "",
          emailAddress: payload.emailAddress ?? "",
          isActive: !!payload.isActive,
        });
        const existingClassrooms = normalizeClassroomsFromUser(payload);
        setKeptClassrooms(existingClassrooms);
        if (existingClassrooms.length > 0) {
          setSelectedClassroomId(existingClassrooms[0].classroomId);
          setSubjectPickerClassroomId(existingClassrooms[0].classroomId);
        }
        setSelectedClassroomIds(existingClassrooms.map((c) => c.classroomId));
      } catch (err: any) {
        setErrorMsg(
          err?.response?.data?.responseMessage ??
            err?.message ??
            "Failed to load user profile.",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  useEffect(() => {
    if (!isClassOrHeadTeacher) return;

    const loadClassrooms = async () => {
      setLoadingClassrooms(true);
      try {
        const { data } = await schoolService.getAllClassRooms({
          pageNumber: 1,
          pageSize: 200,
        });
        const payload = (data as any)?.data ?? (data as any)?.Data ?? {};
        const classes = (payload?.classrooms ?? payload?.Classrooms ?? []) as SchoolClassroomDto[];
        setAllClassrooms(classes);

        if (!selectedClassroomId && classes.length > 0) {
          setSelectedClassroomId(classes[0].id);
        }
      } catch {
        setAssignMsg({
          type: "error",
          text: "Unable to load classrooms for assignment.",
        });
      } finally {
        setLoadingClassrooms(false);
      }
    };

    loadClassrooms();
  }, [isClassOrHeadTeacher, selectedClassroomId]);

  useEffect(() => {
    if (!isSubjectTeacher) return;

    if (keptClassrooms.length === 0) {
      setSubjectPickerClassroomId("");
      setAvailableClassroomSubjects([]);
      setSelectedSubjectIdsToAdd([]);
      return;
    }

    if (!keptClassrooms.some((c) => c.classroomId === subjectPickerClassroomId)) {
      setSubjectPickerClassroomId(keptClassrooms[0].classroomId);
    }
  }, [isSubjectTeacher, keptClassrooms, subjectPickerClassroomId]);

  useEffect(() => {
    if (!isSubjectTeacher || !subjectPickerClassroomId) return;

    const loadSubjectsForClassroom = async () => {
      setLoadingClassroomSubjects(true);
      try {
        const { data } = await schoolService.getSubjectsByClassroomId(subjectPickerClassroomId);
        const payload = (data as any)?.data ?? (data as any)?.Data ?? {};
        const merged = [
          ...(payload.majorSubjects ?? []),
          ...(payload.minorSubjects ?? []),
        ];

        const normalized: SubjectDto[] = merged
          .map((subject: any) => ({
            subjectId: String(subject.subjectId ?? subject.id ?? ""),
            subjectName: String(subject.subjectName ?? subject.subject ?? subject.name ?? "Unnamed Subject"),
            subjectCategory: String(
              subject.subjectCategory ?? subject.subjectCategoryName ?? subject.category ?? "",
            ),
          }))
          .filter((subject: SubjectDto) => !!subject.subjectId);

        setAvailableClassroomSubjects(normalized);

        const assigned =
          keptClassrooms.find((c) => c.classroomId === subjectPickerClassroomId)?.subjects ?? [];
        setSelectedSubjectIdsToAdd(assigned.map((subject) => subject.subjectId));
      } catch {
        setAssignMsg({
          type: "error",
          text: "Unable to load subjects for the selected classroom.",
        });
      } finally {
        setLoadingClassroomSubjects(false);
      }
    };

    void loadSubjectsForClassroom();
  }, [isSubjectTeacher, subjectPickerClassroomId]);

  // ── save profile ───────────────────────────────────────────────────────────
  const doSaveProfile = async (): Promise<boolean> => {
    if (!userData) return false;
    setSavingProfile(true);
    setProfileMsg({ type: "", text: "" });
    try {
      const hashPassword = await Hashing(userData.userName);
      await authService.editUser({
        id: userData.id,
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        emailAddress: profileForm.emailAddress,
        hashPassword,
        isActive: profileForm.isActive,
        hasAccess: userData.hasAccess,
        roleId: userData.roleId,
        profileImage: userData.profileImage ?? "",
        guardianName: userData.guardianName ?? "",
      });
      setProfileMsg({ type: "success", text: "Profile updated successfully." });
      return true;
    } catch (err: any) {
      setProfileMsg({
        type: "error",
        text:
          err?.response?.data?.responseMessage ??
          err?.message ??
          "Failed to update profile.",
      });
      return false;
    } finally {
      setSavingProfile(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await doSaveProfile();
  };

  // ── save assignments (returns bool) ─────────────────────────────────────────
  // ── assignment helpers ─────────────────────────────────────────────────────
  const removeClassroom = (classroomId: string) => {
    setKeptClassrooms((prev) =>
      prev.filter((c) => c.classroomId !== classroomId),
    );
  };

  const removeSubject = (classroomId: string, subjectId: string) => {
    setKeptClassrooms((prev) =>
      prev.map((c) =>
        c.classroomId === classroomId
          ? {
              ...c,
              subjects: (c.subjects ?? []).filter(
                (s) => s.subjectId !== subjectId,
              ),
            }
          : c,
      ),
    );

    if (classroomId === subjectPickerClassroomId) {
      setSelectedSubjectIdsToAdd((prev) =>
        prev.filter((id) => id !== subjectId),
      );
    }
  };

  const syncSubjectsToClassroom = (nextSelectedIds: string[]) => {
    if (!subjectPickerClassroomId) {
      return;
    }

    const selected = availableClassroomSubjects.filter((subject) =>
      nextSelectedIds.includes(subject.subjectId),
    );

    setKeptClassrooms((prev) =>
      prev.map((classroom) =>
        classroom.classroomId === subjectPickerClassroomId
          ? { ...classroom, subjects: selected }
          : classroom,
      ),
    );
  };

  const toggleSubjectForClassroom = (subjectId: string, checked: boolean) => {
    const nextSelectedIds = checked
      ? Array.from(new Set([...selectedSubjectIdsToAdd, subjectId]))
      : selectedSubjectIdsToAdd.filter((id) => id !== subjectId);

    setSelectedSubjectIdsToAdd(nextSelectedIds);
    syncSubjectsToClassroom(nextSelectedIds);
  };

  // ── save assignments ───────────────────────────────────────────────────────
  const saveAssignments = async (): Promise<boolean> => {
    if (!userData) return false;
    setSavingAssign(true);
    setAssignMsg({ type: "", text: "" });

    if (isClassOrHeadTeacher) {
      if (isClassTeacher && !selectedClassroomId) {
        setAssignMsg({ type: "error", text: "Please select a classroom." });
        setSavingAssign(false);
        return false;
      }
      if (isHeadTeacher && selectedClassroomIds.length === 0) {
        setAssignMsg({ type: "error", text: "Please select at least one classroom." });
        setSavingAssign(false);
        return false;
      }

      try {
        const requestedClassroomIds = isClassTeacher
          ? [selectedClassroomId]
          : selectedClassroomIds;

        const { data } = await schoolService.updateTeacherClassroom({
          teacherId: userData.id,
          classroomIds: requestedClassroomIds,
        });

        const responseData = (data as any)?.data ?? (data as any)?.Data ?? data;
        const responseCode = String(responseData?.responseCode ?? "").toLowerCase();
        const responseStatus = String(responseData?.status ?? "").toLowerCase();
        const responseMessage =
          responseData?.responseMessage ??
          responseData?.message ??
          "Classroom assignment updated successfully.";

        if (responseStatus === "failed" || (responseCode && responseCode !== "successful" && responseCode !== "00")) {
          setAssignMsg({
            type: "error",
            text: responseMessage,
          });
          setSavingAssign(false);
          return false;
        }

        const updatedClassrooms =
          responseData?.data?.classrooms ??
          responseData?.data?.Classrooms ??
          responseData?.classrooms ??
          responseData?.Classrooms ??
          [];

        const normalizedUpdatedClassrooms = (updatedClassrooms as Array<Record<string, any>>)
          .map((classroom) => ({
            classroomId: String(
              classroom?.classroomId ?? classroom?.ClassroomId ?? classroom?.id ?? classroom?.Id ?? "",
            ),
            className: String(
              classroom?.className ?? classroom?.ClassName ?? classroom?.name ?? classroom?.Name ?? "",
            ),
          }))
          .filter((classroom) => !!classroom.classroomId);

        setAssignMsg({
          type: "success",
          text: responseMessage,
        });

        if (normalizedUpdatedClassrooms.length > 0) {
          setKeptClassrooms(normalizedUpdatedClassrooms);
        } else {
          const selected = allClassrooms.filter((classroom) =>
            requestedClassroomIds.includes(classroom.id),
          );
          setKeptClassrooms(
            selected.map((classroom) => ({
              classroomId: classroom.id,
              className: classroom.name,
            })),
          );
        }
        setSavingAssign(false);
        return true;
      } catch (err: any) {
        setAssignMsg({
          type: "error",
          text:
            err?.response?.data?.responseMessage ??
            err?.message ??
            "Failed to update classroom assignment.",
        });
        setSavingAssign(false);
        return false;
      }
      return false;
    }

    if (isSubjectTeacher) {
      const classroomId = subjectPickerClassroomId || keptClassrooms[0]?.classroomId || "";

      if (!classroomId) {
        setAssignMsg({ type: "error", text: "Please select a classroom." });
        setSavingAssign(false);
        return false;
      }

      try {
        const { data } = await authService.updateTeacherSubject({
          teacherId: userData.id,
          classroomId,
          subjectIds: selectedSubjectIdsToAdd,
        });

        const responseData = (data as any)?.data ?? (data as any)?.Data ?? data;
        const responseCode = String(responseData?.responseCode ?? "").toLowerCase();
        const responseStatus = String(responseData?.status ?? "").toLowerCase();
        const responseMessage =
          responseData?.responseMessage ??
          responseData?.message ??
          "Teacher subjects updated successfully.";

        if (responseStatus === "failed" || (responseCode && responseCode !== "successful" && responseCode !== "00")) {
          setAssignMsg({
            type: "error",
            text: responseMessage,
          });
          return false;
        }

        const updatedSubjects = (responseData?.data?.subjects ?? responseData?.data?.Subjects ?? responseData?.subjects ?? responseData?.Subjects ?? []) as Array<Record<string, any>>;
        const normalizedSubjects = updatedSubjects.map((subject) => ({
          subjectId: String(subject.subjectId ?? subject.SubjectId ?? subject.id ?? ""),
          subjectName: String(subject.subjectName ?? subject.SubjectName ?? subject.name ?? "Unnamed Subject"),
          subjectCategory: String(subject.subjectCategory ?? subject.SubjectCategory ?? subject.category ?? ""),
        })).filter((subject) => !!subject.subjectId);

        const classroomName = String(
          responseData?.data?.className ??
          responseData?.data?.ClassName ??
          responseData?.className ??
          responseData?.ClassName ??
          keptClassrooms.find((item) => item.classroomId === classroomId)?.className ??
          "",
        );

        setKeptClassrooms((prev) => {
          const next = prev.filter((classroom) => classroom.classroomId !== classroomId);
          next.push({
            classroomId,
            className: classroomName,
            subjects: normalizedSubjects,
          });
          return next;
        });
        setSelectedSubjectIdsToAdd(normalizedSubjects.map((subject) => subject.subjectId));
        setAssignMsg({
          type: "success",
          text: responseMessage,
        });
        return true;
      } catch (err: any) {
        setAssignMsg({
          type: "error",
          text:
            err?.response?.data?.responseMessage ??
            err?.response?.data?.message ??
            err?.message ??
            "Failed to update teacher subjects.",
        });
        return false;
      } finally {
        setSavingAssign(false);
      }
    }

    const original = userData.roleData?.classrooms ?? [];

    const removedClassroomIds = original
      .filter(
        (c) => !keptClassrooms.some((k) => k.classroomId === c.classroomId),
      )
      .map((c) => c.classroomId);

    const removedSubjectIds = original.flatMap((origClass) => {
      const kept = keptClassrooms.find(
        (k) => k.classroomId === origClass.classroomId,
      );
      if (!kept) return (origClass.subjects ?? []).map((s) => s.subjectId);
      return (origClass.subjects ?? [])
        .filter(
          (s) =>
            !(kept.subjects ?? []).some((ks) => ks.subjectId === s.subjectId),
        )
        .map((s) => s.subjectId);
    });

    const retainedClassroomIds = keptClassrooms.map((c) => c.classroomId);
    const retainedSubjectIds = keptClassrooms.flatMap((c) =>
      (c.subjects ?? []).map((s) => s.subjectId),
    );

    try {
      const hashPassword = await Hashing(userData.userName);
      await authService.editUser({
        id: userData.id,
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        emailAddress: profileForm.emailAddress,
        hashPassword,
        isActive: profileForm.isActive,
        hasAccess: userData.hasAccess,
        roleId: userData.roleId,
        profileImage: userData.profileImage ?? "",
        guardianName: userData.guardianName ?? "",
        userClassroomsId: retainedClassroomIds,
        userSubjects: retainedSubjectIds,
        removeClassroom: removedClassroomIds,
        removeSubjects: removedSubjectIds,
      });
      setAssignMsg({
        type: "success",
        text: "Assignments updated successfully.",
      });
      return true;
    } catch (err: any) {
      setAssignMsg({
        type: "error",
        text:
          err?.response?.data?.responseMessage ??
          err?.message ??
          "Failed to update assignments.",
      });
      return false;
    } finally {
      setSavingAssign(false);
    }
  };

  // ── submit all & go back ───────────────────────────────────────────────────
  const handleSubmitAll = async () => {
    setSubmittingAll(true);
    try {
      const profileOk = await doSaveProfile();
      const assignOk = isAdmin ? true : await saveAssignments();
      if (profileOk && assignOk) {
        navigate(-1);
      }
    } finally {
      setSubmittingAll(false);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 sm:px-6 py-5 font-poppins">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* header */}
        <div className="rounded-2xl bg-chestnut px-6 py-4 text-white">
          <h1 className="text-xs   sm:text-xl font-semibold">{pageTitle}</h1>
          <p className="mt-0.5 text-xs sm:text-sm text-white/80">
            Update profile details or manage assignments below.
          </p>
        </div>

        <Link
          to="/admin/registration/teacher"
          className="inline-flex items-center gap-2 text-sm font-medium text-chestnut hover:text-chestnut/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teacher Registration
        </Link>

        {/* loading / global error */}
        {loading && (
          <div className="flex items-center gap-2 text-slate-500 py-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading profile…
          </div>
        )}

        {!loading && errorMsg && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </p>
        )}

        {!loading && !errorMsg && userData && (
          <>
            {/* ── CARD 1: Profile ── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                <GraduationCap className="h-4 w-4 text-chestnut" />
                <h2 className="text-sm font-semibold text-slate-700">Profile</h2>
              </div>

              <form onSubmit={saveProfile} className="px-5 py-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-chestnut">
                      First Name
                    </Label>
                    <Input
                      value={profileForm.firstName}
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          firstName: e.target.value,
                        }))
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-chestnut">
                      Last Name
                    </Label>
                    <Input
                      value={profileForm.lastName}
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          lastName: e.target.value,
                        }))
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-chestnut">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      value={profileForm.emailAddress}
                      readOnly
                      disabled
                      className="mt-1 bg-slate-100 text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-chestnut">
                      Username
                    </Label>
                    <Input
                      value={userData.userName}
                      readOnly
                      className="mt-1 bg-slate-100 text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileForm.isActive}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  Active User
                </label>

                {profileMsg.text && (
                  <p
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      profileMsg.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {profileMsg.text}
                  </p>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="h-10 rounded-lg bg-chestnut hover:bg-chestnut/90 text-white px-4"
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving…
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Profile
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* ── CARD 2: Assignments (hidden for Admin) ── */}
            {!isAdmin && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                  <BookOpen className="h-4 w-4 text-chestnut" />
                  <h2 className="text-sm font-semibold text-slate-700">
                    {isSubjectTeacher
                      ? "Classrooms & Subjects"
                      : "Assigned Classrooms"}
                  </h2>
                </div>

                <div className="px-5 py-5 space-y-3">
                  {isSubjectTeacher && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                      <p className="text-xs text-slate-600">
                        Pick a classroom and choose subjects to assign to this teacher.
                      </p>

                      <div>
                        <Label className="text-sm font-medium text-chestnut">Classroom</Label>
                        <select
                          className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 bg-white"
                          value={subjectPickerClassroomId}
                          onChange={(e) => setSubjectPickerClassroomId(e.target.value)}
                          disabled={keptClassrooms.length === 0}
                        >
                          <option value="">Select assigned classroom</option>
                          {keptClassrooms.map((cls) => (
                            <option key={cls.classroomId} value={cls.classroomId}>
                              {cls.className}
                            </option>
                          ))}
                        </select>
                      </div>

                      {loadingClassroomSubjects ? (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading subjects...
                        </div>
                      ) : availableClassroomSubjects.length === 0 ? (
                        <p className="text-xs text-slate-500">No subjects found for the selected classroom.</p>
                      ) : (
                        <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 space-y-1">
                          {availableClassroomSubjects.map((subject) => (
                            <label
                              key={subject.subjectId}
                              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 cursor-pointer"
                            >
                              <span className="text-sm text-slate-700">{subject.subjectName}</span>
                              <span className="inline-flex items-center gap-2">
                                <span className="text-[11px] text-slate-400">{subject.subjectCategory || "Subject"}</span>
                                <input
                                  type="checkbox"
                                  checked={selectedSubjectIdsToAdd.includes(subject.subjectId)}
                                  onChange={(e) =>
                                    toggleSubjectForClassroom(subject.subjectId, e.target.checked)
                                  }
                                  className="accent-chestnut"
                                />
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      <p className="text-[11px] text-slate-500">
                        Subject selections are applied automatically to this classroom.
                      </p>
                    </div>
                  )}

                  {isClassOrHeadTeacher && (
                    <div className="space-y-2">
                      {isClassTeacher && (
                        <>
                          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                            Select one classroom for this class teacher.
                          </p>
                          <div>
                            <Label className="text-sm font-medium text-chestnut">Classroom</Label>
                            <select
                              className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 bg-white"
                              value={selectedClassroomId}
                              onChange={(e) => setSelectedClassroomId(e.target.value)}
                              disabled={loadingClassrooms}
                            >
                              <option value="">Select classroom</option>
                              {allClassrooms.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                  {cls.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}

                      {isHeadTeacher && (
                        <>
                          <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                            Select one or more classrooms for this head teacher.
                          </p>
                          <div>
                            <Label className="text-sm font-medium text-chestnut">Classrooms</Label>
                            {loadingClassrooms ? (
                              <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                              </div>
                            ) : (
                              <div className="mt-2 space-y-1 max-h-52 overflow-y-auto rounded-lg border border-slate-200 p-2">
                                {allClassrooms.map((cls) => (
                                  <label
                                    key={cls.id}
                                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedClassroomIds.includes(cls.id)}
                                      onChange={(e) =>
                                        setSelectedClassroomIds((prev) =>
                                          e.target.checked
                                            ? [...prev, cls.id]
                                            : prev.filter((id) => id !== cls.id),
                                        )
                                      }
                                      className="accent-chestnut"
                                    />
                                    <span className="text-sm text-slate-700">{cls.name}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {keptClassrooms.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">
                      No classrooms currently assigned.
                    </p>
                  ) : (
                    keptClassrooms.map((cls) => (
                      <div
                        key={cls.classroomId}
                        className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 space-y-2"
                      >
                        {/* Classroom row */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-800">
                            {cls.className}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeClassroom(cls.classroomId)}
                            className="rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Remove classroom"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Subjects — Subject Teacher only */}
                        {isSubjectTeacher &&
                          (cls.subjects ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-2 pl-1">
                              {(cls.subjects ?? []).map((sub) => (
                                <span
                                  key={sub.subjectId}
                                  className="inline-flex items-center gap-1 rounded-full border border-chestnut/20 bg-chestnut/5 px-2.5 py-0.5 text-xs font-medium text-chestnut"
                                >
                                  {sub.subjectName}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeSubject(
                                        cls.classroomId,
                                        sub.subjectId,
                                      )
                                    }
                                    className="ml-0.5 text-chestnut/50 hover:text-red-500 transition-colors"
                                    title="Remove subject"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    ))
                  )}

                  {assignMsg.text && (
                    <p
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        assignMsg.type === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {assignMsg.text}
                    </p>
                  )}

                  <div className="flex justify-end pt-1">
                    <Button
                      type="button"
                      onClick={saveAssignments}
                      className="h-10 rounded-lg bg-[#292382] hover:bg-[#292382]/90 text-white px-4"
                      disabled={savingAssign}
                    >
                      {savingAssign ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving…
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Save Assignments
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Universal Submit & Back button ── */}
        {!loading && !errorMsg && userData && (
          <div className="sticky bottom-3 z-20 mt-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-sm px-5 py-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Discard &amp; Go Back
            </button>
            <Button
              type="button"
              onClick={handleSubmitAll}
              disabled={submittingAll || savingProfile || savingAssign}
              className="h-10 rounded-lg bg-chestnut hover:bg-chestnut/90 text-white px-5"
            >
              {submittingAll ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving all changes…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Submit Changes
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherEditProfile;
