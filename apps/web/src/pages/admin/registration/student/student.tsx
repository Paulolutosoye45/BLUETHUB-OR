import { useAuthContext } from "@/contexts/auth-context";
import { authService } from "@/services/auth";
import { localData } from "@/utils";
import { UserRole } from "@/utils/validate";
import { EllipsisVertical, LayoutGrid, Menu, PlusIcon, Search, SquarePen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@bluethub/ui-kit";
import { useNavigate, useOutletContext } from "react-router-dom";

type StudentRow = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  emailAddress: string;
  guardianName?: string | null;
  isActive: boolean;
  className: string;
  status: "Active" | "Non-Active";
};

const normalizeStudents = (payload: any): StudentRow[] => {
  const rows = payload?.users ?? payload?.Users ?? payload?.students ?? payload?.Students ?? payload ?? [];

  return (Array.isArray(rows) ? rows : [])
    .map((student: any) => {
      const classrooms = student?.roleData?.classrooms ?? student?.roleData?.Classrooms ?? [];
      const classroom = student?.roleData?.classroom ?? student?.roleData?.Classroom ?? classrooms[0] ?? null;

      return {
        id: String(student?.id ?? student?.Id ?? ""),
        firstName: String(student?.firstName ?? student?.FirstName ?? ""),
        lastName: String(student?.lastName ?? student?.LastName ?? ""),
        userName: String(student?.userName ?? student?.UserName ?? ""),
        emailAddress: String(student?.emailAddress ?? student?.EmailAddress ?? ""),
        guardianName: student?.guardianName ?? student?.GuardianName ?? null,
        isActive: Boolean(student?.isActive ?? student?.IsActive ?? false),
        className: String(
          classroom?.className ?? classroom?.ClassName ?? classroom?.name ?? classroom?.Name ?? "",
        ),
        status: Boolean(student?.isActive ?? student?.IsActive ?? false) ? "Active" : "Non-Active",
      } satisfies StudentRow;
    })
    .filter((student: StudentRow) => !!student.id);
};

const fallbackStudents: StudentRow[] = [
  {
    id: "1",
    firstName: "Tee",
    lastName: "Wealth",
    userName: "tee.wealth",
    emailAddress: "tee.wealth@example.com",
    guardianName: "",
    isActive: true,
    className: "JSS 1",
    status: "Active",
  },
  {
    id: "2",
    firstName: "Mofe",
    lastName: "Ade",
    userName: "mofe.ade",
    emailAddress: "mofe.ade@example.com",
    guardianName: "",
    isActive: true,
    className: "Primary 3",
    status: "Active",
  },
  {
    id: "3",
    firstName: "Alex",
    lastName: "Baby",
    userName: "alex.baby",
    emailAddress: "alex.baby@example.com",
    guardianName: "",
    isActive: false,
    className: "SSS 2",
    status: "Non-Active",
  },
];

const Student = () => {
  const navigate = useNavigate();
  const { openMobileNav } = useOutletContext<{ openMobileNav: () => void }>();
  const { user } = useAuthContext();
  const school = localData.retrieve("schoolInfo") as { schoolName?: string } | null;
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);


  const fetchStudent = async () => {
    try {
      setLoading(true);
      const { data } = await authService.getUserByRole(UserRole.Student);
      const payload = (data as any)?.data ?? (data as any)?.Data ?? {};
      const normalized = normalizeStudents(payload);
      setStudents(normalized.length > 0 ? normalized : fallbackStudents);
    } catch (error) {
      console.warn("Falling back to local student data because remote fetch failed", error);
      setStudents(fallbackStudents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
 fetchStudent();
  }, []);

  const visibleStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      [student.firstName, student.lastName, student.userName, student.emailAddress, student.className]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, students]);

  if (loading) {
    return (
      <div className="md:p-6 p-3 font-poppins space-y-4">
        <div className="flex items-center justify-between rounded-2xl bg-chestnut px-5 py-4 text-white">
          <div className="space-y-1">
            <div className="h-4 w-36 rounded bg-white/20" />
            <div className="h-3 w-56 rounded bg-white/15" />
          </div>
          <div className="h-9 w-32 rounded-lg bg-white/15" />
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-14 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

    return (
      <div className="md:px-6 p-3 font-poppins">
        <div className="rounded-2xl border border-white/20 overflow-hidden bg-white/75 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-30 bg-chestnut">
            <div className="flex items-center gap-2.5 min-w-0">
              <Menu className="lg:hidden text-white" onClick={openMobileNav} />
              <LayoutGrid className="w-5 h-5 hidden lg:inline text-white" />
              <span className="text-white font-semibold text-sm truncate">Student Registry</span>
            </div>
            <EllipsisVertical className="text-white" />
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-[#12122A]">Students</h1>
                <p className="text-sm text-slate-500">
                  {school?.schoolName ?? "School"} - {user?.firstName ?? ""} {user?.lastName ?? ""}
                </p>
              </div>
              <Button onClick={() => navigate("/admin/registration/student/enrollment")} className="inline-flex items-center gap-2 rounded-lg bg-chestnut px-4 py-2 text-white text-sm font-semibold hover:opacity-90">
                <PlusIcon className="w-4 h-4" />
                Add Student
              </Button>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_120px] gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <span>Student</span>
                <span>Email</span>
                <span>Class</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              <div className="divide-y divide-slate-100">
                {visibleStudents.map((student) => (
                  <div key={student.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_120px] gap-4 items-center px-4 py-3 hover:bg-slate-50/80 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">@{student.userName}</p>
                    </div>
                    <p className="text-sm text-slate-600 truncate">{student.emailAddress || "-"}</p>
                    <p className="text-sm text-slate-600 truncate">{student.className || "-"}</p>
                    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${student.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {student.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate("/admin/registration/student/edit", { state: { studentId: student.id } })}
                      className="inline-flex items-center gap-1 rounded-lg border border-chestnut/20 bg-chestnut/5 px-3 py-2 text-xs font-semibold text-chestnut hover:bg-chestnut/10"
                    >
                      <SquarePen className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  </div>
                ))}

                {visibleStudents.length === 0 && (
                  <div className="px-4 py-12 text-center text-sm text-slate-400">
                    No students found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}

export default Student