'use client'
import React from 'react';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import BookCard from './BookCard';
 interface Props {
  data: any;
 }
const DiscountBooks = ({data}: Props) => {


  return (
    <div>
       <div className='grid grid-cols-4 gap-6'>
            {data?.map((row: any) => (
            <BookCard 
            key={row?._id}
            author={row?.authorId[0]?.name}
            title={row?.name}
            price={`$${row?.price}`}
            discount={row?.discountPercentage}
            imgSrc={getImageClientS3URL(row?.image)}
            />
            ))}
        </div>
        
    </div>
  );
}

export default DiscountBooks;
