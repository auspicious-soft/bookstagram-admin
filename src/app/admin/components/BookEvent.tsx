"use client";
import React, { useState } from "react";
import {  Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import event from '@/assets/images/event.png';
import useSWR from 'swr';
import { getBookEvents } from "@/services/admin-services";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import SearchBar from "./SearchBar";
import TablePagination from "./TablePagination";

const BooksEvents = () => {
 
  const router = useRouter();
  const [query, setQuery] =useState('')
  const [page, setPage] =useState('')
  const { data , error, isLoading, mutate } = useSWR(`/admin/events?description=${query}`, getBookEvents);
 const  events = data?.data?.data;

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
          <SearchBar setQuery={setQuery} query={query}/>
        </div>

        {/* Add New Event Button */}
        <button
          className="flex items-center gap-2 bg-[#F96915] text-white px-4 py-2 rounded-full hover:bg-[#F96915] transition-colors"
          onClick={() => router.push("/admin/book-events/add")}
        >
          <Plus className="w-5 h-5" />
          Add New Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto">
        {events?.length===0 &&(
          <h1 className="text-center ">No Events Present</h1>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events?.map((event, index) => (
            <div
              key={index}
              className="  overflow-hidden  "
              onClick={() => router.push(`/admin/book-events/${event?._id}`)}
            >
              <div className="aspect-square relative ">
                {/* <Image
                  src={getImageClientS3URL(event.image)}
                  alt={event.name}
                  layout="fill"
                  objectFit="cover"
                  className="round-[10px]"
                  style={{borderRadius:"10px"}}
                /> */}
                <img
                  src={getImageClientS3URL(event.image)}
                  alt={event.name}
                  className="w-full h-full object-cover round-[10px]"
                  style={{borderRadius:"10px"}}
                />
              </div>
              <div className="p-4">
                <h3 className="text-[18px] font-medium text-color-[#060606]">
                  {event.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full flex justify-end">
      <TablePagination setPage={setPage} page={page}/>
          </div>
          
        {/* Pagination */}
        {/* <div className="mt-8 flex justify-end items-center gap-2">
          <button className="px-3 py-1 rounded border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50">
            Prev
          </button>
          <button className="px-3 py-1 rounded border border-gray-300 bg-[#ff5f1f] text-white text-sm">
            1
          </button>
          <button className="px-3 py-1 rounded border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1 rounded border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50">
            3
          </button>
          <span className="px-2 text-gray-500">...</span>
          <button className="px-3 py-1 rounded border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50">
            6
          </button>
          <button className="px-3 py-1 rounded border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50">
            Next
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default BooksEvents;
