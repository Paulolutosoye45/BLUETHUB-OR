import { token } from "@/utils";
import { X_Tenant_ID } from "@/utils/tenant";
import { API, type TResponse } from ".";
import { getSubdomain } from "@/utils/subdomain";

export const X_Tenant_ID = import.meta.env.VITE_DEFAULT_TENANT
export const tenantId = getSubdomain();

export const endpoints = {
  createSchool: "/api/School/createSchool",
  getState: "/api/School/getStates",
  updateSchoolCode: "/api/School/updateSchoolCode",
  createSchoolClass: "/api/school/createschoolclassroom",
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
  subjects: Ischool[];
}

interface IregClass {
  name: string;
  noOfStudents?: number;
  subjectIds: any[]
}

export interface ICreateSchool {
  classrooms: IregClass[];
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
        "X-Tenant-ID": tenantId || X_Tenant_ID ,
      },
    });
  },

  getAllSchoolSubject: (schoolId: string) => {
    return API.post(
      endpoints.getAllSchoolSubjects,
      {},
      {
        params: { schoolId },
        headers: {
          "X-Tenant-ID": tenantId || X_Tenant_ID,
        },
      },
    );
  },

  getAllSubject: () => {
    return API.get(endpoints.getAllSubjects, {
        headers: {
            "X-Tenant-ID": tenantId || X_Tenant_ID,
        },
    });
},


  createClassRoom: (data: ICreateSchool) => {
    return API.post(endpoints.createSchoolClass, data, {
      headers: {
        "X-Tenant-ID": tenantId || X_Tenant_ID,
        "Authorization": `Bearer ${token.getToken()}`
      },
    });
  },

  getAllClassRooms: () => {
    return API.get(endpoints.getAllClassrooms, {
      headers: {
        "X-Tenant-ID": tenantId || X_Tenant_ID,
        "Authorization": `Bearer ${token.getToken()}`
      },
    });
  },

  getSubjectsByClassroomId: (classroomId: string) => {
    return API.get(endpoints.getSubjectsByClassroom, {
      params: { classroomId },
      headers: { "X-Tenant-ID": tenantId || X_Tenant_ID },
    });
  },
};
