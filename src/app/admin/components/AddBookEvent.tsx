"use client";
import TextEditor from "@/app/components/Editor";
import React, { useState, useCallback, useMemo, useTransition } from "react";
import Image from "next/image";
import preview from "@/assets/images/preview.png";
import { useRouter } from "next/navigation";
import { submitForm } from "@/utils/forms-submit";

const AddBookEvent = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const disable = useMemo(
    () => !name || !image || !description,
    [name, image, description]
  );

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      const formData = {
        name,
        description,
        image,
      };
      try {
        await submitForm(formData, router);
        // Optionally redirect or show success message after successful submission
        console.log("Form submitted successfully");
      } catch (error) {
        console.error("Form submission failed:", error);
        // Handle error (e.g., show error message to user)
      }
    });
  };

  return (
    <div className="flex gap-[20px] w-[100%] bg-red">
      <div className="w-[30%]">
        <div className="bg-white rounded-[20px] p-4 shadow-sm ">
          <div className="aspect-square bg-gray-100 rounded-[10px] mb-4 flex items-center justify-center ">
            {imagePreview ? (
              <Image
                unoptimized
                src={imagePreview != null ? imagePreview : preview}
                alt="Preview"
                width={500}
                height={500}
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
      <div className="flex-1">
        <div className="bg-white rounded-[20px] p-4 shadow-sm w-[100%] p-[29px 30px]">
          <div className="mb-4">
            <h2 className="text-[14px] mb-2 text-color-[#060606] font-semi-bold">
              Name of blog
            </h2>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg bg-gray-50 p-[15px] text-[#606060]"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Text Editor */}
          <div>
            <h2 className="text-sm mb-2">Text Editor</h2>
            <div className="border border-gray-200 rounded-lg">
              <TextEditor setDescription={setDescription} />
            </div>
          </div>

          <button
            disabled={disable || isPending}
            className={`w-full mt-4 text-[14px] text-white py-3 rounded-[28px] transition-colors ${
              disable || isPending
                ? "bg-[#ff4f0f] disabled:bg-opacity-50"
                : "bg-[#ff4f0f] hover:bg-[#ff4f0f] hover:bg-opacity-90"
            }`}
            onClick={handleSave}
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBookEvent;