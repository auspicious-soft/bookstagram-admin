"use client";
import React from 'react';  
import Image, {StaticImageData} from 'next/image';

interface CardProps {
    title: string;
    author: string;
    price: string;
    imgSrc?: string | StaticImageData;
  }
  const BookCard: React.FC<CardProps> = ({ title, author, price, imgSrc }) => {
    return (
        <div className="">
            <div className='relative'>
            <Image unoptimized src={imgSrc} alt="book" width={264} height={264} className="rounded-[10px] w-full object-cover" />
            <p className="absolute right-[6px] bottom-[6px] bg-orange text-white text-xs px-4 py-2 text-center rounded-[28px]"
            >{author}</p>
            </div>
            <h5 className='text-darkBlack mt-3 text-lg font-aeonikBold leading-[normal] mb-[5px] capitalize '>{title}</h5>
            <p className='text-lg text-darkBlack  '>{price}</p>
            </div>
    );  
}

export default BookCard;
