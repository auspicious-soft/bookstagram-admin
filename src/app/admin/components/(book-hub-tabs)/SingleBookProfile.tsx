"use client";
import Image from "next/image";
import React, { useState } from "react";
import preview from "@/assets/images/preview.png"; 
import CustomSelect from "../CustomSelect";

const userData = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
]
const SingleBookProfile = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ authorName, setAutherName] = useState();
  const [formData, setFormData] = useState({
    nameOfBook: "",
    price: "",
    author: "",
    dob: "",
    phoneNumber: "",
    gender: "",
    state: "",
    city: "",
    address: "",
    about: "",
    preferredConsultation: "",
    preferredLanguage: "",
    startTime: "",
    endTime: "",
    image: "",
    repeatDays: [], // Initialize as an empty array
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData((prevData) => ({
          ...prevData,
          image: result,
        }));
      };
      reader.readAsDataURL(e.target.files[0]);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted: ", formData);
  };
  const handleUserChange = () => {
   setAutherName(authorName)
  };
  return (
    <form onSubmit={handleSubmit} className="form-box">
    <div className="grid grid-cols-[1fr_2fr] gap-5  ">
      <div>
        <div className="custom relative p-5 bg-white rounded-[20px]">
          
          {imagePreview ? (
            <div className="relative h-full">
              <Image
                src={imagePreview}
                alt="Preview"
                width={340}
                height={340}
                className="rounded-[10px] w-full h-full object-cover"
              />
              
            </div>
          ) : (
            <div className="grid place-items-center h-full w-full">
           
                <Image
                  src={preview}
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
            onClick={triggerFileInputClick}> Change Image </p>
        )}
        </div>
        </div>
        <div className="p-5 bg-white rounded-[20px] mt-5 ">
        <input type="file" className="border border-[#BDBDBD] py-5 rounded-[10px] px-5 bg-[#F5F5F5] w-full " />
        <button
            type="button"
            className="bg-orange text-white text-sm px-4 mt-4 py-[14px] text-center rounded-[28px] w-full"
          >Change File </button>
        </div>
      </div>
      <div className="main-form bg-white p-[30px] rounded-[30px] ">
        <div className="space-y-5 ">
         <label>Name of book
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.about}
              onChange={handleChange}
            />
            </label>
            <div> 
            <CustomSelect
            name="Select Author"
             value={authorName}
             options={userData}
             onChange={handleUserChange}
             placeholder="Select Author"
            />
            </div>
            <div>
            <button
            type="button"
            className="bg-orange text-white text-sm px-4 mt-5 py-[14px] text-center rounded-[28px] w-full"
          >Update Details</button>
            </div>
          </div>
      </div>
    </div>
    </form>
  );
};

export default SingleBookProfile;
