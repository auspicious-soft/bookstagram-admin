'use client'
import { getSubCategory } from '@/services/admin-services';
import React, { useState } from 'react';
import useSWR from 'swr';
import Button from '@/app/components/Button';
import { useParams, useRouter } from 'next/navigation';
import SearchBar from '@/app/admin/components/SearchBar';
import CategoryCard from '@/app/admin/components/CategoryCard';
import TablePagination from '@/app/admin/components/TablePagination';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';

const Page = () => {
  const router = useRouter();
  const {id} = useParams();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState("");
  const { data, error, isLoading } = useSWR(`/admin/categories/${id}/sub-categories?description=${searchParams}&${query}`, getSubCategory);
  console.log('data:', data);
  const subCategory = data?.data?.data

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const addNewCategory = ()=>{
    //router.push(`/admin/categories/sub-category?name=${name}`); 
    console.log('add new category clicked');
  }
  
  const handleSubCategory = (id: string,  name: string) => {
    console.log('id:', id);
    //router.push(`/admin/categories/sub-category/${id}?name=${name}`); 

  }
  return (
    <div>
       <div className="flex gap-2.5 justify-end mb-5 ">
        <SearchBar setQuery={setsearchParams} query={searchParams} />
         <div><Button text="Add A Sub-Category" onClick={addNewCategory} /></div>
      </div>
       <div className='grid grid-cols-4 gap-6'>
            {subCategory?.map((row: any) => (
            <CategoryCard 
            key={row?._id}
            name={row?.name}
            image={getImageClientS3URL(row?.image)}
            onClick={()=>handleSubCategory(row?._id, row?.name)}
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

export default Page;
