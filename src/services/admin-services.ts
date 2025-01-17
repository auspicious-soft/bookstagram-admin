import { axiosInstance, getAxiosInstance } from "@/config/axios";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const loginService = async (payload: any) => await axiosInstance.post(`/login`, { username: payload.username, password: payload.password });
export const forgotPasswordService = async (payload: any) => await axiosInstance.post(`/forgot-password`, payload)
export const sendOtpService = async (payload: any) => await axiosInstance.post(`/verify-otp`, payload)
export const resetUserPassword = async (payload: any) => await axiosInstance.patch(`/new-password-otp-verified`, payload)

export const getDashboardStats = async (route: string) => {
    const axiosInstance = await getAxiosInstance(true)
    return axiosInstance.get(route)
}

export const addBookEventFormData = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const getBookEvents = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}

export const DeleteBookEvent = async (route: any) => {
    const axiosInstance = await getAxiosInstance();
    return axiosInstance.delete(route);
};

export const updateBookEvent = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance();
    return axiosInstance.put(route, payload);
  };