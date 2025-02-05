import { axiosInstance, getAxiosInstanceForPublisher } from "@/config/axios";


export const getPublisherDashboard = async (route: string) => {
    const axiosInstance = await getAxiosInstanceForPublisher()
    return axiosInstance.get(route)
}
export  const getPublisherAllBooks = async (route: string) => {
  const axiosInstance = await getAxiosInstanceForPublisher()
  return axiosInstance.get(route)
}
export const getPublisherSingleBook = async (route: string) => {
  const axiosInstance = await getAxiosInstanceForPublisher()
  return axiosInstance.get(route)
}
 

