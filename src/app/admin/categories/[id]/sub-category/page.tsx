'use client'
import { addSubCategory, getSubCategory } from '@/services/admin-services';
import React, { useState, useTransition } from 'react';
import useSWR from 'swr';
import Button from '@/app/components/Button';
import { useParams, useRouter } from 'next/navigation';
import SearchBar from '@/app/admin/components/SearchBar';
import CategoryCard from '@/app/admin/components/CategoryCard';
import TablePagination from '@/app/admin/components/TablePagination';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import subCatImg from '@/assets/images/subCat.png'
import { toast } from 'sonner';
import AddCommonModal from '@/app/admin/components/AddCommonModal';
import { generateSignedUrlForSubCategory } from '@/actions';

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
  const {id} = useParams();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState("");
  const { data, error, isLoading, mutate } = useSWR(`/admin/categories/${id}/sub-categories?description=${searchParams}&${query}`, getSubCategory);
  const subCategory = data?.data?.data
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const addNewSubCategory = ()=>{
    setIsAddModalOpen(true)
  }
  
  const handleSubCategory = (id: string,  name: string) => {
    //router.push(`/admin/categories/sub-category/${id}?name=${name}`); 
  }

  const handleSubmit = async (formData: FormValues) => {
    startTransition(async () => {
      try {
        let imageUrl = null;
        const summaryName = formData.descriptionTranslations[0].content.split(" ").join("-").toLowerCase();

        if (formData.image) {
          const { signedUrl, key } = await generateSignedUrlForSubCategory(formData.image.name, formData.image.type,summaryName);

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
          categoryId: id,
          name: nameTransforms,
          image: imageUrl,
        };

        const response = await addSubCategory("/admin/sub-categories", payload);

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
         <div><Button text="Add A Sub-Category" onClick={addNewSubCategory} /></div>
      </div>
       <div className='grid grid-cols-4 gap-6'>
            {subCategory?.map((row: any) => (
            <CategoryCard 
            key={row?._id}
            name={row?.name.eng}
            image={getImageClientS3URL(row?.image)}
            onClick={()=>handleSubCategory(row?._id, row?.name)}
            />
            ))}
        </div>
        <div className="mt-10 flex justify-end">
        <TablePagination
          setPage={handlePageChange}
          page={page}
          totalData={subCategory?.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
      <AddCommonModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmit}
        buttonText="Create a Sub-Category"
        image={subCatImg}
        title="Add a Sub-Category"
        labelname="Name of Sub-Category"
      />
    </div>
  );
}

export default Page;
