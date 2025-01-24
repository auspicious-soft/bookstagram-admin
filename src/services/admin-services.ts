import { axiosInstance, getAxiosInstance } from "@/config/axios";

export const loginService = async (payload: any) => await axiosInstance.post(`/login`, { username: payload.username, password: payload.password });
export const forgotPasswordService = async (payload: any) => await axiosInstance.post(`/forgot-password`, payload)
export const sendOtpService = async (payload: any) => await axiosInstance.post(`/verify-otp`, payload)
export const resetUserPassword = async (payload: any) => await axiosInstance.patch(`/new-password-otp-verified`, payload)

export const getDashboardStats = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
//----------User Page--------------------------
export const getAllUsers = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const getSingleUsers = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const addNewUser = async (route: string, payload: any) => {
    const axiosInstance= await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const updateSingleUser = async (route: string, payload: any) => { 
    const axiosInstance= await getAxiosInstance()
    return axiosInstance.put(route, payload)
}
export const getSingleUserOrders = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}

//----------Author Page--------------------------
export const getAllAuthors = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const getSingleAuthor = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const addNewAuthor = async (route: string, payload: any) => {
    const axiosInstance= await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const updateSingleAuthor = async (route: string, payload: any) => { 
    const axiosInstance= await getAxiosInstance()
    return axiosInstance.put(route, payload)
}

//---------Publishers Page--------------------------
export const getAllPublishers = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const getSinglePublisher = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const addNewPublisher = async (route: string, payload: any) => {
    const axiosInstance= await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const updateSinglePublisher = async (route: string, payload: any) => { 
    const axiosInstance= await getAxiosInstance()
    return axiosInstance.put(route, payload)
}
//----Category Pages------------------------

export const getAllCategories = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const getSubCategory = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}

//----Collection Pages------------------------
export const getAllCollection = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}

//----Book Pages------------------------
export const getAllBooks = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}

//-----------------Summary Page--------------------------------
export const getAllSummary = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}

//----------------Discount Page--------------------------------
export const getAllVouchers = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const postNewVoucher = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const deleteVoucher = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.delete(route)
}
export const getAllDiscountBooks = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}

//----------------Story Page--------------------------------

export const getAllStories = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const getSingleStory = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}



//------- Book Events------- 
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