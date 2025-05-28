"use client";
import { generateSignedUrlAudioBookChaptersFiles } from "@/actions";
import { addNewBook } from "@/services/admin-services";
import { DeleteIcon, FileIcon } from "@/utils/svgicons";
import React, { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

const AudiobookChaptersForm = () => {
  const [isPending, startTransition] = useTransition();
  const bookData = JSON.parse(sessionStorage.getItem('audioBookData'));
  const { register, control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      audiobookName: "",
      languages: [
        {
          language: "",
          chapters: [{ srNo: 1, chapterName: "", file: null }],
        },
      ],
    },
  });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage,
  } = useFieldArray({
    control,
    name: "languages",
  });

  const handleCancel = () => {
    window.location.href = "/admin/book-hub";
  };

  const onSubmit = async (data: any) => {
    startTransition(async () => {
      try {
        // Prepare chapters data for each language
        const chaptersData = [];

        for (const lang of data.languages) {
          if (lang.language && lang.chapters.length > 0) {
            for (const chapter of lang.chapters) {
              if (chapter.chapterName && chapter.file && chapter.file[0]) {
                const file = chapter.file[0] as File;

                // Upload file and get URL
                const { signedUrl, key } = await generateSignedUrlAudioBookChaptersFiles(
                  file.name,
                  file.type,
                  bookData.name.eng,
                  lang.language,
                );

                await fetch(signedUrl, {
                  method: "PUT",
                  body: file,
                  headers: { "Content-Type": file.type },
                });

                chaptersData.push({
                  name: chapter.chapterName,
                  description: `Chapter ${chapter.srNo}`,
                  srNo: chapter.srNo,
                  file: key,
                  lang: lang.language,
                });
              }
            }
          }
        }

        // Create the payload structure as specified
        const payload = {
          bookDetails: bookData,
          chapters: chaptersData,
        };

        console.log('payload: ', payload);
        const response = await addNewBook("/admin/audiobook-chapters", payload);
        if (response?.status === 201 || response?.status === 200) {
          toast.success("Audiobook added successfully");
          window.location.href = "/admin/book-hub";
        } else {
          toast.error("Failed to add Audiobook");
        }
      } catch (error) {
        console.error("Error during submission:", error);
        toast.error("An error occurred while adding the Audiobook");
      }
    });
  };

  // Watch the languages field to get real-time updates
  const languages = watch("languages");
  const audiobookName = watch("audiobookName");

  // Get the list of currently selected languages dynamically
  const getSelectedLanguages = () => {
    return languages
      .map((lang) => lang.language)
      .filter((lang) => lang !== "" && lang !== undefined);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-[#FFF] p-8 rounded-[20px] shadow-md">
      <div className="flex justify-between mb-4 h-10">
        <h2 className="text-[#060606] text-2xl font-normal tracking-tight">
          {bookData.name.eng || bookData.name.kaz || bookData.name.rus || "Name of the Audiobook"}
        </h2>
        <button
          type="button"
          onClick={() => {
            if (languageFields.length < 3) {
              appendLanguage({
                language: "",
                chapters: [{ srNo: 1, chapterName: "", file: null }],
              });
            }
          }}
          className="bg-[#f96815] text-white px-5 py-2 rounded-[28px]"
          disabled={languageFields.length >= 3}
        >
          Add New Language
        </button>
      </div>

      {/* Audiobook Name Input */}
      {/* <div className="mb-6">
        <input
          type="text"
          {...register("audiobookName", { required: "Audiobook name is required" })}
          placeholder="Enter audiobook name"
          className="w-full p-3 border rounded-lg text-[#6e6e6e] text-sm font-normal"
        />
      </div> */}

      {languageFields.map((languageField, langIndex) => (
        <div key={languageField.id} className="bg-[#fef7f3] p-6 rounded-xl shadow-md mb-4">
          <div className="mb-4 flex gap-3">
            <label className="block mb-1 text-sm font-medium">Select Language</label>
          </div>
          <div className="mb-4 flex gap-3">
            <select
              {...register(`languages.${langIndex}.language`, { required: "Language is required" })}
              className="w-full p-3 border rounded-lg text-[#6e6e6e] text-sm font-normal"
            >
              <option value="" disabled>
                Select Language
              </option>
              {["eng", "kaz", "rus"]
                .filter(
                  (lang) =>
                    !getSelectedLanguages().includes(lang) || // Hide if selected elsewhere
                    languages[langIndex]?.language === lang // Show if it's the current field's value
                )
                .map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
            </select>

            {languageFields.length > 1 && (
              <button
                type="button"
                onClick={() => removeLanguage(langIndex)}
                className="h-11 px-5 py-3 bg-[#f91515] rounded-[28px] text-white text-sm font-normal flex items-center gap-2"
              >
                <DeleteIcon stroke="#FFF" /> Remove
              </button>
            )}
          </div>

          {/* Chapters Table */}
          <div className="bg-white rounded-[10px] p-4">
            <ChaptersFieldArray control={control} langIndex={langIndex} register={register} />
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-[10px] mt-6 h-10">
        <button type="button" onClick={() => handleCancel()} className="border border-[#f96815] text-[#f96815] px-5 py-2 rounded-[28px]">
          Cancel
        </button>
        <button disabled={isPending} type="submit" className="bg-[#f96815] text-white px-5 py-2 rounded-[28px] hover:bg-opacity-90 disabled:bg-opacity-50">
          {isPending ? "Saving..." : "Save Audiobook"}
        </button>
      </div>
    </form>
  );
};

// Custom File Upload Component
const CustomFileUpload = ({ register, chapterIndex, langIndex }) => {
  const [fileName, setFileName] = useState("");

  return (
    <div className="">
      <div className="h-11 relative border rounded-lg p-3 flex items-center bg-white cursor-pointer">
        <input
          type="file"
          accept="audio/*"
          {...register(`languages.${langIndex}.chapters.${chapterIndex}.file`)}
          className="absolute inset-0 opacity-0 cursor-pointer text-sm font-normal border border-gray-300 text-[#6e6e6e]"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0]?.name || "Select File";
            setFileName(selectedFile);
          }}
        />
        <span className="flex-1 text-[#6e6e6e] text-sm font-normal">{fileName || "Select File"}</span>
        <span className="text-[#060606]">
          <FileIcon />
        </span>
      </div>
    </div>
  );
};

// Chapters Field Array Component
const ChaptersFieldArray = ({ control, langIndex, register }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `languages.${langIndex}.chapters`,
  });

  return (
    <>
     
      {/* Chapter Rows */}
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-[20px] mb-4 items-center w-full">
          {/* Sr No */}
          {/* <div className="flex-col font-medium text-sm text-[#060606]"> */}

          <div className="w-[8%] flex-col text-[#6e6e6e] text-sm font-normal space-y-[10px]">
            <div className="text-[#060606] text-sm font-normal">Sr No.</div>
            <div className="w-12 px-3.5 py-3 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-2.5">
              {String(index + 1).padStart(2, '0')}
            </div>
          </div>
          {/* </div> */}

          {/* Chapter Name */}
          <div className="flex-col font-medium text-sm text-[#060606] w-full space-y-[10px]">
            {/* <div className="flex-col font-medium text-sm text-[#060606]"> */}
            <div>Chapter Name</div>
            <input
              type="text"
              {...register(`languages.${langIndex}.chapters.${index}.chapterName`)}
              placeholder="Chapter Name"
              className="w-full p-2 border border-gray-300 text-[#6e6e6e] text-sm font-normal h-11 px-5 py-4 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-72"
            />
          </div>

          {/* File Upload */}
          <div className="flex-col font-medium text-sm text-[#060606] w-full space-y-[10px]">
            <div>Select File</div>

            <CustomFileUpload register={register} chapterIndex={index} langIndex={langIndex} />
          </div>

          {/* Delete Button */}

          <div className="flex justify-end items-end mt-6">
            <button
              type="button"
              onClick={() => remove(index)}
              className="w-11 h-11 bg-[#f91515] rounded-full flex items-center justify-center text-white"
            >
              <DeleteIcon stroke="#FFF" />
            </button>
          </div>
        
        </div>
      ))}

      {/* Add New Chapter Button */}
      <button
        type="button"
        onClick={() => append({
          srNo: fields.length + 1,
          chapterName: "",
          file: null
        })}
        className="px-5 py-3 bg-[#157ff9] rounded-[28px] text-white text-sm font-normal flex items-center gap-2"
      >
        <span>+</span> Add New Chapter
      </button>
    </>
  );
};

export default AudiobookChaptersForm;