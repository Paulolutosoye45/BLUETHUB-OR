import { token } from "@/utils";
import axios from "axios";

export const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

// API.interceptors.request.use((config) => {
//   if (token.getToken()) {
//     config.headers.Authorization = `Bearer ${token.getToken()}`;
//   }
//   config.headers["X-Tenant-ID"] = "pearl";  
//   return config;
// });

API.interceptors.request.use((config) => {
  if (token.getToken()) {
    config.headers.Authorization = `Bearer ${token.getToken()}`;
  }
  return config;
});

// API.defaults.headers.common["X-Tenant-ID"] = "pearl";
// API.defaults.headers.common["Authorization"] = `Bearer ${token.getToken()}`;

export type TResponse<T> = {
  responseCode: string;
  isSuccess: boolean;
  message: string;
  Tdata: T;
};

const endpoints = {
  login: "/api/User/login",
  createUser: "api/User/createUser",
  editUser: "api/User/editUser",
  getStudents: "api/User/GetStudents",
  updatePassword: "api/User/updatePassword",
  getUserById: "api/User/GetUserById",
  assignPermissions: "api/User/AssignPermissions",
  getAdminPermissions: "api/User/GetAdminPermissions",
  getAllAdminPermissions: "api/User/GetAllAdminPermissions",
  revokePermissions: "api/User/RevokePermissions",
};

interface ILoginRequest {
  username: string;
  hashPassword: string;
  inst: string;
  deviceType: string;
  deviceIp: string;
}

export interface ILoginResponse {
  firstName: string;
  lastName: string;
  emailAddress: string;
  isActive: boolean;
  id: string;
  roleId: number;
  firstTimeLogin: boolean;
  token: string;
  tokenExpiresIn: number;
  schoolInfo: {
    id: string;
    schoolName: string;
    location: string;
    countryId: number;
    stateId: number;
    address: string;
    logoUrl: string;
  };
  responseMessage: string;
  responseCode: string;
  status: string;
  data: null;
}

interface IcreateUserRequest {
  createdby: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  hashPassword: string;
  isActive: true;
  hasAccess: true;
  userName: string;
  schoolId: string;
  role: number;
  userClassroomsId: string[];
  userSubjects: string[];
  removeSubjects: string[];
  removeClassroom: string[];
}

interface IEditUserRequest {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  hashPassword: string;
  isActive: true;
  hasAccess: true;
  roleId: 0;
  profileImage: string;
  guardianName: string;
}

export interface IupdatePasswordRequest {
  hashPassword: string;
  currentHashPassword: string;
  schoolId: string;
  username: string;
  deviceIp: string;
  deviceType: string;
}

interface IAssignPermissionsRequest {
  adminUserId: string;
  permissions: string[] | number[];
}

interface IGetAdminPermissionsRequest {
  pageNumber: number;
  pageSize: number;
}

export interface IUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  isActive: boolean;
  roleId: number;
  schoolInfo: {
    id: string;
    schoolName: string;
    location: string;
    countryId: number;
    stateId: number;
    address: string;
  };
}

export const authService = {
  login: (data: ILoginRequest) => {
    return API.post<ILoginResponse>(endpoints.login, data, {
      headers: {
        "X-Tenant-ID": "pearl",
      },
    });
  },
  createUser: (data: IcreateUserRequest) => {
    return API.post<TResponse<unknown>>(endpoints.createUser, data);
  },

  editUser: (data: IEditUserRequest) => {
    return API.post<TResponse<unknown>>(endpoints.editUser, data);
  },

  getStudents: () => {
    return API.get<TResponse<unknown>>(endpoints.getStudents);
  },

  updatePassword: (data: IupdatePasswordRequest) => {
    return API.post<TResponse<unknown>>(endpoints.updatePassword, data);
  },
  // service
  getUserById: (userId: string) => {
    return API.get(endpoints.getUserById, {
      params: { userId },
      headers: {
        "X-Tenant-ID": "pearl",
      },
    });
  },
  assignPermissions: (data: IAssignPermissionsRequest) => {
    return API.post<TResponse<unknown>>(endpoints.assignPermissions, data);
  },
  getAdapterPermissions: (adminUserId: string) => {
    return API.get<TResponse<unknown>>(endpoints.getAdminPermissions, {
      params: { adminUserId },
    });
  },

  getAllAdminPermissions: (data: IGetAdminPermissionsRequest) => {
    return API.get<TResponse<unknown>>(endpoints.getAdminPermissions, {
      params: data,
    });
  },

  revokePermissions: (adminUserId: string) => {
    return API.post<TResponse<unknown>>(endpoints.revokePermissions, {
      adminUserId,
    });
  },
};
