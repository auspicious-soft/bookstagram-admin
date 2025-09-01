'use client'
import { addNewCategory, getAllCategories } from '@/services/admin-services';
import React, { useState, useTransition } from 'react';
import useSWR from 'swr';
import CategoryCard from './CategoryCard';
import SearchBar from './SearchBar';
import Button from '@/app/components/Button';
import TablePagination from './TablePagination';
import { useRouter } from 'next/navigation';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import AddCommonModal from './AddCommonModal';
import categoryImg from '@/assets/images/categoryModal.png'
import { toast } from 'sonner';
import { generateSignedUrlForCategory } from '@/actions';
import { getProfileImageUrl } from '@/utils/getImageUrl';

type Language = "eng" | "kaz" | "rus";
interface FormValues {
  image: File | null;
  descriptionTranslations: {
    id: string;
    language: Language;
    content: string;
  }[];
}
const AllCategories = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState("");
  const { data, error, isLoading, mutate } = useSWR(`/admin/categories?description=${searchParams}&${query}`, getAllCategories);
  const category = data?.data?.data
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const addCategory = () => {
    setIsAddModalOpen(true);
  }
  const handleSubCategory = (id: string) => {
    router.push(`/admin/categories/${id}/sub-category`);
  }

  const handleSubmit = async (formData: FormValues) => {
    startTransition(async () => {
      try {
        let imageUrl = null;
        const summaryName = formData.descriptionTranslations[0].content?.split(" ").join("-").toLowerCase();

        if (formData.image) {
          const { signedUrl, key } = await generateSignedUrlForCategory(formData.image.name, formData.image.type, summaryName);

          const uploadResponse = await fetch(signedUrl, {
            method: 'PUT',
            body: formData.image,
            headers: {
              'Content-Type': formData.image.type,
            },
          });
          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image to S3');
          }
          imageUrl = key;
        }
        const nameTransforms = formData.descriptionTranslations.reduce((acc, curr) => ({
          ...acc,
          [curr.language]: curr.content
        }), {});

        const payload = {
          name: nameTransforms,
          image: imageUrl,
        };

        const response = await addNewCategory("/admin/categories", payload);

        if (response?.status === 201) {
          toast.success("Summary added successfully");
          setIsAddModalOpen(false);
          // Trigger revalidation instead of page reload
          mutate();
        } else {
          toast.error("Failed to add summary");
        }
      } catch (error) {
        console.error("Error", error);
        toast.error("An error occurred while adding the summary");
      }
    });
  };


  return (
    <div>
      <div className="flex gap-2.5 justify-end mb-5 ">
        <SearchBar setQuery={setsearchParams} query={searchParams} />
        <div><Button text="Add A New Category" onClick={addCategory} /></div>
      </div>
      <div className='grid grid-cols-4 gap-6'>
        {category?.length === 0 && <p className="text-center text-gray-500">No data found.</p>}
        {category?.map((row: any) => (

          <CategoryCard
            key={row?._id}
            name={
              row?.name?.eng ??
              row?.name?.kaz ??
              row?.name?.rus ??
              ''
            }
            image={getProfileImageUrl(row?.image)}
            onClick={() => handleSubCategory(row?._id)}
          />

        ))}
      </div>
      <div className="mt-10 flex justify-end">
        <TablePagination
          setPage={handlePageChange}
          page={page}
          totalData={data?.data?.total}
          itemsPerPage={itemsPerPage}
        />
      </div>
      <AddCommonModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmit}
        buttonText="Create a Category"
        image={categoryImg}
        title="Add a Category"
        labelname="Name of Category"
        disabled={isPending}
      />
    </div>
  );
}

export default AllCategories;
