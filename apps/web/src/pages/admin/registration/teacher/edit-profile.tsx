import { Button, Input, Label } from "@bluethub/ui-kit";
import { authService } from "@/services/auth";
import { schoolService } from "@/services/school";
import { Hashing } from "@/utils";
import { ArrowLeft, BookOpen, GraduationCap, Loader2, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

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
  };
};

const ADMIN_ROLE_ID = 2;

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
  const [assignMsg, setAssignMsg] = useState({ type: "", text: "" });
  const [allClassrooms, setAllClassrooms] = useState<SchoolClassroomDto[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");

  // ── derived ───────────────────────────────────────────────────────────────
  const isAdmin = useMemo(() => userData?.roleId === ADMIN_ROLE_ID, [userData]);
  const isSubjectTeacher = useMemo(() => userData?.roleId === 4, [userData]);
  const isClassOrHeadTeacher = useMemo(
    () => userData?.roleId === 1 || userData?.roleId === 5,
    [userData],
  );

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
        const existingClassrooms = payload.roleData?.classrooms ?? [];
        setKeptClassrooms(existingClassrooms);
        if (existingClassrooms.length > 0) {
          setSelectedClassroomId(existingClassrooms[0].classroomId);
        }
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

  // ── save profile ───────────────────────────────────────────────────────────
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
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
    } catch (err: any) {
      setProfileMsg({
        type: "error",
        text:
          err?.response?.data?.responseMessage ??
          err?.message ??
          "Failed to update profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

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
  };

  // ── save assignments ───────────────────────────────────────────────────────
  const saveAssignments = async () => {
    if (!userData) return;
    setSavingAssign(true);
    setAssignMsg({ type: "", text: "" });

    if (isClassOrHeadTeacher) {
      if (!selectedClassroomId) {
        setAssignMsg({
          type: "error",
          text: "Please select a classroom.",
        });
        setSavingAssign(false);
        return;
      }

      try {
        await authService.assignTeacherToClassroom({
          teacherId: userData.id,
          classroomId: selectedClassroomId,
          isPrimary: false,
        });
        setAssignMsg({
          type: "success",
          text: "Classroom assignment updated successfully.",
        });

        const selected = allClassrooms.find((c) => c.id === selectedClassroomId);
        if (selected) {
          setKeptClassrooms([{ classroomId: selected.id, className: selected.name }]);
        }
      } catch (err: any) {
        setAssignMsg({
          type: "error",
          text:
            err?.response?.data?.responseMessage ??
            err?.message ??
            "Failed to update classroom assignment.",
        });
      } finally {
        setSavingAssign(false);
      }
      return;
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
    } catch (err: any) {
      setAssignMsg({
        type: "error",
        text:
          err?.response?.data?.responseMessage ??
          err?.message ??
          "Failed to update assignments.",
      });
    } finally {
      setSavingAssign(false);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 sm:px-6 py-5 font-poppins">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* header */}
        <div className="rounded-2xl bg-chestnut px-6 py-4 text-white">
          <h1 className="text-lg sm:text-xl font-semibold">{pageTitle}</h1>
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
                  {isClassOrHeadTeacher && (
                    <div className="space-y-2">
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        Select one classroom and save. This updates the active assignment.
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
      </div>
    </div>
  );
};

export default TeacherEditProfile;
