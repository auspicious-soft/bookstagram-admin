
'use server'

import { signIn, signOut } from "@/auth"
import { loginService } from "@/services/admin-services"
import { cookies } from "next/headers"
import { createS3Client } from "@/config/s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"

export const loginAction = async (payload: any) => {
    try {
        const res: any = await loginService(payload)
        
        if (res && res?.data?.success) {
            await signIn('credentials', {
                username: payload.username,
                fullName: res?.data?.data?.user?.fullName,
                _id: res?.data?.data?.user?._id,
                role: res?.data?.data?.user?.role,
                profilePic: res?.data?.data?.user?.profilePic,
                redirect: false,
            })
        }
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const logoutAction = async () => {
    try {
        await signOut()
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getTokenCustom = async () => {
    const cookiesOfNextAuth = await cookies()
    return cookiesOfNextAuth?.get(process.env.JWT_SALT as string)?.value
}

export const generateSignedUrlToUploadOn = async (fileName: string, fileType: string) => {
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `events/${fileName}`,
        ContentType: fileType,
        acl: "public-read"
    }
    try {
        const command = new PutObjectCommand(uploadParams)
        const signedUrl = await getSignedUrl(await createS3Client(), command)
        // const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
        return { signedUrl, key: uploadParams.Key }
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error
    }
}
export const generateSignedUrlForBlog = async (fileName: string, fileType: string) => {
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `blogs/${fileName}`,
        ContentType: fileType,
        acl: "public-read"
    }
    try {
        const command = new PutObjectCommand(uploadParams)
        const signedUrl = await getSignedUrl(await createS3Client(), command)
        return { signedUrl, key: uploadParams.Key }
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error
    }
}

export const generateSignedUrlForBanners = async (fileName: string, fileType: string) => {
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `banners/${fileName}`,
        ContentType: fileType,
        acl: "public-read"
    }
    try {
        const command = new PutObjectCommand(uploadParams)
        const signedUrl = await getSignedUrl(await createS3Client(), command)
        // const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
        return { signedUrl, key: uploadParams.Key }
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error
    }
}

export const generateSignedUrlForStories = async (fileName: string, fileType: string, name: string) => {
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `stories/${name}/${fileName}`,
        ContentType: fileType,
        acl: "public-read"
    }
    try {
        const command = new PutObjectCommand(uploadParams)
        const signedUrl = await getSignedUrl(await createS3Client(), command)
        // const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
        return { signedUrl, key: uploadParams.Key }
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error
    }
}

export const generateSignedUrlForSummary = async (fileName: string, fileType: string, name: string) => {
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `summary/${name}/${fileName}`,
        ContentType: fileType,
        acl: "public-read"
    }
    try {
        const command = new PutObjectCommand(uploadParams)
        const signedUrl = await getSignedUrl(await createS3Client(), command)
        // const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
        return { signedUrl, key: uploadParams.Key }
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error
    }
}

export const generateSignedUrlForCollection = async (fileName: string, fileType: string, name: string) => {
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `summary/${name}/${fileName}`,
        ContentType: fileType,
        acl: "public-read"
    }
    try {
        const command = new PutObjectCommand(uploadParams)
        const signedUrl = await getSignedUrl(await createS3Client(), command)
        // const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
        return { signedUrl, key: uploadParams.Key }
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error
    }
}

export const generateSignedUrlForBookLives = async (fileName: string, fileType: string, name: string) => {
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `summary/${name}/${fileName}`,
        ContentType: fileType,
        acl: "public-read"
    }
    try {
        const command = new PutObjectCommand(uploadParams)
        const signedUrl = await getSignedUrl(await createS3Client(), command)
        // const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
        return { signedUrl, key: uploadParams.Key }
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error
    }
}

export const generateSignedUrlForCategory = async (fileName: string, fileType: string, name: string) => {
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `summary/${name}/${fileName}`,
        ContentType: fileType,
        acl: "public-read"
    }
    try {
        const command = new PutObjectCommand(uploadParams)
        const signedUrl = await getSignedUrl(await createS3Client(), command)
        // const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
        return { signedUrl, key: uploadParams.Key }
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error
    }
}

export const generateSignedUrlForSubCategory = async (fileName: string, fileType: string, name: string) => {
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `summary/${name}/${fileName}`,
        ContentType: fileType,
        acl: "public-read"
    }
    try {
        const command = new PutObjectCommand(uploadParams)
        const signedUrl = await getSignedUrl(await createS3Client(), command)
        // const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
        return { signedUrl, key: uploadParams.Key }
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error
    }
}

export const generateUserProfilePicture = async (fileName: string, fileType: string, userEmail: string) => {
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `users/${userEmail}/${fileName}`,
        ContentType: fileType,
    }
    try {
        const command = new PutObjectCommand(uploadParams)
        const signedUrl = await getSignedUrl(await createS3Client(), command)
        return {signedUrl, key: uploadParams.Key}
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error
    }
}

export const generateAuthorsProfilePicture = async (fileName: string, fileType: string, userName: string) => {
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `authors/${userName}/${fileName}`,
        ContentType: fileType,
    }
    try {
        const command = new PutObjectCommand(uploadParams)
        const signedUrl = await getSignedUrl(await createS3Client(), command)
        return {signedUrl, key: uploadParams.Key}
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error
    }
}
export const generatePublishersProfilePicture = async (fileName: string, fileType: string, userEmail: string) => {
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `publishers/${userEmail}/${fileName}`,
        ContentType: fileType,
    }
    try {
        const command = new PutObjectCommand(uploadParams)
        const signedUrl = await getSignedUrl(await createS3Client(), command)
        return {signedUrl, key: uploadParams.Key}
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error
    }
}

// export const generateSignedUrlForUserProfile = async (fileName: string, fileType: string, userEmail: string) => {
//     const uploadParams = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: `users/${userEmail}/${fileName}`,
//         ContentType: fileType,
//     }
//     try {
//         const command = new PutObjectCommand(uploadParams)
//         const signedUrl = await getSignedUrl(await createS3Client(), command)
//         return signedUrl
//     } catch (error) {
//         console.error("Error generating signed URL:", error);
//         throw error
//     }
// }

export const deleteFileFromS3 = async (imageKey: string) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: imageKey,
    }
    try {
        const s3Client = await createS3Client()
        const command = new DeleteObjectCommand(params)
        const response = await s3Client.send(command)
        return response
    } catch (error) {
        console.error('Error deleting file from S3:', error)
        throw error
    }
}


// export const generateSignedUrlToGet = async (imageKey: string) => {
//     const params = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: imageKey,
//     }
//     try {
//         const command = new GetObjectCommand(params)
//         const url = await getSignedUrl(await createS3Client(), command)
//         return url;
//     } catch (error) {
//         throw error
//     }
// }

export const getImageUrl = async (subPath: string) => {
    return `${process.env.NEXT_PUBLIC_AWS_BUCKET_PATH}${subPath}`
}