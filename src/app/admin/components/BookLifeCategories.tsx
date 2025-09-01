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
import { getProfileImageUrl } from "@/utils/getImageUrl";

const BookLifeCategories = () => {
  const router = useRouter();
  const Id = useParams()
  const categoryId= Id.id
  const itemsPerPage = 12;
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchQuery, setSearchQuery] = useState(``);
  const { data, error, isLoading, mutate } = useSWR(searchQuery?`/admin/book-lives/${categoryId}?description=${searchQuery}&${query}`:`/admin/book-lives/${categoryId}?${query}`, getBookEvents);
  const events = data?.data?.data?.blogs ;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };
  const handleAddButton =() =>{
    router.push(`/admin/book-life/${categoryId}/add`) 
  }
  return (
    <div>
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-end gap-4">
        <div className="relative flex max-w-[300px]">
       
          <SearchBar setQuery={setSearchQuery} query={searchQuery} />
        </div>

        <button className="flex items-center gap-2 bg-[#F96915] text-white px-4 py-2 rounded-full hover:bg-[#F96915] transition-colors" onClick={() => handleAddButton()}>
          <Plus className="w-5 h-5" />
          Add New Blog
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {(events?.length === 0 || events === '') && <h1 className="text-center ">No Blog Present</h1>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events?.map((event, index) => (
            <div key={index} className="overflow-hidden" onClick={() => router.push(`/admin/book-life/blog/${event?._id}`)}>
              <div className="aspect-square relative ">
           
                <Image unoptimized src={getProfileImageUrl(event.image)} alt={event.name} width={263} height={263} className="w-full h-full object-cover round-[10px]" style={{ borderRadius: "10px" }} />
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
