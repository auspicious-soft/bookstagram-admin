import axios from "axios";
import { getTokenCustom } from "@/actions";

export const axiosInstance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'role' : 'admin'
    }
})

const createAuthInstance = async (adminRole: boolean = false) => {
    try {
        const token = await getTokenCustom();
        return axios.create({
            baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
            headers: {
                Authorization: `Bearer ${token}`,
                ...(adminRole && {'role' : 'admin'}), 
                'Content-Type': 'application/json'
            },
        })
    } catch (error) {
        console.error('Error getting token:', error);
        throw error
    }
};

export const getAxiosInstance = async (adminRole?: boolean) => {
    return await createAuthInstance(adminRole)
}

export const getImageClientS3URL = (key: string) => {
    return `${process.env.NEXT_PUBLIC_AWS_BUCKET_PATH}${key}`
}