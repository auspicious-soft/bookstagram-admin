'use client'
import { getAllCollection } from '@/services/admin-services';
import React, { useState } from 'react';
import useSWR from 'swr';
import CategoryCard from './CategoryCard';
import SearchBar from './SearchBar';
import Button from '@/app/components/Button';
import TablePagination from './TablePagination';
import { useRouter } from 'next/navigation';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';

const AllCollections = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState("");
  const { data, error, isLoading } = useSWR(`/admin/collections?description=${searchParams}&${query}`, getAllCollection);
  const collections = data?.data?.data

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const addNewCategory = ()=>{
    //router.push(`/admin/categories/sub-category?name=${name}`); 
    console.log('add new category clicked');
  }
  
  const handleSubCategory = (id: string) => {
    //router.push(`/admin/categories/${id}/sub-category`); 
  }
  return (
    <div>
       <div className="flex gap-2.5 justify-end mb-5 ">
        <SearchBar setQuery={setsearchParams} query={searchParams} />
         <div><Button text="Add A New collection" onClick={addNewCategory} /></div>
      </div>
       <div className='grid grid-cols-4 gap-6'>
            {collections?.map((row: any) => (
            <CategoryCard 
            key={row?._id}
            name={row?.name}
            image={getImageClientS3URL(row?.image)}
            onClick={()=>handleSubCategory(row?._id)}
            displayMobile={row?.displayOnMobile}
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
    </div>
  );
}

export default AllCollections;
