'use client' 
import React, { useState } from 'react';
import useSWR from 'swr';  
import Button from '@/app/components/Button'; 
import { useParams, useRouter } from 'next/navigation';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import BookCard from '@/app/admin/components/BookCard';
import SearchBar from '@/app/admin/components/SearchBar';
import { getSubCategoryData } from '@/services/admin-services';
import TablePagination from '@/app/admin/components/TablePagination';


const Page = () => {
  const router = useRouter();
  const {id} = useParams();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState("");
  const { data, error, isLoading, mutate } = useSWR(`/admin/sub-categories`, getSubCategoryData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log('SubBoks', data?.data?.data);
  const books = data?.data?.data 

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const addToCOllections = ()=>{
    setIsModalOpen(true)
  }
  
  return (
    <div>
       <div className="flex gap-2.5 justify-end mb-5 ">
        <SearchBar setQuery={setsearchParams} query={searchParams} />
         <div><Button text="Add to Collection" onClick={addToCOllections} /></div>
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

      {/* <AddToCollection
      mutate={mutate}
      open={isModalOpen}
      onClose= {()=>setIsModalOpen(false)}
      id= {id}
      /> */}
     
    </div>
  );
}

export default Page;
