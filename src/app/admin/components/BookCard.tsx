"use client";
import React from 'react';  
import Image, {StaticImageData} from 'next/image';
import { DeleteIcon } from '@/utils/svgicons';

interface CardProps {
    title: string;
    author: string;
    price: string;
    imgSrc?: string | StaticImageData;
    discount?: string | number;
    handleDelete?: React.MouseEventHandler;
    handleClick?: React.MouseEventHandler;
  }
  const BookCard: React.FC<CardProps> = ({ title, author, price, imgSrc, discount, handleDelete, handleClick }) => {
    return (
        <div onClick={handleClick} className="relative cursor-pointer">
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
         {handleDelete &&(
        <div className="absolute top-[5px] right-[6px] z-10 ">
        <button onClick={handleDelete} className="bg-white border border-orange rounded-[34px] flex items-center gap-[5px] py-2 px-4 text-orange ">
        <DeleteIcon stroke="var(--tw-bg-orange)"/>Remove</button>
        </div>
          )}    
             
        </div>
        </div>
    );  
}

export default BookCard;
