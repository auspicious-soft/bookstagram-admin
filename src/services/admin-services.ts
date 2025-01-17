import { axiosInstance, getAxiosInstance } from "@/config/axios";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const loginService = async (payload: any) => await axiosInstance.post(`/login`, { username: payload.username, password: payload.password });

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