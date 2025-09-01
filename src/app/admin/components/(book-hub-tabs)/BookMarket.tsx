import React, { useState, useRef, useEffect } from 'react';
import { DropWhite, PlusIcon } from '@/utils/svgicons';
import DeletableBookCard from '../DeletableBookCard';
import SearchBar from '../SearchBar';
import useSWR from 'swr';
import { getAllBooks } from '@/services/admin-services';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import { useRouter } from 'next/navigation';
import TablePagination from '../TablePagination';
import { getProfileImageUrl } from '@/utils/getImageUrl';

const BookMarket = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [showData, setShowData] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchTerm, setSearchTerm] = useState(""); // Renamed to searchTerm for clarity
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getTypeParam = (tab: string) => {
    const typeMap: Record<string, string> = {
      'All': '',
      'e-Books': 'e-book',
      'Audiobooks': 'audiobook',
      'Courses': 'course',
      'Podcasts': 'podcast',
      'Video-Lecture': 'video-lecture',
      'Audio & E-book': 'audioebook'
    };
    return typeMap[tab] || '';
  };

  // Construct the API URL with proper query parameters
  const apiUrl = `/admin/books?${query}${searchTerm ? `&description=${searchTerm}` : ''}&type=${getTypeParam(activeTab)}`;
  const { data, isLoading, error, mutate } = useSWR(apiUrl, getAllBooks);
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

  const handleTabClick = (tab: string) => {
    setQuery(`page=${1}&limit=${itemsPerPage}`);
    setActiveTab(tab);
    setPage(1);
  };

  const openBookProfile = (id: string, name: string) => {
    localStorage.setItem("getbookName", name);
    router.push(`/admin/books/${id}`);
  };

  const bookTypes = [
    // { label: "e-Books", value: "e-book" },
    // { label: "Audiobooks", value: "audiobook" },
    { label: "Audio & e-book", value: "audioebook" },
    { label: "Courses", value: "course" },
    { label: "Podcasts", value: "podcast" },
    { label: "Video-Lecture", value: "video-lecture" },
  ];

  const onTypeSelect = (type: string) => {
    const encodedType = encodeURIComponent(type);
    console.log('encodedType: ', encodedType);
    router.push(`/admin/add-new?type=${encodedType}`);
  };

  return (
    <div>
      <div className='flex justify-between mb-5'>
        <div className="tabs flex flex-wrap gap-[5px]">
          {["All", "Courses", "Podcasts" , "Video-Lecture","Audio & E-book"].map((tab) => (
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
          <div className= ' relative' ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Stop event propagation
                setShowData(!showData);
              }}
              className='flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px]'
            >
              <PlusIcon /> Add <span>|</span> <DropWhite />
            </button>
            {showData && (
              <div className="space-y-2 absolute top-[45px] right-0 w-full z-50 h-auto bg-white p-2 rounded-lg shadow-lg">
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
            <p className="text-center text-gray-500">No data found.</p>
          ) : (
            <div className="grid grid-cols-4 gap-6">
              {booksdata?.map((book: any) => (
                <DeletableBookCard
                  key={book?._id}
                  id={book?._id}
                  title={
                    book?.name?.eng ??
                    book?.name?.kaz ??
                    book?.name?.rus ??
                    ''
                  }
                  price={`$${book?.price}`}
                  imgSrc={getProfileImageUrl(book?.image)}
                  author={
                    book?.authorId[0]?.name?.eng ??
                    book?.authorId[0]?.name?.kaz ??
                    book?.authorId[0]?.name?.rus ??
                    ''
                  }
                  discount={book?.discountPercentage}
                  format= {book?.format}
                  handleClick={() => openBookProfile(
                    book?._id,
                    book?.name?.eng ??
                    book?.name?.kaz ??
                    book?.name?.rus ??
                    ''
                  )}
                  onDeleteSuccess={() => {
                    // Refresh the data after successful deletion
                    mutate();
                  }}
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