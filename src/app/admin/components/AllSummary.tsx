'use client'
import { getAllCategories, getAllSummary } from '@/services/admin-services';
import React, { useState } from 'react';
import useSWR from 'swr';
import CategoryCard from './CategoryCard';
import SearchBar from './SearchBar';
import Button from '@/app/components/Button';
import TablePagination from './TablePagination';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';

const AllSummary = () => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState("");
  const { data, error, isLoading } = useSWR(`/admin/summaries?description=${searchParams}&${query}`, getAllSummary);
  const summary = data?.data?.data

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const addNewCategory = ()=>{
    // Add new category logic here.
    console.log('add new category clicked');
  }
  
  const handleCategory = (categoryId: string) => {
    // Add category selected logic here.
    console.log('category selected:', categoryId);
  }
  return (
    <div>
       <div className="flex gap-2.5 justify-end mb-5 ">
        <SearchBar setQuery={setsearchParams} query={searchParams} />
         <div><Button text="Add A New Summary" onClick={addNewCategory} /></div>
      </div>
       <div className='grid grid-cols-4 gap-6'>
            {summary?.map((row: any) => (
            <CategoryCard 
            key={row?._id}
            name={row?.name}
            image={getImageClientS3URL(row?.image)}
            onClick={()=>handleCategory(row?._id)}
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


export default AllSummary;
