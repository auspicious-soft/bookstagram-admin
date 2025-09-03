'use client'
import React, { useState, useTransition } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/app/components/Button';
import SearchBar from '@/app/admin/components/SearchBar';
import CategoryCard from '@/app/admin/components/CategoryCard';
import TablePagination from '@/app/admin/components/TablePagination';
import AddCommonModal from '@/app/admin/components/AddCommonModal';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import { addBookToCategory, addSubCategory, getSubCategory, deleteBookLife } from '@/services/admin-services';
import { generateSignedUrlForSubCategory } from '@/actions';
import subCatImg from '@/assets/images/subCat.png';
import cartoon from '@/assets/images/1.png';
import BookCard from '@/app/admin/components/BookCard';
import AddToBookCommon from '@/app/admin/components/AddToBookCommon';
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

const Page = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setSearchParams] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [bookModal, setBookModal] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    `/admin/categories/${id}/sub-categories?description=${searchParams}&${query}`,
    getSubCategory
  );

  const subCategory = data?.data?.data?.subcategory ;
  const booksData = data?.data?.data?.books;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const handleSubCategory = (id: string, name: string) => {
    localStorage.setItem("subCategoryName", name);
    router.push(`/admin/categories/sub-category/${id}`);
  };

  const openBookProfile =(id: string, name: string) => {
    localStorage.setItem("getbookName", name);
    router.push(`/admin/books/${id}`)
  } 

  const deleteBookLives = (id: string) => {
  try {
    startTransition(async () => {
      const response = await deleteBookLife(`/admin/sub-categories/${id}`);
      if (response.data.success && (response.status === 200 || response.status === 201) ) {
        console.log('response: ', response.data.success);
        toast.success("Sub-Category deleted successfully");
        mutate();
      }
      else{
        toast.error(response.data.message );
      }
    });
  } catch (error) {
    console.log('error: ', error);
    if (error.response && error.response.status === 400) {
      toast.error(error.response.data.message || "Cannot delete category with existing subcategories");
    } else {
      toast.error("An unexpected error occurred while deleting the category");
    }
    console.log("error", error);
  }
};
  const handleAddSubmit = async (formData: FormValues) => {
    startTransition(async () => {
      try {
        let imageUrl = null;
        const summaryName = formData.descriptionTranslations[0]?.content?.split(" ").join("-").toLowerCase();
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

  const handleAddBookToCategory = async() => {
      try {
        const payload = {
          booksId: selectedBooks
        };
  
       startTransition(async () => {
          const response = await addBookToCategory(`/admin/categories/${id}/add`, payload);
  
          if (response.status===200 ) {
            toast.success("Books added to Book Masters successfully");
            mutate();
            setBookModal(false); 
            setSelectedBooks([]);
          } else {
            toast.error("Failed To add books");
          }
        });
      } catch (error) {
        console.error('Error adding books:', error);
        toast.error("An error occurred while adding books");
      }
  }

return (
  <div className="h-full">
       <div className="flex gap-2.5 justify-end mb-5">
           <SearchBar setQuery={setSearchParams} query={searchParams} />
           {subCategory?.length > 0 && <Button text="Add A Sub-Category" onClick={() => setIsAddModalOpen(true)} />}
           {booksData?.length > 0 && <Button text="Add A Book" onClick={() => setBookModal(true)} />}

       </div>

    {isLoading ? (
      <p className="text-center text-gray-500">Loading...</p>
    ) : subCategory?.length > 0 ? (
      <>
        {/* <div className="flex gap-2.5 justify-end mb-5">
          <Button text="Add A Sub-Category" onClick={() => setIsAddModalOpen(true)} />
        </div> */}
        <div className="grid grid-cols-4 gap-6">
          {subCategory?.map((row) => (
            <CategoryCard
              key={row?._id}
              name={row?.name?.eng || row?.name?.kaz || row?.name?.rus}
              image={getProfileImageUrl(row?.image)}
              onClick={() => handleSubCategory(row?._id, row?.name?.eng || row?.name?.kaz || row?.name?.rus)}
              handleDelete={()=>deleteBookLives(row?._id)}
            />
          ))}
        </div>
        <div className="mt-10 flex justify-end">
          <TablePagination
            setPage={handlePageChange}
            page={page}
            totalData={subCategory.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </>
    ) : booksData?.length > 0 ? (
      <>
        {/* <div className="flex gap-2.5 justify-end mb-5">
          <Button text="Add A Book" onClick={() => setBookModal(true)} />
        </div> */}
        <div className="grid grid-cols-4 gap-6">
          {booksData?.map((row) => (
            <BookCard
              handleClick={() => openBookProfile(row?._id, row?.name?.eng || row?.name?.kaz || row?.name?.rus)}
              key={row?._id}
              author={row?.authorId?.[0]?.name?.eng || row?.authorId?.[0]?.name?.kaz || row?.authorId?.[0]?.name?.rus}
              title={row?.name?.eng || row?.name?.kaz || row?.name?.rus}
              price={`$${row?.price}`}
              imgSrc={getProfileImageUrl(row?.image)}
              format={row?.format}
              discount={row?.discountPercentage}
            />
          ))}
        </div>
        <div className="mt-10 flex justify-end">
          <TablePagination
            setPage={handlePageChange}
            page={page}
            totalData={booksData.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </>
    ) : (
      <div className="h-full grid place-items-center">
        <div className="text-center">
          <Image src={cartoon} alt="cartoon" width={154} height={181} className="mx-auto" />
          <h2 className="text-[32px] text-darkBlack mt-5 mb-2.5">No Books Found Here!</h2>
          <p className="text-sm text-darkBlack mb-5">Add a book or a sub category.</p>
          <div className="flex justify-center gap-[9px]">
            <Button text="Add a Sub-Category" onClick={() => setIsAddModalOpen(true)} />
            <Button text="Add A Book" onClick={() => setBookModal(true)} />
          </div>
        </div>
      </div>
    )}

    <AddCommonModal
      open={isAddModalOpen}
      onClose={() => setIsAddModalOpen(false)}
      onSubmit={handleAddSubmit}
      buttonText="Create a Sub-Category"
      image={subCatImg}
      title="Add a Sub-Category"
      labelname="Name of Sub-Category"
      disabled={isPending}
    />

    <AddToBookCommon
      open={bookModal}
      onClose={() => setBookModal(false)}
      title="Add book to Category"
      selectedBooks={selectedBooks}
      onSelectBooks={setSelectedBooks}
      handleSubmit={handleAddBookToCategory}
      isPending={isPending}
    />
  </div>
);
};

export default Page;