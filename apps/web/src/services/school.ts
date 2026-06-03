import { token } from "@/utils";
import { API, type TResponse } from ".";
import { getSubdomain } from "@/utils/subdomain";
import { getTenantId } from "@/utils/tenant";

export const X_Tenant_ID = getTenantId();
export const tenantId = getSubdomain();
const RESOLVED_TENANT_ID = tenantId || X_Tenant_ID || "green";

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
  updateTeacherClassroom: "/api/School/teacher",
  createTopic: "/api/School/topics",
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

export const TeacherActionType = {
  Add: 1,
  Remove: 2,
  Reactivate: 3,
} as const;

export interface ITeacherAssignmentAction {
  teacherId: string;
  action: (typeof TeacherActionType)[keyof typeof TeacherActionType];
  isPrimary?: boolean;
}

export interface IUpdateClassroomTeachersRequest {
  classroomId: string;
  teacherActions: ITeacherAssignmentAction[];
}

export interface IUpdateTeacherClassroomRequest {
  teacherId: string;
  classroomIds: string[];
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
        "X-Tenant-ID": RESOLVED_TENANT_ID,
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
          "X-Tenant-ID": RESOLVED_TENANT_ID,
        },
      },
    );
  },

  getAllSubject: () => {
    return API.get(endpoints.getAllSubjects, {
        headers: {
        "X-Tenant-ID": RESOLVED_TENANT_ID,
        },
    });
},


  createClassRoom: (data: ICreateSchool) => {
    return API.post(endpoints.createSchoolClass, data, {
      headers: {
        "X-Tenant-ID": RESOLVED_TENANT_ID,
        "Authorization": `Bearer ${token.getToken()}`
      },
    });
  },

  getAllClassRooms: (params?: { pageNumber?: number; pageSize?: number }) => {
    return API.get(endpoints.getAllClassrooms, {
      params,
      headers: {
        "X-Tenant-ID": RESOLVED_TENANT_ID,
        "Authorization": `Bearer ${token.getToken()}`
      },
    });
  },

  getSubjectsByClassroomId: (classroomId: string) => {
    return API.get(endpoints.getSubjectsByClassroom, {
      params: { classroomId },
      headers: { "X-Tenant-ID": RESOLVED_TENANT_ID },
    });
  },

  updateClassroomTeachers: (payload: IUpdateClassroomTeachersRequest) => {
    return API.post<TResponse<unknown>>(endpoints.updateClassroomTeachers, payload, {
      headers: {
        "X-Tenant-ID": RESOLVED_TENANT_ID,
        Authorization: `Bearer ${token.getToken()}`,
      },
    });
  },

  updateTeacherClassroom: (payload: IUpdateTeacherClassroomRequest) => {
    return API.put<TResponse<unknown>>(
      `${endpoints.updateTeacherClassroom}/${payload.teacherId}/classrooms`,
      {
        classroomIds: payload.classroomIds,
      },
      {
        headers: {
          "X-Tenant-ID": RESOLVED_TENANT_ID,
          Authorization: `Bearer ${token.getToken()}`,
        },
      },
    );
  },

  createTopic: (payload: {
    subjectId: string;
    classroomId: string;
    topics: { name: string; subTopics: string[] }[];
  }) => {
    return API.post<TResponse<unknown>>(endpoints.createTopic, payload, {
      headers: {
        "X-Tenant-ID": X_Tenant_ID,
        Authorization: `Bearer ${token.getToken()}`,
      },
    });
  },

  getTopicsWithSubTopics: (subjectId: string, classroomId: string) => {
    return API.get(`/api/School/subject/${subjectId}/classroom/${classroomId}`, {
      headers: {
        "X-Tenant-ID": X_Tenant_ID,
        Authorization: `Bearer ${token.getToken()}`,
      },
    });
  },

  getSubjectCurriculum: (subjectId: string) => {
    return API.get(`/api/School/subjects/${subjectId}/curriculum`, {
      headers: {
        "X-Tenant-ID": X_Tenant_ID,
        Authorization: `Bearer ${token.getToken()}`,
      },
    });
  },

  addSubTopicsToTopic: (topicId: string, subTopics: string[]) => {
    return API.post(`/api/School/subtopics/add`, 
      { topicId: topicId, subTopics: subTopics },
      {
        headers: {
          "X-Tenant-ID": X_Tenant_ID,
          Authorization: `Bearer ${token.getToken()}`,
        },
      }
    );
  },
};
