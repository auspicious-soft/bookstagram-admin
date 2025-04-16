// import React, { useEffect, useState, useTransition } from "react";
// import Modal from "@mui/material/Modal";
// import Image from "next/image";
// import { toast } from "sonner"; 
// import { PlusIcon, SelectSvg } from "@/utils/svgicons";
// import useSWR from "swr";
// import { addBookToCollectio, getAllBooks } from "@/services/admin-services";
// import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL"; 

// interface ModalProp {
//   open: boolean;
//   onClose: () => void;
//   mutate: any;
//   id: any;
// }

// const AddToCollection: React.FC<ModalProp> = ({ open, onClose, mutate, id }) => { 
//   const [searchParams, setsearchParams] = useState("");
//   const [inputValue, setInputValue] = useState('');
//   const [percentage, setPercentage] = useState('');
//   const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
//   const [isPending, startTransition] = useTransition();
//   const {data, error, isLoading}= useSWR(`/admin/books?description=${searchParams}`, getAllBooks)
//   const allBooks = data?.data?.data;

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setsearchParams(`${inputValue ? 'description=' :''}${inputValue.trim()}`);
//     }, 500);
  
//     return () => {
//       clearTimeout(handler);
//     };
//   }, [inputValue, setsearchParams]);

//   const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setsearchParams(event.target.value);
//   };

//   const handleSelect = (id: number) => {
//     setSelectedCourses((prev) =>
//       prev.includes(id) ? prev.filter((courseId) => courseId !== id) : [...prev, id]
//     );
//   };

//   const addToSummaries = async () => {
//     try {

//       const payload = {
//         booksId: selectedCourses
//       }; 

//      startTransition(async () => {
//         const response = await addBookToCollectio(`/admin/collections/${id}/books`, payload);

//         if (response.status===200 ) {
//           toast.success("Books added to collection successfully");
//           mutate();
//           onClose();
//           // Reset form
//           setPercentage('');
//           setSelectedCourses([]);
//         } else {
//           toast.error("Failed To add books to collection");
//         }
//       });
//     } catch (error) {
//       console.error('Error adding books to collection:', error);
//       toast.error("An error occurred while adding books to collection");
//     }
//   };

//   return (
//     <Modal
//       open={open}
//       onClose={onClose}
//       aria-labelledby="child-modal-title"
//       className="grid place-items-center"
//     >
//       <div className="modal bg-white py-[30px] px-5 max-w-[950px] mx-auto rounded-[20px] w-full h-full">
//         <div className="max-h-[80vh] overflow-auto overflo-custom">
//           <h2 className="text-[32px] text-darkBlack mb-5">Add To Collection</h2>
//           <div className="main-form pb-5 border-dashed border-b border-[#d0d0d0] mb-5">
//             <label className="w-full">Search
//               <input type="search" name="" value={searchParams} onChange={handleInputChange} placeholder="Enter Name of the course" />
//             </label>
//           </div>
//           <div className="grid grid-cols-4 gap-x-[15px] gap-y-5">
//             {isLoading ? (
//               <p>Loading...</p>
//             ) : error ? (
//               <p className="text-red-500">Error loading data.</p>
//             ) : allBooks?.length > 0 ? (
//               allBooks.map((book: any) => (
//                 <div
//                   key={book?._id}
//                   onClick={() => handleSelect(book?._id)}
//                   className="relative cursor-pointer"
//                 >
//                   <Image
//                     unoptimized
//                     src={getImageClientS3URL(book?.image)}
//                     alt="books"
//                     width={216}
//                     height={112}
//                     className="rounded-lg w-full"
//                   />
//                   <p className="mt-[7px] text-darkBlack text-sm capitalize">
//                     {book?.name.eng}
//                   </p>
//                   <div className="absolute top-2 right-2">
//                     {selectedCourses.includes(book?._id) ? (
//                       <SelectSvg color="var(--tw-bg-orange)" />
//                     ) : (
//                       <SelectSvg color="#DADADA" />
//                     )}
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p>No data found</p>
//             )}
//           </div>
//           <div className="mt-[30px] flex gap-2.5 justify-end">
//             <button onClick={addToSummaries}
//               className="flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px]"
//               disabled={isPending}><PlusIcon />Add To Collection</button>
//             <button
//               onClick={onClose}
//               className="rounded-[28px] border border-darkBlack py-2 px-5 text-sm"
//             >Cancel</button>
//           </div>
//         </div>
//       </div>
//     </Modal>
//   );
// };
// export default AddToCollection;




import React, { useEffect, useState, useTransition } from "react";
import Modal from "@mui/material/Modal";
import Image from "next/image";
import { toast } from "sonner";
import { PlusIcon, SelectSvg } from "@/utils/svgicons";
import useSWR from "swr";
import { addBookToCollectio, getAllBooks } from "@/services/admin-services";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";

interface ModalProp {
  open: boolean;
  onClose: () => void;
  mutate: any;
  id: any;
}

const AddToCollection: React.FC<ModalProp> = ({ open, onClose, mutate, id }) => {
  const [searchParams, setsearchParams] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [percentage, setPercentage] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();
  const { data,
 error, isLoading } = useSWR(
    `/admin/books?description=${searchParams}`,
    getAllBooks
  );
  const allBooks = data?.data?.data;

  useEffect(() => {
    const handler = setTimeout(() => {
      setsearchParams(`${inputValue ? "description=" : ""}${inputValue.trim()}`);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, setsearchParams]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value); // Update inputValue instead of searchParams
  };

  const handleSelect = (id: number) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((courseId) => courseId !== id) : [...prev, id]
    );
  };

  const addToSummaries = async () => {
    try {
      const payload = {
        booksId: selectedCourses,
      };

      startTransition(async () => {
        const response = await addBookToCollectio(`/admin/collections/${id}/books`, payload);

        if (response.status === 200) {
          toast.success("Books added to collection successfully");
          mutate();
          onClose();
          // Reset form
          setPercentage("");
          setSelectedCourses([]);
        } else {
          toast.error("Failed to add books to collection");
        }
      });
    } catch (error) {
      console.error("Error adding books to collection:", error);
      toast.error("An error occurred while adding books to collection");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="child-modal-title"
      className="grid place-items-center"
    >
      <div className="modal bg-white py-[30px] px-5 max-w-[950px] mx-auto rounded-[20px] w-full h-full">
        <div className="max-h-[80vh] overflow-auto overflo-custom">
          <h2 className="text-[32px] text-darkBlack mb-5">Add To Collection</h2>
          <div className="main-form pb-5 border-dashed border-b border-[#d0d0d0] mb-5">
            <label className="w-full">
              Search
              <input
                type="search"
                name=""
                value={inputValue} // Bind to inputValue
                onChange={handleInputChange}
                placeholder="Enter Name of the course"
              />
            </label>
          </div>
          <div className="grid grid-cols-4 gap-x-[15px] gap-y-5">
            {isLoading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">Error loading data.</p>
            ) : allBooks?.length > 0 ? (
              allBooks.map((book: any) => (
                <div
                  key={book?._id}
                  onClick={() => handleSelect(book?._id)}
                  className="relative cursor-pointer"
                >
                  <Image
                    unoptimized
                    src={getImageClientS3URL(book?.image)}
                    alt="books"
                    width={216}
                    height={112}
                    className="rounded-lg w-full"
                  />
                  <p className="mt-[7px] text-darkBlack text-sm capitalize">
                    {book?.name.eng}
                  </p>
                  <div className="absolute top-2 right-2">
                    {selectedCourses.includes(book?._id) ? (
                      <SelectSvg color="var(--tw-bg-orange)" />
                    ) : (
                      <SelectSvg color="#DADADA" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No data found</p>
            )}
          </div>
          <div className="mt-[30px] flex gap-2.5 justify-end">
            <button
              onClick={addToSummaries}
              className="flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isPending || selectedCourses.length === 0} // Disable if no courses selected or pending
            >
              <PlusIcon />
              Add To Collection
            </button>
            <button
              onClick={onClose}
              className="rounded-[28px] border border-darkBlack py-2 px-5 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddToCollection;