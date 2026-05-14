import { token } from "@/utils";
import { X_Tenant_ID } from "@/utils/tenant";
import { API, type TResponse } from ".";

export interface ApprovalPayload {
  title: string;
  subjectName: string;
  className: string;
  description: string;
}

export interface Approval {
  id: string;
  requestedBy: string;
  requestedByName?: string;
  approverId: string;
  operationType: string;
  entityType: string;
  entityId: string;
  payload: ApprovalPayload | string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
  respondedAt?: string;
  expiresAt: string;
}

const headers = () => ({
  "X-Tenant-ID": X_Tenant_ID,
  Authorization: `Bearer ${token.getToken()}`,
});

export const approvalService = {
  getPendingApprovals: () =>
    API.get<TResponse<Approval[]>>("/api/User/approvals", { headers: headers() }),

  respondToApproval: (id: string, payload: { approved: boolean; rejectionReason?: string }) =>
    API.post<TResponse<unknown>>(`/api/User/approvals/${id}/respond`, payload, {
      headers: headers(),
    }),
};
