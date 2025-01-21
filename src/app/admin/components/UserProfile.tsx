"use client";
import Image from "next/image";
import React, { useEffect, useState, useTransition } from "react";
import preview from "@/assets/images/preview.png"; 
import useSWR from "swr";
import { getSingleUsers, updateSingleUser } from "@/services/admin-services";
import { deleteFileFromS3, generateUserProfilePicture, getImageUrl } from "@/actions";

import { toast } from "sonner";
import { DashboardIcon1, DashboardIcon2, DashboardIcon3, DashboardIcon4 } from "@/utils/svgicons";
import DashboardCard from "./DashboardCard";
import UserRecentOrder from "./UserRecentOrder";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
interface Props {
  id: any;
}
const UserProfile = ({id}: Props) => {
  const [user, setUser] = useState<string>("7");
  const { data, isLoading, error, mutate } = useSWR(`/admin/users/${id}`, getSingleUsers);
  const overviews= data?.data?.data;
  const profileData = data?.data?.data?.data;
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // const [imageDisplay, setImageDisplay] = useState<string | null>(null);
  console.log('imagePreview:', imagePreview);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<any>({
    fullName: "",
    email: "",
    phoneNumber: "",
    countryCode: "",
    profilePic: null,
    password: "",
    // condfirmPassword: "",
  });

  const OverviewData = [
      { id: "1", title: "Total Amount Paid", value: overviews?.amountPaid, icon: <DashboardIcon1/>},
      { id: "2", title: "New Books", value: overviews?.booksPurchasedCount, icon: <DashboardIcon2/>,},
      { id: "3", title: "Courses", value: overviews?.countCount, icon: <DashboardIcon3/>,},
      { id: "4", title: "Events", value: overviews?.Events, icon: <DashboardIcon4/>,},
  ];

  const handleUsersChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value;
      setUser(selectedValue);
  };

  useEffect(() => {
    if (profileData) {
      setFormData({
        fullName: profileData.fullName || "",
        phoneNumber: profileData.phoneNumber || "",
        email: profileData.email || "",
        countryCode: profileData.countryCode || "",
        password: profileData.password || "",
        profilePic: profileData.profilePic || "",
      });
      console.log('profileData.profilePic:', profileData.profilePic);

      if (profileData?.profilePic) {
       const imageUrl = getImageClientS3URL(profileData?.profilePic)?? '';
        setImagePreview(imageUrl);
      }
    }
  }, [profileData]);

  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setImagePreview(result);
        };
        reader.readAsDataURL(file);
    }
};

  const triggerFileInputClick = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    console.log('fileInput:', fileInput);
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const updatedFormData = { ...formData };
        if (imageFile) {  // Changed this to check for new image file
          const fileName = imageFile.name + '-' + new Date().getTime()
          const email = formData.email
          const uploadUrl: any = await generateUserProfilePicture(fileName, imageFile.type, email)
          await fetch(uploadUrl, {
            method: 'PUT',
            body: imageFile,
            headers: {
              'Content-Type': imageFile.type,
            },
          })

          if (formData?.profilePic) {
            await deleteFileFromS3(formData.profilePic);
          }

          updatedFormData.profilePic = `users/${formData.email}/${imageFile.name}`;
        }

        console.log('updatedFormData:', updatedFormData);

        const response = await updateSingleUser(`/admin/users/${id}`, updatedFormData);
        if (response?.status === 200) { 
          await mutate();
          toast.success("User details updated successfully", { position: 'bottom-left' });
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
    <div>
    <div className="grid grid-cols-[1fr_2fr] gap-5  ">
      <div>
      <div className="custom relative p-5 bg-white rounded-[20px] ">
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
            src={preview}
            alt="upload"
            width={340}
            height={340}
            className="rounded-[10px] w-full"
          /> 
            </div>
          )}
           <div className="relative mt-4 ">
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
          >Upload Image </button>
        ) : (
          <p className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] cursor-pointer"
            onClick={triggerFileInputClick}> Upload Image </p>
        )}
        </div>
        </div>
      </div>
      <div className="main-form bg-white p-[30px] rounded-[30px] ">
      <form onSubmit={handleSubmit} className="form-box">
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
              <input type="password" name="password" value={formData.password} onChange={handleChange}/>
            </label>
            {/* <label>Confirm Password
              <input type="password" name="password" value={formData.condfirmPassword} onChange={handleChange} required />
            </label> */}
           </div>
            <div>
            <button
            type="submit"
            className="bg-orange text-white text-sm px-4 mt-5 py-[14px] text-center rounded-[28px] w-full"
          >{isPending ? " Updating..." :"Update Details"} </button>
            </div>
          </div>
    </form>
      </div>
    </div>
    <div className='flex justify-between items-center mt-[30px]  '>
    <h2 className='text-[22px] text-darkBlack '>New Users</h2>
    <div>
        <select name="user" 
        value={user} 
        onChange={handleUsersChange} 
        className="py-[9px] px-[14px] rounded-[17px] ">
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        </select>
    </div>
    </div>
    <div className="grid grid-cols-4 gap-4 mt-5">
    {OverviewData.map((card) => (
            <DashboardCard
              key={card.id}
              icon={card.icon}
              title={card.title}
              value={card.value}
              backgroundColor="#fff"
            />
          ))}
    </div>
    <UserRecentOrder id={id}/>
    </div>
  );
};

export default UserProfile;
