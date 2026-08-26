import { API, type TResponse } from ".";
import { getTenantFromUrl } from "@/utils/subdomain";

const headers = { "X-Tenant-ID": getTenantFromUrl() };

// ── Backend contract ────────────────────────────────────────────────────────
//   POST /api/User/profileParent            admin: create/link a parent
//   POST /api/User/removeStudentParent       admin: unlink one student
//   POST /api/User/deactivateParent/{id}     admin: block parent login
//   GET  /api/User/my-children                parent: own children
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

// ── Admin: unlink a student from a parent (endpoint 2) ────────────────────────

export interface RemoveStudentParentPayload {
  studentId: string;
  parentId: string;
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

  removeStudentParent: (data: RemoveStudentParentPayload) =>
    API.post<TResponse<null>>("/api/User/removeStudentParent", data, { headers }),

  deactivateParent: (parentId: string) =>
    API.post<TResponse<null>>(`/api/User/deactivateParent/${parentId}`, null, { headers }),

  // ── Parent's own view ──────────────────────────────────────────────────────
  /** The only way to get a parent's children's ids — every other parent
   *  screen (attendance stats/history) depends on calling this first. */
  getMyChildren: () =>
    API.get<TResponse<ParentChild[]>>("/api/User/my-children", { headers }),
};

export default parentService;
