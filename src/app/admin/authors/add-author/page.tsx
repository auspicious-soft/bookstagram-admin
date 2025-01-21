'use client'
import React, { FormEvent, useState, useTransition } from 'react';
import Image from "next/image";
import preview from "@/assets/images/preview.png"; 
import { toast } from 'sonner';
import { generateAuthorsProfilePicture } from '@/actions';
import { addNewAuthor } from '@/services/admin-services';
import CustomSelect from '@/app/components/CustomSelect';

const professions = [
    { value: "poet", label: "Poet" },
    { value: "writer", label: "Writer" },
    { value: "artist", label: "Artist" },
  ];

  const genresOptions = [
    { value: "fiction", label: "Fiction" },
    { value: "non-fiction", label: "Non-Fiction" },
    { value: "poetry", label: "Poetry" },
  ];
const Page = () => {
    const [isPending, startTransition] = useTransition();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    // const [ profession, setProfession] = useState();
    // const [ genres, setGenres] = useState();


    const [formData, setFormData] = useState<any>({
        name: "",
        profession: [],
        country: "",
        dob: "",
        genres: [],
        image: null,
        description: "",
    });

    const handleProfessionChange = (selectedOptions: any) => { 
        const selectedValues = selectedOptions.map((option: any) => option.value);
        setFormData((prevData: any) => ({
          ...prevData,
          profession: selectedValues,
        }));
      };

    const handleGenresChange = (selectedOptions: any) => { 
        const selectedValues = selectedOptions.map((option: any) => option.value);
        setFormData((prevData: any) => ({
          ...prevData,
          genres: selectedValues,
        }));
      };

  const triggerFileInputClick = () => {
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
  };

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const userName = (formData.name).split(" ").join("-").toLowerCase() +"-" + formData.dob;
    console.log('userName:', userName);
    e.preventDefault();
    startTransition(async () => {
    try {
        let profilePicKey = null;
        if (imageFile) {
         const { signedUrl, key } = await generateAuthorsProfilePicture(imageFile.name, imageFile.type, userName);

        const uploadResponse = await fetch(signedUrl, {
                method: 'PUT',
                body: imageFile,
                headers: {
                    'Content-Type': imageFile.type,
                },
            });
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image to S3');
            }
            profilePicKey = key;
        }
        const payload = {
            ...formData,
            image: profilePicKey, 
        };
        console.log('payload:', payload);
        const response = await addNewAuthor("/admin/authors", payload);
        console.log('response:', response);
        
        if (response?.status === 201) {
            toast.success("User added successfully");
        window.location.href = "/admin/authors"
        } else {
            toast.error( "Failed to add user");
        }
    } catch (error) {
        console.error("Error", error);
        toast.error("An error occurred while adding the user");
    }
    });
  };
return (
    <div> 
    <form onSubmit={handleSubmit} className="form-box">
    <div className="grid grid-cols-[1fr_2fr] gap-5  ">
      <div>
        <div className="custom relative p-5 bg-white rounded-[20px] h-full">
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
            <div className='main-form mt-4 '>
            <label htmlFor="">Name of Author
                <input type="text" name='name' value={formData.name} onChange={handleChange} placeholder='Name' required />
            </label>
            </div>
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
         <label>
         <CustomSelect
         name='Profession'
            isMulti={true}
           value={professions.filter((option) =>
          formData.profession.includes(option.value)
        )} 
            options={professions}
            onChange={handleProfessionChange}
            placeholder="Selected Profession"
          />
            </label>
            <div className="grid grid-cols-2 gap-[5px] ">
           <label>Country
              <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder='Enter Name' required/>
            </label>
            <label>Date Of Birth
              <input type="date" name="dob" value={formData.dob} onChange={handleChange}  required />
            </label>
           </div>
            <CustomSelect
            name='Genres'
            isMulti={true}
            value={genresOptions.filter((option) =>
                formData.genres.includes(option.value)
              )}
            options={genresOptions}
            onChange={handleGenresChange}
            placeholder="Selected Genres"
          />
            <label>Description
            <textarea rows={5} name="description" value={formData.description} onChange={handleChange} placeholder="Add Description..."></textarea>
            </label>
           
            <div>
            <button
            type="submit" disabled={isPending}
            className="bg-orange text-white text-sm px-4 mt-5 py-[14px] text-center rounded-[28px] w-full"
          >{isPending ? " Saving..." :"Save"} </button>
            </div>
          </div>
      </div>
    </div> 
    </form>
    </div>
    );
}

export default Page;
