import { getTenantFromUrl } from '@/utils/subdomain';
import { API } from './index';
// import { X_Tenant_ID } from '@/utils/tenant';

const X_Tenant_ID = getTenantFromUrl()

export interface StudentStrokeDto {
  id: string;
  sessionId: string;
  type: string;
  data: string;
  color: string;
  width: number;
  currentBoard: number;
  timestamp: number;
  duration: number;
  startTime: string;
  endTime: string;
}

export interface StudentBoardBatchPayload {
  sessionId: string;
  boardIndex: number;
  strokes: StudentStrokeDto[];
}

export interface StudentBoardData {
  id: string;
  sessionId: string;
  schoolId: string;
  batchIndex: number;
  boardIndex: number;
  strokeCount: number;
  receivedAt: string;
  strokes: StudentStrokeDto[];
}

export const studentBoardService = {
  saveBatch: (payload: StudentBoardBatchPayload) =>
    API.post(`api/board/student/session/${payload.sessionId}/batch`, payload, {
      headers: { "X-Tenant-ID": X_Tenant_ID },
    }),

  loadBoard: (sessionId: string, boardIndex: number) =>
    API.get<{ data: StudentBoardData }>(
      `api/board/student/session/${sessionId}/board/${boardIndex}`,
      { headers: { "X-Tenant-ID": X_Tenant_ID } }
    ),
};
