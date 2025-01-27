import { SelectSvg } from '@/utils/svgicons';
import Image, { StaticImageData } from 'next/image';
import React from 'react';

 interface CategoryProps {
    image: string | StaticImageData; 
    name: string;
    onClick?: React.MouseEventHandler;
    displayMobile?: boolean;
 }
 
const CategoryCard:React.FC<CategoryProps> = ({image, name, onClick, displayMobile}) => {
    return (
        <div onClick={onClick}  className='grid place-items-center bg-white rounded-[20px] px-5 py-10 aspect-square '>
            <div className='text-center'>
                <Image unoptimized src={image} alt='dgv' width={122} height={122}  className='w-[122px] h-[122px] object-cover rounded-full mx-auto ' />
                <p className='text-darkBlack text-[15px] leading-5 tracking-[-0.24px] mt-[23px] '>{name}</p>
                {displayMobile !== undefined && (
          <p className="flex gap-2.5 items-center text-sm mt-5">
            <SelectSvg color={displayMobile ? 'var(--tw-bg-orange)' : '#C1C1C1'} /> {/* Orange if true, black otherwise */}
            Display on the mobile app
          </p>
        )}
            </div>
        </div>
    );
}

export default CategoryCard;
