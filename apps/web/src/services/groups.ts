import { getTenantFromUrl } from "@/utils/subdomain";
import { API, type TResponse } from ".";

const headers = { "X-Tenant-ID": getTenantFromUrl() };

// ── Backend contract ────────────────────────────────────────────────────────
//   POST   /api/groups/create                    student: create a study group
//   POST   /api/groups/{groupId}/members          student (creator only): invite classmates
//   DELETE /api/groups/{groupId}/members/{id}     student (creator only, not self): remove a member
//   GET    /api/groups/my-groups                  student: groups created or belonged to
//   GET    /api/groups/{groupId}                  student (members only): group detail
//   POST   /api/groups/{groupId}/content          student (active member): submit content
// ────────────────────────────────────────────────────────────────────────────

export type GroupStatus = "PendingApproval" | "Approved" | "Rejected" | string;
export type GroupContentStatus = "PendingApproval" | "Approved" | "Rejected" | "Published" | string;

export interface CreateGroupPayload {
  name: string;
}

export interface CreateGroupData {
  groupId: string;
  name: string;
  classroomId: string;
  status: GroupStatus;
  createdAt: string;
}

export interface InviteMembersPayload {
  studentIds: string[];
}

export interface InviteMembersData {
  addedStudentIds: string[];
}

export interface MyGroupItem {
  groupId: string;
  name: string;
  status: GroupStatus;
  isCreator: boolean;
  memberCount: number;
}

export interface GroupMember {
  studentId: string;
  firstName: string;
  lastName: string;
  isCreator: boolean;
}

export interface GroupContentItem {
  contentId: string;
  aim: string;
  subjectName: string;
  status: GroupContentStatus;
  createdBy: string;
  createdAt: string;
  mediaCount: number;
  hasRecording: boolean;
}

export interface GroupDetail {
  groupId: string;
  name: string;
  status: GroupStatus;
  classroomId: string;
  createdBy: string;
  members: GroupMember[];
  content: GroupContentItem[];
}

// Same shape as a lesson's MediaFilePayload (services/lesson.ts) — media is
// uploaded via the existing direct-to-CDN flow first, then this metadata is
// attached to the content submission.
export interface GroupContentMediaFile {
  fileName: string;
  originalFileName: string;
  fileExtension: string;
  cloudinaryUrl: string;
  publicId: string;
  fileSizeBytes: number;
  duration?: number;
  displayOrder: number;
  metaData?: string;
}

export interface SubmitGroupContentPayload {
  subjectId: string;
  topicId: string | null;
  subTopic: string | null;
  aim: string;
  description: string;
  mediaFiles: GroupContentMediaFile[];
}

export interface SubmitGroupContentData {
  contentId: string;
  groupId: string;
  status: GroupContentStatus;
  createdAt: string;
}

export const groupService = {
  createGroup: (payload: CreateGroupPayload) =>
    API.post<TResponse<CreateGroupData>>("/api/groups/create", payload, { headers }),

  inviteMembers: (groupId: string, payload: InviteMembersPayload) =>
    API.post<TResponse<InviteMembersData>>(`/api/groups/${groupId}/members`, payload, { headers }),

  getMyGroups: () =>
    API.get<TResponse<MyGroupItem[]>>("/api/groups/my-groups", { headers }),

  getGroupDetail: (groupId: string) =>
    API.get<TResponse<GroupDetail>>(`/api/groups/${groupId}`, { headers }),

  submitGroupContent: (groupId: string, payload: SubmitGroupContentPayload) =>
    API.post<TResponse<SubmitGroupContentData>>(`/api/groups/${groupId}/content`, payload, { headers }),

  // Creator only — 403 otherwise. Creator can't remove themselves — 400.
  removeMember: (groupId: string, studentId: string) =>
    API.delete<TResponse<null>>(`/api/groups/${groupId}/members/${studentId}`, { headers }),
};

export default groupService;
