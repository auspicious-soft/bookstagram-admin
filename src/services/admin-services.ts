import { axiosInstance } from "@/config/axios";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const loginService = async (payload: any) => await axiosInstance.post(`/login`, { username: payload.username, password: payload.password });
