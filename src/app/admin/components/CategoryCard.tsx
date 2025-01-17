import Image, { StaticImageData } from 'next/image';
import React from 'react';


 interface CategoryProps {
    image: string | StaticImageData; 
    name: string;
 }
 
const CategoryCard:React.FC<CategoryProps> = ({image, name}) => {
    return (
        <div className='grid place-items-center bg-white rounded-[20px] px-5 py-10 aspect-square '>
            <div className='text-center'>
                <Image src={image} alt={name} width={122} height={122} className='w-[122px] h-[122px] object-cover rounded-full mx-auto ' />
                <p className='text-darkBlack text-[15px] leading-5 tracking-[-0.24px] mt-[23px] '>{name}</p>
            </div>
        </div>
    );
}

export default CategoryCard;
