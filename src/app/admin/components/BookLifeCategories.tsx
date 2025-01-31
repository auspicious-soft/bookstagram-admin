"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import event from "@/assets/images/event.png";
import useSWR from "swr";
import { getBookEvents } from "@/services/admin-services";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import SearchBar from "./SearchBar";
import TablePagination from "./TablePagination";
import Image from "next/image";

const BookLifeCategories = () => {
  const router = useRouter();
  const Id = useParams()
  const categoryId= Id.id
  const itemsPerPage = 10;
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchQuery, setSearchQuery] = useState(``);
  const { data, error, isLoading, mutate } = useSWR(searchQuery?`/admin/book-lives/${categoryId}?description=${searchQuery}&${query}`:`/admin/book-lives/${categoryId}?${query}`, getBookEvents);
  console.log('data: ', data);
  const events = data?.data?.data?.blogs ;

  console.log('events: ', events);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };
  const handleAddButton =() =>{
    router.push(`/admin/book-life/${categoryId}/add`) 
  }
  return (
    <div>
      {/* Header with Search and Add Button */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-end gap-4">
        <div className="relative flex max-w-[300px]">
          {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          /> */}
          <SearchBar setQuery={setSearchQuery} query={searchQuery} />
        </div>

        {/* Add New Event Button */}
        <button className="flex items-center gap-2 bg-[#F96915] text-white px-4 py-2 rounded-full hover:bg-[#F96915] transition-colors" onClick={() => handleAddButton()}>
          <Plus className="w-5 h-5" />
          Add New Blog
        </button>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto">
        {events?.length === 0 && <h1 className="text-center ">No Events Present</h1>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events?.map((event, index) => (
            <div key={index} className="  overflow-hidden  " onClick={() => router.push(`/admin/book-life/blog/${event?._id}`)}>
              <div className="aspect-square relative ">
           
                <Image unoptimized src={getImageClientS3URL(event.image)} alt={event.name} width={263} height={263} className="w-full h-full object-cover round-[10px]" style={{ borderRadius: "10px" }} />
              </div>
              <div className="p-4">
                <h3 className="text-[18px] font-medium text-color-[#060606]">{event.name}</h3>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full flex justify-end">
          <TablePagination setPage={handlePageChange} page={page} totalData={data?.data?.total} itemsPerPage={itemsPerPage} />
        </div>
      </div>
    </div>
  );
};

export default BookLifeCategories;
