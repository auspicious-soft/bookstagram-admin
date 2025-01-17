"use client";
import React from "react";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
const BooksEvents = () => {
  // Mock data for events
  const events = Array(8).fill({
    id: 1,
    name: "Name of the Event",
    image:
      "data:image/jpeg;base64,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",
  });
  const router = useRouter();
  return (
    <div>
      {/* Header with Search and Add Button */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-end gap-4">
        {/* Search Bar */}
        <div className="relative flex max-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event, index) => (
            <div
              key={index}
              className="  overflow-hidden shadow-sm "
              onClick={() => router.push("/admin/book-events/dgdsgfgdgdgdfg")}
            >
              <div className="aspect-square relative ">
                <img
                  src={event.image}
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

        {/* Pagination */}
        <div className="mt-8 flex justify-end items-center gap-2">
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
        </div>
      </div>
    </div>
  );
};

export default BooksEvents;
