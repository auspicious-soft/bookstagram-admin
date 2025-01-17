'use client'
import React from 'react';
import catImg from '@/assets/images/category.png';
import CategoryCard from './CategoryCard';
import TablePagination from './TablePagination';
import SearchBar from './SearchBar';
import { PlusIcon } from '@/utils/svgicons';
const Category = () => {
    const category = Array(8).fill({
        id: 1,
        name: "Name of the Event",
        image: catImg
      });
    return (
        <div>
        <div className="flex gap-2.5 justify-end mb-5 "> 
        <SearchBar />
        <div>
          <button 
            className="flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px] ">
            <PlusIcon />Add A New Category
          </button>
        </div>
      </div>
            <div className='grid grid-cols-4 gap-6'>
            {category.map((e, index) => (
            <CategoryCard 
            key={index}
            name={e.name}
            image={e.image}
            />
            ))}
            </div>
            <div className="mt-5 flex justify-end">
            <TablePagination/>
            </div>
        </div>
    );
}

export default Category;
