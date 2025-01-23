"use client";
import React from 'react';  
import Image, {StaticImageData} from 'next/image';

interface CardProps {
    title: string;
    author: string;
    price: string;
    imgSrc?: string | StaticImageData;
    discount?: string | number
  }
  const BookCard: React.FC<CardProps> = ({ title, author, price, imgSrc, discount }) => {
    return (
        <div className="">
            <div className='relative'>
            <Image unoptimized src={imgSrc} alt="book" width={264} height={264} className="rounded-[10px] w-full object-cover aspect-square" />
            <p className="absolute right-[6px] bottom-[6px] bg-orange text-white text-xs px-4 py-2 text-center rounded-[28px]"
            >{author}</p>
            </div>
            <h5 className='text-darkBlack mt-3 text-lg font-aeonikBold leading-[normal] mb-[5px] capitalize '>{title}</h5>
            <div className='flex justify-between items-center'>
            <p className='text-lg text-darkBlack  '>{price}</p>
          {discount && (
            <p className='text-lg text-orange '>{discount}% Off</p>
            )}  
            </div>
            </div>
    );  
}

export default BookCard;
