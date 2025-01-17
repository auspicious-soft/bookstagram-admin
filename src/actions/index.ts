
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
        console.log('res:', res.data); 
        
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

// export const generateSignedUrlOfProjectAttachment = async (fileName: string, fileType: string, userEmail: string) => {
//     const uploadParams = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: `projects/${userEmail}/attachments/${fileName}`,
//         ContentType: fileType,
//     }
//     try {
//         const command = new PutObjectCommand(uploadParams)
//         const signedUrl = await getSignedUrl(await createS3Client(), command)
//         return {signedUrl, key: uploadParams.Key}
//     } catch (error) {
//         console.error("Error generating signed URL:", error);
//         throw error
//     }
// }


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

// export const deleteFileFromS3 = async (imageKey: string) => {
//     const params = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: imageKey,
//     }
//     try {
//         const s3Client = await createS3Client()
//         const command = new DeleteObjectCommand(params)
//         const response = await s3Client.send(command)
//         return response
//     } catch (error) {
//         console.error('Error deleting file from S3:', error)
//         throw error
//     }
// }


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

// export const getImageUrl = (subPath: string): string => {
//     return `${process.env.NEXT_PUBLIC_AWS_BUCKET_PATH}${subPath}`
// }