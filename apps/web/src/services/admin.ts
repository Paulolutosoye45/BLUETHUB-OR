import { API, type TResponse } from ".";

// ── Endpoints ────────────────────────────────────────────────────────────────
const endpoints = {
  addCourse: "/api/School/registersubject",
  getAllSubjects: (schoolId: string) =>
    `/api/School/getAllSchoolSubjects?schoolId=${schoolId}`,
};

// ── Types ────────────────────────────────────────────────────────────────────
export type TAddCourse = {
  category: string;
  subject: string;
  isActive: boolean;
};

type AddCoursePayload = {
  createdBy: string;
  schoolId: string;
  subjects: TAddCourse[];
};

// ── Service ──────────────────────────────────────────────────────────────────
export const adminService = {
  addCourses: (payload: AddCoursePayload) =>
    API.post<TResponse<unknown>>(endpoints.addCourse, payload, {
      headers: { "X-Tenant-ID": "pearl" },
    }),

  getAllSubjects: (schoolId: string): Promise<any> => {
    const request = API.post(endpoints.getAllSubjects(schoolId), {}, {
      headers: { "X-Tenant-ID": "pearl" },
    });

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out. Please try again.")), 10000)
    );

    return Promise.race([request, timeout]);
  },
};
