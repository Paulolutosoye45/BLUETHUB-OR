import { token } from "@/utils";
// import { X_Tenant_ID } from "@/utils/tenant";
import { API, type TResponse } from ".";

const X_Tenant_ID = import.meta.env.VITE_DEFAULT_TENANT

export interface ApprovalPayload {
  Title?: string;
  SubjectName?: string;
  ClassName?: string;
  Description?: string;
  Term?: string | null;
  ExamDate?: string | null;
  TotalMarks?: number | null;
  UserRole?: string | null;
  UserName?: string | null;
  EntityIds?: string[];
}

export interface Approval {
  id: string;
  operationType: string;
  entityType: string;
  entityId: string | null;
  status: string;
  createdAt: string;
  expiresAt: string;
  requestedByName: string;
  requestedByEmail: string;
  payload: ApprovalPayload | string | null;
  rejectionReason?: string;
  respondedAt?: string;
}

export interface ApprovalsData {
  count: number;
  items: Approval[];
}

const headers = () => ({
  "X-Tenant-ID": X_Tenant_ID,
  Authorization: `Bearer ${token.getToken()}`,
});

export const approvalService = {
  getPendingApprovals: () =>
    API.get<TResponse<ApprovalsData>>("/api/User/approvals", { headers: headers() }),

  respondToApproval: (id: string, payload: { approved: boolean; rejectionReason?: string }) =>
    API.post<TResponse<unknown>>(`/api/User/approvals/${id}/respond`, payload, {
      headers: headers(),
    }),
};
