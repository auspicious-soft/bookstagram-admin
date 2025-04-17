"use client";

import React, { useState, useCallback, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { DeleteIcon } from "@/utils/svgicons";
import useSWR from "swr";
import { getBookEvents, DeleteBookEvent, updateBookEvent } from "@/services/admin-services";
import { useParams } from "next/navigation";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import { useRouter } from "next/navigation";
import Image from "next/image";

const DisplayBookEvent = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id;
  const route = `/admin/events/${eventId}`;

  const { data, error, isLoading, mutate } = useSWR(route, getBookEvents);
  const eventImage = data?.data?.image;
  const eventName = data?.data?.name;
  const description = data?.data?.description;

  const [imagePreview, setImagePreview] = useState<string | null>("");
  const [isPending, startTransition] = useTransition();

  const preprocessHTMLContent = (html: string) => {
    const updatedHTML = html?.replace(/stroke-([a-z])/g, (match, p1) => `stroke${p1.toUpperCase()}`);
    return updatedHTML;
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const response = await DeleteBookEvent(route);
        console.log('response: ', response);
        if (response.status === 200) {
          toast.success("Book Event Deleted successfully");
          router.push("/admin/book-events");
        } else {
          toast.error("Failed to delete Book Event");
        }
      } catch (error) {
        console.error("Error deleting Book Event:", error);
        toast.error("An error occurred while deleting the Book Event");
      }
      // Revalidate data after deletion (though router.push might suffice)
      mutate();
    });
  };

 
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const safeHTML = preprocessHTMLContent(description);

  return (
    <div>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-80">
          <div className="bg-white rounded-[20px] p-4 shadow-sm">
            <div className="aspect-square bg-gray-100 rounded-[20px] flex items-center justify-center">
              {imagePreview === "" && eventImage && (
                <Image
                  unoptimized
                  src={getImageClientS3URL(eventImage)}
                  alt={eventName}
                  className="w-full h-full object-cover rounded-[10px]"
                  style={{ borderRadius: "20px" }}
                  width={340}
                  height={340}
                />
              )}
              {imagePreview !== "" && (
                <Image
                  unoptimized
                  src={imagePreview}
                  alt={"Preview"}
                  className="w-full h-full object-cover rounded-[10px]"
                  style={{ borderRadius: "20px" }}
                  width={340}
                  height={340}
                />
              )}
              {!eventImage && imagePreview === "" && (
                <div className="text-gray-400">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <label className="w-full mt-4">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />        
            </label>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="flex-1">
          <div className="w-full text-[14px] text-white text-center flex items-center justify-end gap-2 mb-[10px]">
            <div className="bg-[#FF0004] rounded-[28px] w-[211px] flex items-center justify-center cursor-pointer">
              <button
                className="flex items-center justify-end gap-2 py-[16px]"
                onClick={handleDelete}
                disabled={isPending}
              >
                <DeleteIcon stroke="#fff" />
                <h6 className="text-[14px] font-medium">
                  {isPending ? "Deleting..." : "Delete Event"}
                </h6>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-[20px] p-6 shadow-sm">
            {/* Event Name */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">{eventName}</h1>
            </div>

            {/* Description */}
            <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayBookEvent;