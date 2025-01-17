"use client"
import TextEditor from '@/app/components/Editor';
import React, { useState, useCallback } from 'react';
import Image from 'next/image';

const AddBookEvent = () => {
"use client"

  const [blogName, setBlogName] = useState('');
//   const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);


  return (
    // <div className="min-h-screen bg-[#f5ebe6] p-6">
      <div className="  flex gap-[20px] w-[100%] bg-red">
        <div className="w-[30%]  ">
          <div className="bg-white rounded-lg p-4 shadow-sm h-[80%] w-[100%]">
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center h-[80%] w-[100%]">
              { imagePreview ? (
                <Image 
                  src={imagePreview || '/default-image-path.jpg'} 
                  alt="Preview" 
                  width={300}
                  height={200}
                  // layout="fill"
                  className='max-w-[300px]   ' 
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
              <div className="bg-[#F96915] text-[14px] text-white text-center py-3 rounded-[28px] cursor-pointer hover:bg-[#ff4f0f] transition-colors">
                Upload Image
              </div>
            </label>
          </div>
        </div>

        {/* Editor Section */}
        <div className="flex-1 ">
          <div className="bg-white rounded-lg p-4 shadow-sm w-[100%] p-[29px 30px]">
            <div className="mb-4">
              <h2 className="text-[14px] mb-2 text-color-[#060606] font-semi-bold ">Name of blog</h2>
              <input
                type="text"
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Enter Name"
                value={blogName}
                onChange={(e) => setBlogName(e.target.value)}
              />
            </div>

            {/* Text Editor */}
            <div>
              <h2 className="text-sm mb-2">Text Editor</h2>
              <div className="border border-gray-200 rounded-lg">
               
                <TextEditor/>
              </div>
            </div>

            <button
            //   onClick={handleSave}
              className="w-full mt-4 text-[14px] bg-[#F96915] text-white py-3 rounded-[28px] hover:bg-[#ff4f0f] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      {/* </div> */}
    </div>
  );
};


export default AddBookEvent;
