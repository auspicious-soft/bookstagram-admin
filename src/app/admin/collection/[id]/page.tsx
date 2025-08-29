'use client' 
import React, { useState } from 'react';
import useSWR from 'swr';  
import Button from '@/app/components/Button'; 
import { useParams, useRouter } from 'next/navigation';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import { getSingleCollection } from '@/services/admin-services';
import SearchBar from '../../components/SearchBar';
import BookCard from '../../components/BookCard';
import TablePagination from '../../components/TablePagination';
import AddToSummaryModal from '../../components/AddToSummaryModal';
import AddToCollection from '../../components/AddToCollection';

const Page = () => {
  const router = useRouter();
  const {id} = useParams();
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState("");
  const { data, error, isLoading, mutate } = useSWR(`/admin/collections/${id}?description=${searchParams}&${query}`, getSingleCollection);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const books = data?.data?.data?.booksId

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const addToCOllections = ()=>{
    setIsModalOpen(true)
  }
  const openBookProfile =(id: string, name: string) => {
    localStorage.setItem("getbookName", name);
    router.push(`/admin/books/${id}`)
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
                handleClick={()=>openBookProfile(row?._id, row?.name?.eng)}
                author={row?.authorId?.[0]?.name?.eng}
                title={row?.name?.eng}
                price={`$${row?.price}`}
                imgSrc={getImageClientS3URL(row?.image)}
                format={row?.format}

              />
            ))}
          </div>
          
        <div className="mt-10 flex justify-end">
        <TablePagination
          setPage={handlePageChange}
          page={page}
          totalData={data?.data?.data?.booksId?.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
      </>
      )}

      <AddToCollection
      mutate={mutate}
      open={isModalOpen}
      onClose= {()=>setIsModalOpen(false)}
      id= {id}
      />
     
    </div>
  );
}

export default Page;
