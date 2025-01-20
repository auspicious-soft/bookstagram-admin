"use client";
import Image from "next/image";
import React, { useEffect, useState, useTransition } from "react";
import preview from "@/assets/images/preview.png"; 
import useSWR from "swr";
import { getSingleUsers, updateSingleUser } from "@/services/admin-services";
import { deleteFileFromS3, generateUserProfilePicture, getImageUrl } from "@/actions";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import { toast } from "sonner";
interface Props {
  id: any;
}
const UserProfile = ({id}: Props) => {

  const {data, isLoading, error, mutate} = useSWR(`/admin/users/${id}`, getSingleUsers)
  const userData = data?.data?.data;
  const profileData = userData?.data;
  console.log('profileData:', profileData); 
  const [isPending, startTransition] = useTransition();
  const oldImage = profileData?.profilePic;
  const [imagePreview, setImagePreview] = useState<string | null>(null); //getImageClientS3URL
  const [formData, setFormData] = useState<any>({
    fullName: "",
    email: "",
    phoneNumber: "",
    countryCode: "",
    profilePic: "",
    password: "",
    condfirmPassword: "",
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        fullName: profileData.fullName || "",
        phoneNumber: profileData.phoneNumber || "",
        email: profileData.email || "",
        countryCode: profileData.countryCode ||"",
        password: profileData.password || "",
        profilePic: profileData?.profilePic || null,
      });
      console.log('profileData?.user?.profilePic:', profileData?.profilePic);
      if (profileData?.profilePic) {
        setImagePreview(getImageClientS3URL(profileData.profilePic));
      }
    }
  }, [profileData]);

  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prevData => ({
          ...prevData,
          profilePic: file, // Store the actual file
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };


  const triggerFileInputClick = () => {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const getImageSource = () => {
    if (imagePreview) {
      return imagePreview;
    }
    if (formData.profilePic && typeof formData.profilePic === 'string') {
      const url= getImageClientS3URL(formData.profilePic);
      console.log('url:', url);
    }
    return preview;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (formData.profilePic instanceof File) {
          const fileName = formData.profilePic.name + '-' + new Date().getTime()
          const email = formData.email
          const uploadUrl: any = await generateUserProfilePicture(fileName, formData.profilePic.type, email)
          await fetch(uploadUrl, {
            method: 'PUT',
            body: formData.profilePic,
            headers: {
              'Content-Type': formData.profilePic.type,
            },
          })
          if (oldImage) {
            await deleteFileFromS3(oldImage)
          }
          formData.profilePic = `users/${email}/${fileName}`
        }
        console.log('formData:', formData);
        const response = await updateSingleUser(`/admin/users/${id}`, formData);
        if (response?.status === 200) { 
          toast.success("User details updated successfully", { position: 'bottom-left' });
          // formData.profilePic instanceof File ? window.location.reload() : mutate()
        } else {
          toast.error("Failed to add User Data");
        }
      } catch (error) {
        console.error("Der opstod en fejl", error);
        toast.error("Der opstod en fejl");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-box">
    <div className="grid grid-cols-[1fr_2fr] gap-5  ">
      <div>
        <div className="custom relative p-5 bg-white rounded-[20px]">
        {/* <Image
                unoptimized
                src={getImageSource()}
                alt="Profile preview"
                width={340}
                height={340}
                className="rounded-[10px] w-full h-full object-cover"
              /> */}
            {imagePreview ? (
            <div className="relative ">
              <Image
              unoptimized
                src={imagePreview}
                alt="Preview"
                width={340}
                height={340}
                className="rounded-[10px] w-full h-full object-cover"
              />
              
            </div>
          ) : (
            <div className="grid place-items-center">
           
                <Image unoptimized
                  src={getImageClientS3URL(formData?.profilePic)}
                  alt="upload"
                  width={340}
                  height={340}
                  className="rounded-[10px] w-full"
                /> 
            </div>
          )}
           <div className="relative mt-5 ">
             <input
            className="absolute top-0 left-0 h-full w-full opacity-0 p-0 cursor-pointer"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
         {imagePreview ? (
          <button
            type="button"
            onClick={triggerFileInputClick}
            className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] w-full"
          >Edit </button>
        ) : (
          <p className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] cursor-pointer"
            onClick={triggerFileInputClick}> Upload Image </p>
        )}
        </div>
        </div>
      </div>
      <div className="main-form bg-white p-[30px] rounded-[30px] ">
        <div className="space-y-5 ">
         <label>Name of User
            <input
              type="text"
              name="fullName"
              placeholder="First Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            </label>
            <label>Email Address
             <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="kjbdsfijdasfn@mail.com" required /> 
            </label>
            <label>Phone Number
              <div className="grid grid-cols-[74px_1fr] gap-[5px]">
                <input type="text" name="countryCode" value={formData.countryCode} placeholder="+91" />
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="1234567890"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                /> 
              </div>
            </label>
           <div className="flex gap-[5px] ">
           <label>Password
              <input type="password" name="password" value={formData.password} onChange={handleChange} required/>
            </label>
            {/* <label>Confirm Password
              <input type="password" name="password" value={formData.condfirmPassword} onChange={handleChange} required />
            </label> */}
           </div>
            <div>
            <button
            type="submit"
            className="bg-orange text-white text-sm px-4 mt-5 py-[14px] text-center rounded-[28px] w-full"
          >Update Details</button>
            </div>
          </div>
      </div>
    </div>
    </form>
  );
};

export default UserProfile;
