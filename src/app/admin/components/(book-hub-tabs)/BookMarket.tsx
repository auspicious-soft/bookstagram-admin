import React, { useState, useRef, useEffect } from 'react';  
import book from '@/assets/images/bookCard.png';
import { DropWhite, PlusIcon } from '@/utils/svgicons';
import BookCard from '../BookCard';
import SearchBar from '../SearchBar';
import useSWR from 'swr';
import { getAllBooks } from '@/services/admin-services';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import { useRouter } from 'next/navigation';
import TablePagination from '../TablePagination';

const BookMarket = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [showData, setShowData] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchTerm, setSearchTerm] = useState(""); // Renamed to searchTerm for clarity
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Construct the API URL with proper query parameters
  const apiUrl = `/admin/books?${query}${searchTerm ? `&description=${searchTerm}` : ''}&type=${getTypeParam(activeTab)}`;
  const { data, isLoading, error } = useSWR(apiUrl, getAllBooks);
  const booksdata = data?.data?.data;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowData(false);
      }
    };

    if (showData) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const openBookProfile = (id: string, name: string) => {
    localStorage.setItem("getbookName", name);
    router.push(`/admin/books/${id}`);
  };

  const bookTypes = [
    { label: "e-Books", value: "e-book" },
    { label: "Audiobooks", value: "audiobook" },
    { label: "Courses", value: "course" },
    { label: "Podcasts", value: "podcast" }
  ];

  const onTypeSelect = (type: string) => {
    const encodedType = encodeURIComponent(type);
    router.push(`/admin/add-new?type=${encodedType}`);
  };

  return (
    <div>
      <div className='flex justify-between mb-5'>
        <div className="tabs flex flex-wrap gap-[5px]">
          {["All", "e-Books", "Audiobooks", "Courses", "Podcasts"].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active text-white bg-darkBlack ' : 'text-darkBlack bg-white   '} rounded-[34px] text-sm px-5 py-[10px]`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className='flex justify-end items-center gap-2.5'>
          <SearchBar query={searchTerm} setQuery={setSearchTerm} />
          <div className='relative' ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowData(!showData);
              }}
              className='flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px]'
            >
              <PlusIcon /> Add <span>|</span> <DropWhite />
            </button>
            {showData && (
              <div className="space-y-2 absolute z-[2] top-[45px] right-0 w-full h-auto bg-white p-2 rounded-lg shadow-lg">
                {bookTypes.map((type) => (
                  <button
                    key={type.value}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
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
                  title={book?.name?.eng}
                  price={`$${book?.price}`}
                  handleClick={() => openBookProfile(book?._id, book?.name?.eng)}
                  imgSrc={getImageClientS3URL(book?.image)}
                  author={book?.authorId[0]?.name.eng}
                  file={book}
                />
              ))}
            </div>
          )}
        </div>
        <div className="mt-10 flex justify-end">
          <TablePagination
            setPage={handlePageChange}
            page={page}
            totalData={data?.data?.total}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
};

export default BookMarket;