'use client'
import React, { useState } from 'react';
import Image from "next/image";
import preview from "@/assets/images/preview.png";
import { EditIcon } from '@/utils/svgicons';

const Page = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
        setImageFile(file);             
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
      if (fileInput) {
        fileInput.click();
      }
  };

  return (
    <div className='bg-white rounded-[20px] p-5 '>
      <div className="custom   max-w-[355px] mb-10">
      <div className='relative'>
      <input
        className="absolute top-0 left-0 h-full w-full opacity-0 !p-0 cursor-pointer"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
        {imagePreview ? (
            <div className="relative ">
              <Image
              unoptimized
                src={imagePreview}
                alt="Preview"
                width={355}
                height={457}
                className="rounded-[10px] w-full h-full object-cover"
              />
               <button
                  type="button"
                  onClick={triggerFileInputClick}
                  className="absolute -top-1 -right-1 bg-orange p-2.5 rounded-full "
                ><EditIcon/>
                </button>
            </div>
          ) : (
        <div className="grid place-items-center">
                <Image unoptimized
                  src={preview}
                  alt="upload"
                  width={355}
                  height={457}
                  className="rounded-[10px] w-full"
                /> 
            </div>
          )}
          </div>
            <div className='main-form mt-4 '>
            <label htmlFor="">Link 
              <input type="url" name="" placeholder='https://fatal-pocket.com' />
            </label>
            </div>
           {/* <div className="relative mt-4 ">
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
        </div> */}
        </div>
        <button className='w-full bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px] '>
        Add New Story
        </button>
    </div>
  );
}

export default Page;
