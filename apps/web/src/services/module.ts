import { API, type TResponse } from ".";
import { X_Tenant_ID } from "@/utils/tenant";

export interface ModuleStudent {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  emailAddress: string;
  className: string;
  subjectNames: string;
  isActive: boolean;
}

export interface ModuleClassroom {
  id: string;
  name: string;
}

export interface ModuleSubject {
  id: string;
  subjectName: string;
}

const headers = { "X-Tenant-ID": X_Tenant_ID };

export const moduleService = {
  getAllStudents: () =>
    API.get<TResponse<ModuleStudent[]>>("/api/User/GetUsersByRole", {
      params: { roleId: 0, pageNumber: 1, pageSize: 200 },
      headers,
    }),

  getStudentsByClassroom: (classroomId: string) =>
    API.get<TResponse<ModuleStudent[]>>("/api/User/students", {
      params: { classroomId },
      headers,
    }),

  getStudentsBySubject: (subjectId: string) =>
    API.get<TResponse<ModuleStudent[]>>("/api/User/students", {
      params: { subjectId },
      headers,
    }),

  getTeacherStudents: () =>
    API.get<TResponse<ModuleStudent[]>>("/api/User/teacher/students", {
      headers,
    }),

  getClassrooms: (params: { pageNumber?: number; pageSize?: number } = {}) =>
    API.get<TResponse<ModuleClassroom[]>>("/api/School/GetAllClassrooms", {
      params: { pageNumber: params.pageNumber ?? 1, pageSize: params.pageSize ?? 50 },
      headers,
    }),

  getSubjectsByClassroom: (classroomId: string) =>
    API.get<TResponse<ModuleSubject[]>>("/api/School/getSubjectsByClassroom", {
      params: { classroomId },
      headers,
    }),
};

export default moduleService;
