'use client'
import React from 'react';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import BookCard from './BookCard';
import { useRouter } from 'next/navigation';
import { getProfileImageUrl } from '@/utils/getImageUrl';
 interface Props {
  data: any;
 }
const DiscountBooks = ({data}: Props) => {
  const router = useRouter();

  const openBookProfile =(id: string, name: string) => {
    localStorage.setItem("getbookName", name);
    router.push(`/admin/books/${id}`)
  }
  return (
    <div>
        { (data === undefined || data.length === 0) &&  <p className="text-center text-gray-500">No data found.</p>}
       <div className='grid grid-cols-4 gap-6'>
            {data?.map((row: any) => (
            <BookCard 
            key={row?._id}
            handleClick={()=>openBookProfile(row?._id, row?.name.eng)}
            author={row?.authorId[0]?.name?.eng || row?.authorId[0]?.name?.kaz || row?.authorId[0]?.name?.rus}
            title={row?.name?.eng || row?.name?.kaz || row?.name?.rus}
            price={`$${row?.price}`}
            discount={row?.discountPercentage}
            imgSrc={getProfileImageUrl(row?.image)}
            format={row?.format}
            />
            ))}
        </div>
        
    </div>
  );
}

export default DiscountBooks;
