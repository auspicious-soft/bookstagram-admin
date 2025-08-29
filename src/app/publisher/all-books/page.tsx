"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import { useRouter } from "next/navigation";
import SearchBar from "@/app/admin/components/SearchBar";
import BookCard from "@/app/admin/components/BookCard";
import TablePagination from "@/app/admin/components/TablePagination";
import { getPublisherAllBooks } from "@/services/publisher/publisher-service";

const Page = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [showData, setShowData] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setSearchParams] = useState("");

  const getTypeParam = (tab) => {
    const typeMap = {
      All: "",
      "e-Books": "e-book",
      Audiobooks: "audiobook",
      Courses: "course",
      Podcasts: "podcast",
    };
    return typeMap[tab] || "";
  };

  const { data, isLoading, error } = useSWR(
    `/publisher/books?${query}&description=${searchParams}&type=${getTypeParam(
      activeTab
    )}`,
    getPublisherAllBooks
  );
  const booksdata = data?.data?.data; 

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
    router.push(`/publisher/all-books/${id}`);
  };
  return (
    <div>
      <div className="flex justify-between mb-5">
        <div className="tabs flex flex-wrap gap-[5px] ">
          {["All", "e-Books", "Audiobooks", "Courses", "Podcasts"].map(
            (tab) => (
              <button
                key={tab}
                className={`tab-button ${
                  activeTab === tab
                    ? "active text-white bg-darkBlack "
                    : "text-darkBlack bg-white   "
                } rounded-[34px] text-sm px-5 py-[10px]  `}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </button>
            )
          )}
        </div>
        <div className="flex justify-end items-center gap-2.5">
          <SearchBar query={searchParams} setQuery={setSearchParams} />
        </div>
      </div>
      <div className="">
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
                <BookCard
                  key={book?._id}
                  title={book?.name?.eng}
                  price={`$${book?.price}`}
                  handleClick={() => openBookProfile(book?._id, book?.name?.eng)}
                  imgSrc={getImageClientS3URL(book?.image)}
                  author={book?.authorId[0]?.name?.eng}
                  format={book?.format}                  
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

export default Page;
