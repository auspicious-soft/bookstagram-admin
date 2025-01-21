'use client'
import React, { FormEvent, useEffect, useState, useTransition } from 'react';
import Image from "next/image";
import preview from "@/assets/images/preview.png"; 
import { toast } from 'sonner';
import { deleteFileFromS3, generateAuthorsProfilePicture } from '@/actions';
import { getSingleAuthor, updateSingleAuthor } from '@/services/admin-services';
import CustomSelect from '@/app/components/CustomSelect';
import useSWR, { mutate } from 'swr';
import { useParams } from 'next/navigation';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import BookCard from '@/app/admin/components/BookCard';

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
    const {id} = useParams(); 
    const [isPending, startTransition] = useTransition();
    const [imagePreview, setImagePreview] = useState<string | null>();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const {data, mutate} = useSWR(`/admin/authors/${id}`,  getSingleAuthor)
    const authorBooks = data?.data?.authorBooks 
    const authorData= data?.data?.data
    console.log('authorBooks:', authorBooks);
    

    const [formData, setFormData] = useState<any>({
        name: "",
        profession: [],
        country: "",
        dob: "",
        genres: [],
        image: null,
        description: "",
    });

    useEffect(() => {
        if (authorData) {
            const professionOptions = authorData.profession.map((prof: string) => ({
                value: prof,
                label: prof.charAt(0).toUpperCase() + prof.slice(1)
            }));
            const genreOptions = authorData.genres.map((genre: string) => ({
                value: genre,
                label: genre.charAt(0).toUpperCase() + genre.slice(1)
            }));
            const formattedDate = authorData.dob ? new Date(authorData.dob).toISOString().split('T')[0] : '';

          setFormData({
            name: authorData?.name || "",
            profession: professionOptions,
            country: authorData?.country || "", 
            dob: formattedDate, 
            genres: genreOptions,
            description: authorData?.description || "",
           
          })
    
          if (authorData?.image) {
            const imageUrl = getImageClientS3URL(authorData?.image)?? '';
            setImagePreview(imageUrl);
          }
        }
      }, [authorData]);

    const handleProfessionChange = (selectedOptions: any) => { 
        if (!selectedOptions) {
            setFormData(prevData => ({
                ...prevData,
                profession: []
            }));
            return;
        }
        setFormData(prevData => ({
            ...prevData,
            profession: selectedOptions  // Store complete option objects
        }));
      };

    const handleGenresChange = (selectedOptions: any) => { 
        if (!selectedOptions) {
            setFormData(prevData => ({
                ...prevData,
                genres: []
            }));
            return;
        }
        setFormData(prevData => ({
            ...prevData,
            genres: selectedOptions  // Store complete option objects
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
                 cache: 'no-store'
            });
            if (!uploadResponse.ok) {
                toast.error('Failed to upload image. Please try again');
                return;
            }
            
            if (authorData?.profilePic) {
                await deleteFileFromS3(authorData.profilePic);
            }
            profilePicKey = key;
        }
        const payload = {
            ...formData,
            image: profilePicKey, 
            profession: formData.profession.map((p: any) => p.value),
            genres: formData.genres.map((p: any) => p.value),
        };
        console.log('payload:', payload);
        const response = await updateSingleAuthor(`/admin/authors/${id}`, payload);
        console.log('response:', response);
        
        if (response?.status === 200) {
            toast.success("Author details updated successfully");
            mutate();
        } else {
            toast.error( "Failed to add author");
        }
    } catch (error) {
        console.error("Error", error);
        toast.error("An error occurred while adding the author");
    }
    });
  };
return (
    <div> 
    <form onSubmit={handleSubmit} className="form-box">
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
          >Upload Image </button>
        ) : (
          <p className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] cursor-pointer"
            onClick={triggerFileInputClick}> Upload Image </p>
        )}
        </div>
        </div>
      </div>
      <div className="main-form bg-white p-[30px] rounded-[20px] ">
        <div className="space-y-5 ">
         <label>
         <CustomSelect
         name='Profession'
            isMulti={true}
           value={formData.profession}
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
            value={formData.genres}
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
          >{isPending ? " Updating..." :"Update Details"} </button>
            </div>
          </div>
      </div>
    </div> 
    </form>

    <div className='mt-10'>
      <h2 className='text-[32px] text-darkBlack font-aeonikRegular tracking-[0.16px] capitalize'>Books By The Author</h2>
    <div className='grid grid-cols-4 gap-6 mt-5 '>
        {authorBooks?.map((data: any)=>(
        <BookCard 
        key={data?._id}
        title={data?.name}
        price={data?.price}
        // imgSrc={preview}
        imgSrc={getImageClientS3URL(data?.image)}
        author={authorData?.name}
        />
        ))}
    </div>
    </div>
    </div>
    );
}

export default Page;


