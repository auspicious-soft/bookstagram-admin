import React, { useState } from 'react';  
import book from '@/assets/images/bookCard.png';
import { DropWhite, PlusIcon } from '@/utils/svgicons';
import BookCard from '../BookCard';
import SearchBar from '../SearchBar';
import useSWR from 'swr';
import { getAllBooks } from '@/services/admin-services';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import { useRouter } from 'next/navigation';


const BookMarket = () => {
  const router = useRouter();
 const [activeTab, setActiveTab] = useState('All');
 const [showData, setShowData] = useState(false);
 const [page, setPage] = useState(1);
 const itemsPerPage = 10;
 const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
 const [searchParams, setSearchParams] = useState("");

 const getTypeParam = (tab) => {
  const typeMap = {
    'All': '',
    'e-Books': 'e-book',
    'Audiobooks': 'audiobook',
    'Courses': 'course',
    'Podcasts': 'podcast'
  };
  return typeMap[tab] || '';
};

 const {data, isLoading, error} = useSWR (`/admin/books?${query}&description=${searchParams}&type=${getTypeParam(activeTab)}`, getAllBooks)
 const booksdata= data?.data?.data;

 const handleTabClick = (tab) => {
  setActiveTab(tab);
  setPage(1);
};
const openBookProfile =(id: string) => {
  router.push(`/admin/books/${id}`)
}
const bookTypes = [
  { label: "e-Books", value: "e-book" },
  { label: "Audiobooks", value: "audiobook" },
  { label: "Courses", value: "course" },
  { label: "Podcasts", value: "podcast" }
];
  const onTypeSelect = (type: string) =>{
    const encodedType = encodeURIComponent(type);
    router.push(`/admin/books/add-new?type=${encodedType}`)
  }
    return (
        <div>
        <div className='flex justify-between mb-5'>
            <div className="tabs flex flex-wrap gap-[5px] ">
            {["All", "e-Books", "Audiobooks", "Courses", "Podcasts"].map((tab) => (
                <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active text-white bg-darkBlack ' : 'text-darkBlack bg-white   '} rounded-[34px] text-sm px-5 py-[10px]  `}
                onClick={() => handleTabClick(tab)}
                >{tab}</button>
            ))}
          </div>
          <div className='flex justify-end items-center gap-2.5'>
            <SearchBar query={searchParams} setQuery={setSearchParams}  />
            <div className='relative'>
            <button onClick={() => setShowData(!showData)}
            className='flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px] '>
            <PlusIcon/> Add <span>|</span> <DropWhite/></button>
          {showData && (
           <div className="space-y-2 absolute z-[2] top-[45px] right-0 w-full h-auto bg-white p-4 rounded-lg shadow-lg [&_*]:!text-darkBlack [&_*]:!w-full [&_*]:!text-left">
            {bookTypes.map((type) => (
            <button
              key={type.value}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
              onClick={() => {
                onTypeSelect(type.value);
                setShowData(false);
              }}
            >
              {type.label}
            </button>
            ))}
          </div>
          )}
            </div>
          </div>
        </div>
        <div className=''>
        <div className="tab-content">
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error loading data.</p>
      ) : booksdata?.length === 0 ? (
        <p>No data found.</p>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {booksdata?.map((book: any) => (
            <BookCard
              key={book?._id}
              title={book?.name?.en}
              price={`$${book?.price}`}
              handleClick={()=>openBookProfile(book?._id)}
              imgSrc={getImageClientS3URL(book?.image)}
              author={book?.authorId[0]?.name}
            />
          ))}
        </div>
      )}
    </div>
        </div>
        
        </div>
    );
}

export default BookMarket;
