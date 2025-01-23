"use client";
import React, { FormEvent, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import preview from "@/assets/images/preview.png";
import { toast } from "sonner";
import { deleteFileFromS3, generatePublishersProfilePicture } from "@/actions";
import {
  getSinglePublisher,
  updateSinglePublisher,
} from "@/services/admin-services";
import CustomSelect from "@/app/components/CustomSelect";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import UseCategory from "@/utils/useCategory";
import { useSession } from "next-auth/react";
import BookCard from "@/app/admin/components/BookCard";

const Page = () => {
  const { id } = useParams(); 
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const { category } = UseCategory();
  const { data: publisherResponse, mutate } = useSWR(`/admin/publishers/${id}`,getSinglePublisher);
  const publishersData = publisherResponse?.data?.data?.publisher;
  const book = publisherResponse?.data?.data?.booksCount;
  const bookData = publisherResponse?.data?.data?.publisherBooks;
  const session = useSession()
  const role= (session as any)?.data?.user?.role 

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    image: null,
    description: "",
    categoryId: [],
    country: "",
  });

  useEffect(() => {
    if (publishersData && category && !isFormInitialized) {
      try {
        // Transform publisher's categoryId array into the format expected by CustomSelect
        const selectedCategories = Array.isArray(publishersData.categoryId)
          ? publishersData.categoryId.map((catId) => {
              const id = typeof catId === "object" ? catId._id : catId;
              const foundCategory = category.find((cat) => cat.value === id);
              return foundCategory || { value: id, label: id };
            })
          : [];

        setFormData({
          name: publishersData.name || "",
          email: publishersData.email || "",
          password: publishersData.password || "",
          image: publishersData.image || null,
          categoryId: selectedCategories,
          description: publishersData.description || "",
          country: publishersData.country || "",
        });

        if (publishersData.image) {
          const imageUrl = getImageClientS3URL(publishersData.image);
          setImagePreview(imageUrl);
        }

        setIsFormInitialized(true);
      } catch (error) {
        console.error("Error initializing form:", error);
      }
    }
  }, [publishersData, category, isFormInitialized]);

  const handleCategoryChange = (selectedOptions: any) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: selectedOptions || [],
    }));
  };

  const triggerFileInputClick = () => {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fileInput?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        let profilePicKey = formData.image;
        if (imageFile) {
          const { signedUrl, key } = await generatePublishersProfilePicture(
            imageFile.name,
            imageFile.type,
            formData.email
          );

          const uploadResponse = await fetch(signedUrl, {
            method: "PUT",
            body: imageFile,
            headers: {
              "Content-Type": imageFile.type,
            },
            cache: "no-store",
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload image");
          }

          if (publishersData?.image) {
            await deleteFileFromS3(publishersData.image);
          }
          profilePicKey = key;
        }

        const payload = {
          ...formData,
          image: profilePicKey,
          categoryId: formData.categoryId.map(
            (category: any) => category.value
          ),
        };

        const response = await updateSinglePublisher(
          `/admin/publishers/${id}`,
          payload
        );

        if (response?.status === 200) {
          toast.success("Publisher details updated successfully");
          mutate();
        } else {
          toast.error("Failed to update publisher");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred while updating the publisher");
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="form-box">
        <div className="grid grid-cols-[1fr_2fr] gap-5">
          <div>
            <div className="custom relative p-5 bg-white rounded-[20px]">
              {imagePreview ? (
                <div className="relative">
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
                  <Image
                    unoptimized
                    src={preview}
                    alt="upload"
                    width={340}
                    height={340}
                    className="rounded-[10px] w-full"
                  />
                </div>
              )}
              <div className="main-form mt-4">
                <label>
                  Name of Publisher
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                  />
                </label>
              </div>
              <div className="relative mt-4">
                <input
                  className="absolute top-0 left-0 h-full w-full opacity-0 p-0 cursor-pointer"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <button
                  type="button"
                  onClick={triggerFileInputClick}
                  className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] w-full"
                >
                  Upload Image
                </button>
              </div>
            </div>
          </div>
          <div className="main-form bg-white p-[30px] rounded-[20px]">
            <div className="space-y-5">
            {(role === 'admin' &&  <div className="grid grid-cols-2 gap-5">
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email.."
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="***"
                    required
                  />
                </label>
              </div>
              )}
              <label>
                Number of Books Released
                <input type="text" value={book} placeholder="123" readOnly
                className="!text-orange border border-orange !bg-white"
                />
              </label>
              <CustomSelect
                name="Categories"
                isMulti={true}
                value={formData.categoryId}
                options={category}
                onChange={handleCategoryChange}
                placeholder="Selected Categories"
              />
              <label>
                Country
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Enter Name"
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add Description..."
                ></textarea>
              </label>
              <div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-orange text-white text-sm px-4 mt-5 py-[14px] text-center rounded-[28px] w-full"
                >
                  {isPending ? "Updating..." : "Update Publisher"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      <div className='mt-8'>
      <h2 className='text-[32px] text-darkBlack font-aeonikRegular tracking-[0.16px] capitalize'>Books By The Publisher</h2>
      <div className='grid grid-cols-4 gap-6 mt-5 '>
        {bookData?.map((data: any)=>(
        <BookCard 
        key={data?._id}
        title={data?.name}
        price={`$${data?.price}`}
        // imgSrc={preview}
        imgSrc={getImageClientS3URL(data?.image)}
        author={data?.authorId[0]?.name}
        />
        ))}
    </div>
    </div>
    </div>
  );
};

export default Page;
