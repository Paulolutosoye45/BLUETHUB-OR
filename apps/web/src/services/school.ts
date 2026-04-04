import { token } from "@/utils";
import { API, type TResponse } from ".";

export const endpoints = {
  createSchool: "/api/School/createSchool",
  getState: "/api/School/getStates",
  updateSchoolCode: "/api/School/updateSchoolCode",
  createSchoolClas: "/api/school/createschoolclassroom",
  registerSubject: "/api/School/registersubject",
  getAllSchoolSubjects: "/api/School/getAllSchoolSubjects",
  registerClassroomSubject: "/api/School/RegisterClassroomSubect",
  updateSubject: "/api/School/updatesubject",
  updateClassroom: "/api/School/updateclassroom",
  getSubjectById: "/api/School/getSubjectById",
  getClassroomById: "/api/School/getClassroomById",
  getSubjectsByClassroom: "/api/School/getSubjectsByClassroom",
  assignTeachers: "/api/School/AssignTeachers",
  getAllClassrooms: "/api/School/GetAllClassrooms",
  getAllSubjects: "/api/School/GetAllSubjects",
  getSubjectsByClassCategory: "/api/School/GetSubjectsByClassCategory",
  getSubjectsBySubjectCategory: "/api/School/GetSubjectsBySubjectCategory",
  updateClassroomTeachers: "/api/School/UpdateClassroomTeachers",
};

interface Ischool {
  subject: string;
  isActive: boolean;
  category: number;
  classCategory: number;
}

interface IRegisterSubject {
  createdBy: string;
  SchoolId: string;
  subjects: Ischool[];
}

 export interface ISubject {
  subject: string;
  schoolId: string;
  category: string;
}
export const schoolService = {
  registerSubject: (data: IRegisterSubject) => {
    return API.post<TResponse<unknown>>(endpoints.registerSubject, data, {
      headers: {
        Authorization: `Bearer ${token.getToken()}`,
        "X-Tenant-ID": "pearl",
      },
    });
  },

  getAllSchoolSubject: (schoolId: string) => {
    return API.post(endpoints.getAllSchoolSubjects, {}, {
      params: { schoolId }, 
      headers: {
        "X-Tenant-ID": "pearl",}, 
    });
  },


};
