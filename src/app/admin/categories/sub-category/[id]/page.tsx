'use client' 
import React, { useState, useTransition } from 'react';
import useSWR from 'swr';  
import Button from '@/app/components/Button'; 
import { useParams, useRouter } from 'next/navigation';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import BookCard from '@/app/admin/components/BookCard';
import SearchBar from '@/app/admin/components/SearchBar';
import { addBookToSubCategory, getSubCategoryData } from '@/services/admin-services';
import TablePagination from '@/app/admin/components/TablePagination';
import AddToBookCommon from '@/app/admin/components/AddToBookCommon';
import { toast } from 'sonner';


const Page = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const {id} = useParams();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState("");
  const { data, error, isLoading, mutate } = useSWR(`/admin/sub-categories/${id}`, getSubCategoryData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]); 
  const [bookModal, setBookModal] = useState(false); 
  const books = data?.data?.data?.books
  // const books = data?.data?.data?.books

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const openBookProfile =(id: string, name: string) => {
    localStorage.setItem("getbookName", name);
    router.push(`/admin/books/${id}`)
  }
  const handleAddBookToSubCategory = async() => {
    try {
      const payload = {
        booksId: selectedBooks
      };

     startTransition(async () => {
        const response = await addBookToSubCategory(`/admin/sub-categories/${id}/add`, payload);

        if (response.status===200 ) {
          toast.success("Books added to Sub-category successfully");
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
    <div>
      <div className="flex gap-2.5 justify-end mb-5 ">
        <SearchBar setQuery={setsearchParams} query={searchParams} />
        <div><Button text="Add to Sub-Category" onClick={()=>setBookModal(true)} /></div>
      </div> 
      {isLoading && (
        <p className="text-center text-gray-500">Loading...</p>
      )}

      {error && (
        <p className="text-center text-red-500">Failed to load data. Please try again.</p>
      )}

       {!isLoading && !error && books?.length === 0 && (
        <p className="text-center text-gray-500">No data found.</p>
      )}

       {!isLoading && !error && books?.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-6">
            {books.map((row: any) => (
              <BookCard 
              handleClick={()=>openBookProfile(row?._id, row?.name.eng)}
                key={row?._id}
                author={row?.authorId?.[0]?.name?.eng}
                title={row?.name?.eng}
                price={`$${row?.price}`}
                imgSrc={getImageClientS3URL(row?.image)}
              />
            ))}
          </div>
          
        <div className="mt-10 flex justify-end">
        <TablePagination
          setPage={handlePageChange}
          page={page}
          totalData={books?.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
      </>
      )}
   <AddToBookCommon
        open={bookModal}
        onClose={() => setBookModal(false)}
        title="Add books to Sub-Category"
        selectedBooks={selectedBooks}
        onSelectBooks={setSelectedBooks}
        handleSubmit={handleAddBookToSubCategory} 
        isPending={isPending}    
      />   
     
    </div>
  );
}

export default Page;
