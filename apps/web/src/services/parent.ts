import { API, type TResponse } from ".";
import { getTenantFromUrl } from "@/utils/subdomain";

const headers = { "X-Tenant-ID": getTenantFromUrl() };

// ── Backend contract ────────────────────────────────────────────────────────
//   POST /api/User/profileParent            admin: create/link a parent
//   POST /api/User/attachStudents           admin: link students to an existing parent
//   POST /api/User/removeStudentParent       admin: unlink one student
//   POST /api/User/deactivateParent/{id}     admin: block parent login
//   GET  /api/User/my-children                parent: own children
//   GET  /api/User/parents/search             admin: search parents (q / studentName / studentId)
// ────────────────────────────────────────────────────────────────────────────

// ── Admin: create / link a parent (endpoint 1) ────────────────────────────────

export interface CreateParentPayload {
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  /** Up to 10 student ids. */
  studentIds: string[];
}

export interface CreateParentData {
  parentId: string;
  /** true = brand-new account, temp password emailed. false = existing parent, just linked. */
  parentCreated: boolean;
  /** Only meaningful when parentCreated is true. */
  username: string | null;
  linkedStudentIds: string[];
  alreadyLinkedStudentIds: string[];
}

// ── Admin: attach students to an existing parent ──────────────────────────────
// Link-only — 404 if the parent doesn't exist (this never creates one). Each
// studentId is validated (exists, active, same school, actual Student role);
// invalid ones come back as data.invalidStudentIds on a 400. Already-linked
// students are silently skipped, not an error. Max 10 total active links per
// parent (existing + new combined) — 409 if it would exceed that.

export interface AttachStudentsPayload {
  parentId: string;
  studentIds: string[];
}

export interface AttachStudentsData {
  parentId: string;
  linkedStudentIds: string[];
  alreadyLinkedStudentIds: string[];
}

// ── Admin: unlink a student from a parent (endpoint 2) ────────────────────────

export interface RemoveStudentParentPayload {
  studentId: string;
  parentId: string;
}

// ── Admin: search parents (endpoint 11) ───────────────────────────────────────

export interface SearchParentsParams {
  /** Free text against parent first/last name or email. */
  q?: string;
  /** Partial match against parent email only. */
  parentEmail?: string;
  /** Partial match against parent last name only. */
  parentSurname?: string;
  /** Partial match against a linked student's first/last name. */
  studentName?: string;
  /** Exact match — jump from a known student straight to their parent(s). */
  studentId?: string;
  page?: number;
  pageSize?: number;
}

export interface ParentSearchStudent {
  studentId: string;
  firstName: string;
  lastName: string;
  classroomName: string;
}

export interface ParentSearchResult {
  parentId: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  studentCount: number;
  students: ParentSearchStudent[];
}

export interface SearchParentsData {
  totalCount: number;
  page: number;
  pageSize: number;
  parents: ParentSearchResult[];
}

// ── Parent: own children (endpoint 4) ──────────────────────────────────────

export interface ParentChild {
  studentId: string;
  firstName: string;
  lastName: string;
  classroomId: string;
  classroomName: string;
}

export const parentService = {
  // ── Admin console only — never call from the parent app ────────────────────
  createParent: (data: CreateParentPayload) =>
    API.post<TResponse<CreateParentData>>("/api/User/profileParent", data, { headers }),

  attachStudents: (data: AttachStudentsPayload) =>
    API.post<TResponse<AttachStudentsData>>("/api/User/attachStudents", data, { headers }),

  removeStudentParent: (data: RemoveStudentParentPayload) =>
    API.post<TResponse<null>>("/api/User/removeStudentParent", data, { headers }),

  deactivateParent: (parentId: string) =>
    API.post<TResponse<null>>(`/api/User/deactivateParent/${parentId}`, null, { headers }),

  searchParents: (params: SearchParentsParams = {}) =>
    API.get<TResponse<SearchParentsData>>("/api/User/parents/search", {
      params: {
        q: params.q || undefined,
        parentEmail: params.parentEmail || undefined,
        parentSurname: params.parentSurname || undefined,
        studentName: params.studentName || undefined,
        studentId: params.studentId || undefined,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      },
      headers,
    }),

  // ── Parent's own view ──────────────────────────────────────────────────────
  /** The only way to get a parent's children's ids — every other parent
   *  screen (attendance stats/history) depends on calling this first. */
  getMyChildren: () =>
    API.get<TResponse<ParentChild[]>>("/api/User/my-children", { headers }),
};

export default parentService;
