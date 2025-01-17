export const getImageClientS3URL = (key: string) => {
    return `${process.env.NEXT_PUBLIC_AWS_BUCKET_PATH}${key}`
}