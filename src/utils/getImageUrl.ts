import { getImageClientS3URL } from "@/config/axios";

export const getProfileImageUrl = (profilePic?: string | null): string => {
  if (profilePic && typeof profilePic === "string" && profilePic.startsWith("https")) {
    return profilePic;
  }
  return profilePic && getImageClientS3URL(profilePic) ;
};