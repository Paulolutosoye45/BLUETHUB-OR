import { token } from "@/utils";
import axios, { type AxiosInstance } from "axios";
import { X_Tenant_ID } from "./school";

export const API: AxiosInstance = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

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


// ── Request interceptor: attach token ─────────────────────────────────────
API.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 with refresh ─────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Park concurrent 401s — resolve them once refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return API(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) throw new Error('No refresh token stored');

        // ✅ Use plain axios (not `api`) to avoid interceptor loop
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh-token`,
          { refreshToken }
        );

        // ✅ Match actual response field name ("token" not "accessToken")
        const newToken: string = data.token;
        const expiresAt = Date.now() + data.tokenExpiresIn * 1000;

        localStorage.setItem('accessToken', newToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('accessTokenExpiresAt', String(expiresAt));

        API.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return API(originalRequest); // retry original request with new token
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

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
  getTeacher: "/api/User/teachers",
  refreshToken: "/api/User/refresh-token"
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
  refreshToken: string;
}

interface IcreateUserRequest {
  createdby: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  hashPassword: string;
  isActive: boolean;
  hasAccess: boolean;
  userName: string;
  schoolId: string;
  role: number;
  userClassroomsId?: string[];
  userSubjects?: string[];
  removeSubjects?: string[];
  removeClassroom?: string[];
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
        "X-Tenant-ID": X_Tenant_ID,
      },
    });
  },

  refreshToken: (refreshToken: string) => {
    return API.post<TResponse<unknown>>(endpoints.editUser, { refreshToken });
  },
  createUser: (data: IcreateUserRequest) => {
    return API.post<TResponse<unknown>>(endpoints.createUser, data, {
      headers: {
        "X-Tenant-ID": X_Tenant_ID,
      },
    });
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
        "X-Tenant-ID": X_Tenant_ID,
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

  getTeacher: () => {
    return API.get(endpoints.getTeacher, {
      headers: {
        "X-Tenant-ID": X_Tenant_ID,
      },
    });
  },

};