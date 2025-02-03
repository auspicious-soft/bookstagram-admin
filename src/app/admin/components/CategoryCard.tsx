import { DeleteIcon, SelectSvg } from '@/utils/svgicons';
import Image, { StaticImageData } from 'next/image';
import React from 'react';

 interface CategoryProps {
    image: string | StaticImageData; 
    name: string;
    onClick?: React.MouseEventHandler;
    displayMobile?: boolean;
    handleDelete?: React.MouseEventHandler;
    selected?: boolean;
    onSelect?: () => void; 
 }
 
const CategoryCard:React.FC<CategoryProps> = ({image, name, onClick, displayMobile, handleDelete, selected, onSelect}) => {
    return (
      <div onClick={onClick} className='grid place-items-center cursor-pointer bg-white rounded-[20px] px-5 py-10 aspect-square relative'>
        <div className='text-center'>
          <Image unoptimized src={image} alt='dgv' width={122} height={122}  className='w-[122px] h-[122px] object-cover rounded-full mx-auto ' />
          <p className='text-darkBlack text-[15px] leading-5 tracking-[-0.24px] mt-[23px] '>{name}</p>
          {displayMobile !== undefined && (
          <p onClick={onSelect} className="flex gap-2.5 items-center text-sm mt-5">
            <SelectSvg color={displayMobile===true ? 'var(--tw-bg-orange)' : '#C1C1C1'} /> 
            Display on the mobile app
          </p>
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

export default CategoryCard;
