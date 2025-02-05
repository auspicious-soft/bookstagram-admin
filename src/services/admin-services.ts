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
export const addNewCategory = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const addSubCategory = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const getSubCategoryData = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const addBookToCategory = async (route: string, payload: any) => { 
    const axiosInstance= await getAxiosInstance()
    return axiosInstance.put(route, payload)
}
export const addBookToSubCategory = async (route: string, payload: any) => { 
    const axiosInstance= await getAxiosInstance()
    return axiosInstance.put(route, payload)
}

//----Collection Pages------------------------
export const getAllCollection = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const addNewCollection = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const getSingleCollection = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const addBookToCollectio = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.put(route, payload)
}
export const updateCollectionStatus = async (route: string, payload: any) => {
    const axiosInstance= await getAxiosInstance()
    return axiosInstance.put(route, payload)
}


//----Book Hub Pages------------------------
export const getAllBooks = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const addNewBook = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const getSingleBook = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const updateSingleBook = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.put(route, payload)
}
export const addBookToDiscount = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.put(route, payload)
}
export const getAllSchools = async (route: string) => {  //-----Book school tab
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const addToBookSchool = async (route: string, payload: any) => {  //-----Book school tab
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const deleteBookSchool = async (route: string) => {  //-----Book school tab
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.delete(route)
}
export const getAllBookStudy = async (route: string) => {  //-----Book Study tab
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const addToBookStudy = async (route: string, payload: any) => {  //-----Book Study tab
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const deleteBookStudy = async (route: string) => {  //-----Book Study tab
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.delete(route)
}
export const getAllBookUniversity = async (route: string) => {  //-----Book University tab
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const addToBookUniversity = async (route: string, payload: any) => {  //-----Book University tab
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const deleteBookUniversity = async (route: string) => {  //-----Book University tab
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.delete(route)
}

export const getAllBookMasters = async (route: string) => {  //-----Book Master tab
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const addToBookMasters = async (route: string, payload: any) => {  //-----Book Master tab
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const deleteBookMasters = async (route: string) => {  //-----Book Master tab
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.delete(route)
}



//-----------------Summary Page--------------------------------
export const getAllSummary = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const postNewSummary = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const getSingleSummary = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const addBookToSummary = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.put(route, payload)
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
export const deleteSingleStory = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.delete(route)
}
export const addNewStory = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)   
}
export const updateStory = async (route: string, payload: any) =>{
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.put(route, payload)
}

//------- Promotions Page --------------------------------
export const getAllBanners = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const getSingleBanner = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const deleteSingleBanner = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.delete(route)
}
export const addNewBaner = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)   
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

//-------------------------Book Life Pages------------------------
export const getAllBookLives = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
};   
export const addNewBookLife = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
};
export const deleteBookLife = async (route: any) => {
    const axiosInstance = await getAxiosInstance();
    return axiosInstance.delete(route);
};
export const addBlogFormData = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const getBlog = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route)
}
export const DeleteBlog = async (route: any) => {
    const axiosInstance = await getAxiosInstance();
    return axiosInstance.delete(route);
};

//--------------Notifications page  ---------------
export const postNotificationToAll = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
}
export const postNotificationToSpecific = async (route: string, payload: any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.post(route, payload)
}


