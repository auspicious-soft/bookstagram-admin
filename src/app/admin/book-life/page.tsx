'use client'
import { getAllBookLives, addNewBookLife, deleteBookLife } from '@/services/admin-services';
import React, { useState, useTransition } from 'react';
import useSWR from 'swr';
import Button from '@/app/components/Button'; 
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL'; 
import sumImg from '@/assets/images/Summary.png';
import { toast } from 'sonner';
import { generateSignedUrlForBookLives } from '@/actions';
import { useRouter } from 'next/navigation';
import CategoryCard from '../components/CategoryCard';
import SearchBar from '../components/SearchBar';
import TablePagination from '../components/TablePagination';
import AddCommonModal from '../components/AddCommonModal';

type Language = "eng" | "kaz" | "rus";
interface FormValues {
  image: File | null;
  descriptionTranslations: {
    id: string;
    language: Language;
    content: string;
  }[];
}

const Page = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState("");
  const { data, error, isLoading, mutate } = useSWR(`/admin/book-lives?description=${searchParams}&${query}`, getAllBookLives);
  const bookLife = data?.data?.data;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const addNewSummary = () => {
    setIsAddModalOpen(true);
  };

  const openBookLife = (id: string) => {
    router.push(`/admin/book-life/${id}`) 
  };

  const handleSubmit = async (formData: FormValues) => {
    startTransition(async () => {
      try {
        let imageUrl = null;
        const summaryName = formData.descriptionTranslations[0].content.split(" ").join("-").toLowerCase();

        if (formData.image) {
          const { signedUrl, key } = await generateSignedUrlForBookLives(formData.image.name, formData.image.type,summaryName);

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

        const response = await addNewBookLife("/admin/book-lives", payload);

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
  const deleteBookLives = async (id: string) => {
    try {
      startTransition(async()=>{
      const response = await deleteBookLife(`/admin/book-lives/${id}`);
      if (response.status === 200) {
        toast.success("Deleted successfully");
        mutate()
      } else {
      toast.error("Failed To Delete Story");
      }
    });
    } catch (error) {
    toast.error("an Error Occurred While Deleting The Story");
    }
  }


  return (
    <div>
      <div className="flex gap-2.5 justify-end mb-5 ">
        <SearchBar setQuery={setsearchParams} query={searchParams} />
        <div><Button text="Add A New Category" onClick={addNewSummary} /></div>
      </div>
      <div className='grid grid-cols-4 gap-6'>
        {bookLife?.length > 0 ? (
          bookLife?.map((row: any) => (
            <CategoryCard
              key={row?._id}
              name={row?.name.eng}
              image={getImageClientS3URL(row?.image)}
              onClick={() => openBookLife(row?._id)}
              handleDelete={()=>deleteBookLives(row?._id)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">No data found.</p>
        )}
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
        buttonText="Create A Book Life"
        image={sumImg}
        title="Add a Book Life"
        labelname="Name of Book Life"
      />
    </div>
  );
};

export default Page;
