import axios from "axios";
// import { token } from "../utils";

export type TNullable<T> = T | null;

export type TResponse<T> = {
  responseMessage: string;
  responseCode: string;
  status: string;
  data: T;
};

type TLogin = {
  username: string;
  hashPassword: string;
  Inst: string;
  deviceType: string;
  deviceIp: string;
};

export type LoginResponse = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  isActive: boolean;
  id: string;
  roleId: number;
  firstTimeLogin: boolean;
  schoolInfo: schoolInfo;
};

export type schoolInfo = {
  id: string;
  schoolName: string;
  location: string;
  countryId: number;
  stateId: number;
  address: string;
  logoUrl: string;
};

type Tpassword = {
  hashPassword: string;
  currentHashPassword: string;
  schoolId: string;
  username: string;
  deviceIp: string;
  deviceType: string;
};

const endpoints = {
  login: "/User/login",
  updatepassword: "/User/updatePassword",
};

export const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

// API.interceptors.request.use((config) => {
//   if (token.getToken()) {
//     config.headers.Authorization = `Bearer ${token.getToken()}`;
//   }

//   return config;
// });

export const login = async (payload: TLogin) => {
  const response = await API.post(endpoints.login, payload);
  return response.data;
};

export const updatePassword = (T: Tpassword) => {
  return API.post<TResponse<LoginResponse>>(endpoints.updatepassword, T);
};
