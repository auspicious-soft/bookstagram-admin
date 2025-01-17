"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { DeleteIcon } from "@/utils/svgicons";

const DisplayBookEvent = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [eventName] = useState("Name of Event");

  const preprocessHTMLContent = (html: string) => {
    const updatedHTML = html.replace(
      /stroke-([a-z])/g,
      (match, p1) => `stroke${p1.toUpperCase()}`
    );
    return updatedHTML;
  };

  const backendContent = `

<p><span style="font-size: 14pt;">Lorem Ipsum Heading</span><br><br>ipsum nonummy diam accumsan magna ex dignissim sed et et exerci facilisi. ut aliquip eum feugait augue dolore Duis tincidunt vel commodo dolor consequat. illum euismod dolore veniam, nostrud minim luptatum qui sit nulla in facilisis elit, iriure hendrerit consequat, quis dolore at autem vero esse Ut feugiat nulla vulputate tation iusto erat vel ullamcorper enim in adipiscing dolor blandit te Lorem praesent eros zzril duis aliquam amet, suscipit wisi volutpat. laoreet ut eu ad nibh ea odio molestie nisl consectetuer lobortis delenit velit</p>
<br><p><span style="font-size: 14pt;">Lorem Ipsum Heading</span><br><br>ipsum nonummy diam accumsan magna ex dignissim sed et et exerci facilisi. ut aliquip eum feugait augue dolore Duis tincidunt vel commodo dolor consequat. illum euismod dolore veniam, nostrud minim luptatum qui sit nulla in facilisis elit, iriure hendrerit consequat, quis dolore at autem vero esse Ut feugiat nulla vulputate tation iusto erat vel ullamcorper enim in adipiscing dolor blandit te Lorem praesent eros zzril duis aliquam amet, suscipit wisi volutpat. laoreet ut eu ad nibh ea odio molestie nisl consectetuer lobortis delenit velit</p>
`;
  const safeHTML = preprocessHTMLContent(backendContent);
  console.log("safeHTML: ", safeHTML);
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

  return (
    <div>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Left Column - Image Upload */}
        <div className="w-full md:w-80">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Event preview"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-[20px]"
                />
              ) : (
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
            <label className="w-full">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <div className="bg-[#F96915] text-[14px] text-white text-center py-3 rounded-[28px] cursor-pointer hover:bg-[#F96915] transition-colors flex items-center justify-center gap-2">
                Upload Image
              </div>
            </label>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="flex-1">
          <div className="w-full text-[14px] text-white text-center flex items-center justify-end gap-2 mb-[10px] ">
            <div className="bg-[#FF0004] rounded-[28px] w-[211px] flex items-center justify-center cursor-pointer">
              <button className="flex items-center justify-end gap-2  py-[16px] ">
                <DeleteIcon />
                <h6 className="text-[14px] font-medium">Delete Event</h6>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-[20px] p-6 shadow-sm">
            {/* Event Name */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                {eventName}
              </h1>
            </div>

            {/* Lorem Ipsum Sections */}
            {/* {Array.from({ length: 5 }).map((_, index) => ( */}
            <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
            {/* ))} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayBookEvent;
