// import { DeleteIcon, SelectSvg } from '@/utils/svgicons';
// import Image, { StaticImageData } from 'next/image';
// import React from 'react';

//  interface CategoryProps {
//     image: string | StaticImageData; 
//     name: string;
//     onClick?: React.MouseEventHandler;
//     displayMobile?: boolean;
//     handleDelete?: React.MouseEventHandler;
//     selected?: boolean;
//     onSelect?: () => void; 
//  }
 
// const CategoryCard:React.FC<CategoryProps> = ({image, name, onClick, displayMobile, handleDelete, selected, onSelect}) => {
//     return (
//       <div onClick={onClick} className='grid place-items-center cursor-pointer bg-white rounded-[20px] px-5 py-10 aspect-square relative'>
//         <div className='text-center'>
//           <Image unoptimized src={image} alt='dgv' width={122} height={122}  className='w-[122px] h-[122px] object-cover rounded-full mx-auto ' />
//           <p className='text-darkBlack text-[15px] leading-5 tracking-[-0.24px] mt-[23px] '>{name}</p>
//           {displayMobile !== undefined && (
//           <p onClick={onSelect} className="flex gap-2.5 items-center text-sm mt-5">
//             <SelectSvg color={displayMobile===true ? 'var(--tw-bg-orange)' : '#C1C1C1'} /> 
//             Display on the mobile app
//           </p>
//         )}
//         {handleDelete &&(
//         <div className="absolute top-[5px] right-[6px] z-10 ">
//         <button onClick={handleDelete} className="bg-white border border-orange rounded-[34px] flex items-center gap-[5px] py-2 px-4 text-orange ">
//         <DeleteIcon stroke="var(--tw-bg-orange)"/>Remove</button>
//         </div>
//         )}
//         </div>
//       </div>
//     );
// }

// export default CategoryCard;




import { DeleteIcon, SelectSvg } from '@/utils/svgicons';
import Image, { StaticImageData } from 'next/image';
import React, { useState } from 'react';

interface CategoryProps {
  image: string | StaticImageData;
  name: string;
  onClick?: React.MouseEventHandler;
  displayMobile?: boolean;
  handleDelete?: () => void;
  selected?: boolean;
  onSelect?: () => void;
}

const CategoryCard: React.FC<CategoryProps> = ({
  image,
  name,
  onClick,
  displayMobile,
  handleDelete,
  selected,
  onSelect,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  console.log('name: ', name);

  const confirmDelete = () => {
    handleDelete?.();
    setShowConfirm(false);
  };

  return (
    <>
      <div
        onClick={onClick}
        className='grid place-items-center cursor-pointer bg-white rounded-[20px] px-5 py-10 aspect-square relative'
      >
        <div className='text-center'>
          <Image
            unoptimized
            src={image}
            alt='category'
            width={122}
            height={122}
            className='w-[122px] h-[122px] object-cover rounded-full mx-auto '
          />
          <p className='text-darkBlack text-[15px] leading-5 tracking-[-0.24px] mt-[23px] '>{name}</p>

          {displayMobile !== undefined && (
            <p onClick={onSelect} className="flex gap-2.5 items-center text-sm mt-5">
              <SelectSvg color={displayMobile === true ? 'var(--tw-bg-orange)' : '#C1C1C1'} />
              Display on the mobile app
            </p>
          )}

          {handleDelete && (
            <div className="absolute top-[5px] right-[6px] z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevents parent click
                  setShowConfirm(true);
                }}
                className="bg-white border border-orange rounded-[34px] flex items-center gap-[5px] py-2 px-4 text-orange"
              >
                <DeleteIcon stroke="var(--tw-bg-orange)" /> Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 grid place-items-center">
          <div className="bg-white p-6 rounded-[20px] w-[90%] max-w-[400px] text-center">
            <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
            <p className="mb-6">Do you really want to delete this?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded-[28px] border border-darkBlack text-sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-[28px] bg-red-600 text-white text-sm"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryCard;
