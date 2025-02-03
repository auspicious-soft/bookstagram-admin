'use client'
import { addNewCollection, getAllCollection, updateCollectionStatus } from '@/services/admin-services';
import React, { useState, useTransition } from 'react';
import useSWR from 'swr';
import CategoryCard from './CategoryCard';
import SearchBar from './SearchBar';
import Button from '@/app/components/Button';
import TablePagination from './TablePagination';
import { useRouter } from 'next/navigation';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import AddCommonModal from './AddCommonModal';
import bookImg from '@/assets/images/collection.png'
import { toast } from 'sonner';
import { generateSignedUrlForCollection } from '@/actions';

type Language = "eng" | "kaz" | "rus";
interface FormValues {
  image: File | null;
  descriptionTranslations: {
    id: string;
    language: Language;
    content: string;
  }[];
}


const AllCollections = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState("");
  const { data, error, isLoading, mutate } = useSWR(`/admin/collections?description=${searchParams}&${query}`, getAllCollection);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const collections = data?.data?.data

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const addCollection = ()=>{ 
    setIsAddModalOpen(true);
  }
  
  const handleSubCollection = (id: string) => {
    router.push(`/admin/collection/${id}`); 
  }

  const handleSubmit = async (formData: FormValues) => {
    startTransition(async () => {
      try {
        let imageUrl = null;
        const summaryName = formData.descriptionTranslations[0].content.split(" ").join("-").toLowerCase();

        if (formData.image) {
          const { signedUrl, key } = await generateSignedUrlForCollection(formData.image.name, formData.image.type,summaryName);

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

        const response = await addNewCollection("/admin/collections", payload);

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

  const updateCollection = async(id: string) => {
    try {
      // Find the current collection to get its displayOnMobile status
      const currentCollection = collections.find((collection: any) => collection._id === id);
      
      // Create payload with opposite of current displayOnMobile status
      const payload = {
        displayOnMobile: !currentCollection?.displayOnMobile
      };
      console.log('payload:', payload);
      
      startTransition(async () => {
        const response = await updateCollectionStatus(`/admin/collections/${id}`, payload);
        if (response.status === 200) {
          toast.success("Status updated successfully");
          mutate(); // Refresh the data
        } else {
          toast.error("Failed to update status");
        }
      });
    } catch (error) {
      console.error("Error", error);
      toast.error("An error occurred while updating the collection status");
    }
  };

  return (
    <div>
       <div className="flex gap-2.5 justify-end mb-5 ">
        <SearchBar setQuery={setsearchParams} query={searchParams} />
         <div><Button text="Add A New collection" onClick={addCollection} /></div>
      </div>
       <div className='grid grid-cols-4 gap-6'>
            {collections?.map((row: any) => (
            <CategoryCard 
            key={row?._id}
            name={row?.name.eng}
            image={getImageClientS3URL(row?.image)}
            onClick={()=>handleSubCollection(row?._id)}
            displayMobile={row?.displayOnMobile}
            selected={selectedBooks.includes(row?._id)}
            onSelect={() => updateCollection(row?._id)}
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
        buttonText="Create a Collection"
        image={bookImg}
        title="Add a Collection"
        labelname="Name of Collection"
      />
    </div>
  );
}

export default AllCollections;
