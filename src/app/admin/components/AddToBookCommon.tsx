// import React, { useState } from 'react';
// import useSWR from 'swr';
// import CourseCard from './CourseCard';
// import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
// import { getAllBooks } from '@/services/admin-services';
// import { Modal } from '@mui/material';
// import { PlusIcon } from '@/utils/svgicons';
// import { getProfileImageUrl } from '@/utils/getImageUrl';

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   title?: string;
//   handleSubmit: () => void;
//   isPending: any;
//   selectedBooks: string[];
//   onSelectBooks: (books: string[]) => void;
//   type?: string;
//   route?: string;
// }

// const AddToBookCommon = ({ open, onClose, title, handleSubmit, isPending, onSelectBooks, selectedBooks,type , route }: Props) => {
//   const [searchParams, setSearchParams] = useState("");
//   const swrKey = route 
//     ? `${route}?type=${type}&description=${searchParams}` 
//     : `/admin/books?type=${type}&description=${searchParams}`;
  
//   const { data, error, isLoading } = useSWR(swrKey, getAllBooks);
//   // const { data, error, isLoading } = useSWR(`/admin/books?type=${type}&description=${searchParams}`, getAllBooks);
//   const allBooks = data?.data?.data;
//   console.log('allBooks: ', allBooks);

//   const handleSelect = (id: string) => {
//     onSelectBooks(
//       selectedBooks.includes(id)
//         ? selectedBooks.filter(bookId => bookId !== id)
//         : [...selectedBooks, id]
//     );
//   };

//   const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchParams(event.target.value);
//   };

//   return (
//     <Modal
//       open={open}
//       onClose={onClose}
//       aria-labelledby="child-modal-title"
//       className="grid place-items-center"
//     >
//       <div className="modal bg-white pt-[30px] px-5 max-w-[950px] mx-auto rounded-[20px] w-full h-full relative">
//         <div className="max-h-[80vh] flex flex-col">
//           <h2 className="text-[32px] text-darkBlack mb-5">{title}</h2>
//           <div className="main-form">
//             <label className="w-full">
//               Search
//               <input
//                 type="search"
//                 name=""
//                 value={searchParams}
//                 onChange={handleInputChange}
//                 placeholder="Enter Name of the course"
//               />
//             </label>
//           </div>
//           <div className="flex-1 mt-5 pt-5 grid grid-cols-4 gap-5 border-t border-[#D0D0D0] overflow-auto overflo-custom">
//             {allBooks?.map((data: any) => (
//               <CourseCard
//                 key={data?._id}
//                 title={data?.name?.eng ?? data?.name?.kaz ?? data?.name?.rus ?? ''}
//                 image={getProfileImageUrl(data?.image)}
//                 selected={selectedBooks.includes(data?._id)}
//                 onSelect={() => handleSelect(data?._id)}
//               />
//             ))}
//           </div>
//           <div className="mt-5 flex gap-2.5 justify-end border-t border-[#D0D0D0] pt-5">
//             <button
//               onClick={handleSubmit}
//               type="submit"
//               className="flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px] hover:bg-opacity-90 transition-all disabled:opacity-50"
//               disabled={isPending || selectedBooks.length === 0}
//             >
//               <PlusIcon />
//               {title}
//             </button>
//             <button
//               onClick={onClose}
//               className="rounded-[28px] border border-darkBlack py-2 px-5 text-sm hover:bg-gray-50 transition-all"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default AddToBookCommon;




import React, { useState } from 'react';
import useSWR from 'swr';
import CourseCard from './CourseCard';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import { getAllBooks } from '@/services/admin-services';
import { Modal } from '@mui/material';
import { PlusIcon } from '@/utils/svgicons';
import { getProfileImageUrl } from '@/utils/getImageUrl';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  handleSubmit: () => void;
  isPending: any;
  selectedBooks: string[];
  onSelectBooks: (books: string[]) => void;
  type?: string;
  route?: string;
}

const AddToBookCommon = ({ open, onClose, title, handleSubmit, isPending, onSelectBooks, selectedBooks, type, route }: Props) => {
  const [searchParams, setSearchParams] = useState("");
  // Dynamically set the SWR key based on whether route is provided
  // const swrKey = route 
  //   ? `${route}?type=${type}&description=${searchParams}` 
  //   : `/admin/books?${type}?type=${type}:""&description=${searchParams}`;
  
  const queryParams = new URLSearchParams();
  if (type) queryParams.append('type', type);
  if (searchParams) queryParams.append('description', searchParams);
  const queryString = queryParams.toString();
  
  // Dynamically set the SWR key based on whether route is provided
  const swrKey = route 
    ? `${route}${queryString ? `?${queryString}` : ''}` 
    : `/admin/books${queryString ? `?${queryString}` : ''}`;
    
    console.log('swrKey: ', swrKey);
  const { data, error, isLoading } = useSWR(swrKey, getAllBooks);
  console.log('data: ', data);
  // Determine the books array based on the route
  const allBooks = route ? data?.data?.data?.map((item: any) => ({
    _id: item._id,
    image: item.image,
    name: item.name,
    ...item, 
  })) : data?.data?.data;
  console.log('allBooks: ', allBooks);

  const handleSelect = (id: string) => {
    onSelectBooks(
      selectedBooks.includes(id)
        ? selectedBooks.filter(bookId => bookId !== id)
        : [...selectedBooks, id]
    );
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(event.target.value);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="child-modal-title"
      className="grid place-items-center"
    >
      <div className="modal bg-white pt-[30px] px-5 max-w-[950px] mx-auto rounded-[20px] w-full h-full relative">
        <div className="max-h-[80vh] flex flex-col">
          <h2 className="text-[32px] text-darkBlack mb-5">{title}</h2>
          <div className="main-form">
            <label className="w-full">
              Search
              <input
                type="search"
                name=""
                value={searchParams}
                onChange={handleInputChange}
                placeholder="Enter Name of the course"
              />
            </label>
          </div>
          <div className="flex-1 mt-5 pt-5 grid grid-cols-4 gap-5 border-t border-[#D0D0D0] overflow-auto overflo-custom">
            {isLoading ? (
              <div>Loading...</div>
            ) : error ? (
              <div>Error loading books</div>
            ) : allBooks?.length > 0 ? (
              allBooks.map((data: any) => (
                <CourseCard
                  key={data?._id}
                  title={data?.name?.eng ?? data?.name?.kaz ?? data?.name?.rus ?? ''}
                  image={getProfileImageUrl(data?.image)}
                  selected={selectedBooks.includes(data?._id)}
                  onSelect={() => handleSelect(data?._id)}
                />
              ))
            ) : (
              <div>No books found</div>
            )}
          </div>
          <div className="mt-5 flex gap-2.5 justify-end border-t border-[#D0D0D0] pt-5">
            <button
              onClick={handleSubmit}
              type="submit"
              className="flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px] hover:bg-opacity-90 transition-all disabled:opacity-50"
              disabled={isPending || selectedBooks.length === 0}
            >
              <PlusIcon />
              {title}
            </button>
            <button
              onClick={onClose}
              className="rounded-[28px] border border-darkBlack py-2 px-5 text-sm hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddToBookCommon;