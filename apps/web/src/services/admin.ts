import { API } from ".";

const adminEndpoints = {
  addCourse: "/School/registersubject",
  root_all_subject: (schoolId: string) =>
    `/School/getAllSchoolSubjects?schoolId=${schoolId}`,
  // getCourses: "/Admin/getCourses",
  // updateCourse: "/Admin/updateCourse",
  // deleteCourse: "/Admin/deleteCourse",
  // getStudents: "/Admin/getStudents",
  // addStudent: "/Admin/addStudent",
  // updateStudent: "/Admin/updateStudent",
  // deleteStudent: "/Admin/deleteStudent",
};

const adminApprovalEndpoints = {
  pendingApprovals: "/api/admin/pending-approvals",
  quickView: (classId: string) => `/api/admin/quick-view/${classId}`,
  // bulk,
};

adminApprovalEndpoints

export type TAddCourse = {
  category: string;
  subject: string;
  status: boolean;
};

type AddPayload = {
  createdBy: string;
  schoolId: string;
  subjects: TAddCourse[];
};

export const AddCourses = (payload: AddPayload) => {
  const response = API.post(adminEndpoints.addCourse, payload);
  return response;
};

export const getAllSubject = (schoolId: string): Promise<any> => {
  const apiCall = API.post(adminEndpoints.root_all_subject(schoolId));

  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Something went wrong. Please try again."));
    }, 10000); // 5 seconds
  });

  return Promise.race([apiCall, timeout]);
};
