"use client";

import { generateSignedUrlAudioBookFile, getFileWithMetadata, deleteFileFromS3, updateS3ObjectMetadata } from "@/actions";
import { addNewBook, getSingleBook, updateSingleBook } from "@/services/admin-services";
import { CrossIcon, DeleteIcon, FileIcon } from "@/utils/svgicons";
import { useParams } from "next/navigation";
import React, { useState, useEffect, startTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";

const AudiobookForm = () => {
  const { id } = useParams();
  const [fileUrls, setFileUrls] = useState<{ [key: string]: string } | null>(null);
  const [metadatas, setMetadatas] = useState<{ [key: string]: any } | null>(null);
  const [bookData, setBookData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data, isLoading: isFetchingData } = useSWR(`/admin/audiobook-chapters/product/${id}`, getSingleBook);
  console.log('data: ', data?.data?.data?.chapters);

  const fileName = data?.data?.data?.books?.[0]?.file || {};
  console.log('DATA: ', data?.data?.data);
  const availableLanguages = ["eng", "kaz", "rus"];

  const { register, control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      courseName: "",
      languages: [
        {
          language: "",
          file: null,
          timestamps: [{ id: "1", chapterName: "", startTime: "00:00:00", endTime: "00:00:00" }],
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

  const [formData, setFormData] = useState<any>(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  useEffect(() => {
    const courseData = sessionStorage.getItem("audioBookData");
    if (courseData && courseData !== "undefined" && courseData !== "null" && courseData.trim() !== "") {
      const parsedData = JSON.parse(courseData);
      setBookData(parsedData);
      setFormData(parsedData);
    }
  }, []);

  useEffect(() => {
    const fetchFileMetadata = async () => {
      const urls: { [key: string]: string } = {};
      const metas: { [key: string]: any } = {};

      for (const [lang, path] of Object.entries(fileName)) {
        try {
          const { fileUrl, metadata } = await getFileWithMetadata(path as string);
          urls[lang] = fileUrl;
          // Decode base64 timestamps and ensure they're in the correct format
          const decodedTimestamps = metadata?.timestamps
            ? metadata?.timestamps
            : [];
          // Ensure timestamps have the required structure
          metas[lang] = Array.isArray(decodedTimestamps)
            ? decodedTimestamps.map((ts: any) => ({
                id: ts.id || Date.now().toString(),
                chapterName: ts.chapterName || "",
                startTime: ts.startTime || "00:00:00",
                endTime: ts.endTime || "00:00:00",
              }))
            : [];
        } catch (error) {
          console.error(`Error fetching metadata for ${lang}:`, error);
          metas[lang] = [];
        }
      }
      setFileUrls(urls);
      setMetadatas(metas);
      setIsLoading(false);
    };

    if (Object.keys(fileName).length > 0) {
      fetchFileMetadata();
    } else {
      setIsLoading(false);
    }
  }, [fileName]);

  useEffect(() => {
    if (fileUrls && metadatas && !isFormInitialized) {
      const languages = Object.entries(fileName).map(([lang]) => ({
        language: lang,
        file: null, // No file is uploaded initially; this is for edits
        timestamps: metadatas[lang].length > 0
          ? metadatas[lang]
          : [{ id: Date.now().toString(), chapterName: "", startTime: "00:00:00", endTime: "00:00:00" }],
      }));
      reset({ languages });
      setIsFormInitialized(true);
    }
  }, [fileUrls, metadatas, reset, isFormInitialized]);

  const userName = formData?.name
    ? Object.values(formData.name)
        .find((name) => name && (name as string).trim() !== "")
        ?.toString()
    : "Audiobook Name";

  const handleCancel = () => {
    sessionStorage.removeItem("audioBookData");
    window.location.href = "/admin/book-hub";
  };

  const onSubmit = async (data: any) => {
    startTransition(async () => {
      try {
        const filePromises = data.languages.map(async (lang) => {
          const timestampsEncoded = Buffer.from(JSON.stringify(lang.timestamps || [])).toString("base64");
          const existingFilePath = fileName[lang.language];

          if (lang.file?.[0]) {
            if (existingFilePath) {
              await deleteFileFromS3(existingFilePath);
            }

            const file = lang.file[0] as File;
            const { signedUrl, key } = await generateSignedUrlAudioBookFile(file.name, file.type, userName, lang.language, { timestamps: timestampsEncoded });
            await fetch(signedUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type },
            });
            return { language: lang.language, fileUrl: key };
          }

          if (existingFilePath && !lang.file?.[0]) {
            await updateS3ObjectMetadata(existingFilePath, { timestamps: timestampsEncoded });
            return { language: lang.language, fileUrl: existingFilePath };
          }

          return { language: lang.language, fileUrl: existingFilePath };
        });

        const uploadedFiles = await Promise.all(filePromises);
        const fileTransforms = uploadedFiles.reduce((acc, curr) => ({ ...acc, [curr.language]: curr.fileUrl }), {});

        const finalPayload = { ...formData, file: fileTransforms };
        const response = await updateSingleBook(`/admin/books/${id}`, finalPayload);

        if (response?.status === 200 || response?.status === 201) {
          toast.success("Book updated successfully");
          sessionStorage.removeItem("audioBookData");
          window.location.href = "/admin/book-hub";
        } else {
          toast.error("Failed to update Book");
        }
      } catch (error) {
        console.error("Error", error);
        toast.error("An error occurred while updating the Book");
      }
    });
  };

  const languages = watch("languages");
  const getSelectedLanguages = () => {
    return languages
      .map((lang) => lang.language)
      .filter((lang) => lang !== "" && lang !== undefined);
  };

  const handleRemoveLanguage = async (index: number) => {
    const languageToRemove = languages[index].language;
    const filePath = fileName[languageToRemove];

    if (filePath) {
      try {
        await deleteFileFromS3(filePath);
        toast.success(`File for ${languageToRemove} removed`);
      } catch (error) {
        console.error("Error deleting file from S3:", error);
        toast.error("Failed to delete file from S3");
      }
    }

    removeLanguage(index);
  };

  if (isLoading || isFetchingData) {
    return <div className=" text-[#060606] text-lg">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-[#FFF] p-8 rounded-[20px] shadow-md">
      <div className="flex justify-between mb-4 h-10">
        <h2 className="text-[#060606] text-2xl font-normal tracking-tight">{userName}</h2>
        <button
          type="button"
          onClick={() => {
            if (languageFields.length < 3) {
              appendLanguage({
                language: "",
                file: null,
                timestamps: [{ id: Date.now().toString(), chapterName: "", startTime: "00:00:00", endTime: "00:00:00" }],
              });
            }
          }}
          className="bg-orange text-white px-5 py-2 rounded-[28px] text-sm font-normal"
          disabled={languageFields.length >= 3}
        >
          Add New Language
        </button>
      </div>

      {languageFields.map((languageField, langIndex) => (
        <div key={languageField.id} className="bg-[#fef7f3] p-6 rounded-xl shadow-md mb-4">
          <div className="mb-4 flex gap-3">
            <select
              {...register(`languages.${langIndex}.language`, { required: "Language is required" })}
              className="w-full p-3 border rounded-lg text-[#6e6e6e] text-sm font-normal"
            >
              <option value="" disabled>
                Select Language
              </option>
              {availableLanguages
                .filter(
                  (lang) =>
                    !getSelectedLanguages().includes(lang) || languages[langIndex]?.language === lang
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
                onClick={() => handleRemoveLanguage(langIndex)}
                className="h-11 px-5 py-3 bg-[#f91515] rounded-[28px] text-white text-sm font-normal flex items-center gap-2"
              >
                <DeleteIcon stroke="#FFF" /> Remove
              </button>
            )}
          </div>
          <div className="p-5 bg-white rounded-[10px]">
            <TimestampsFieldArray control={control} langIndex={langIndex} register={register} />
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-[10px] mt-6 h-10">
        <button type="button" onClick={handleCancel} className="border border-orange text-orange px-5 py-2 rounded-[28px] text-sm font-normal">
          Cancel
        </button>
        <button type="submit" className="bg-[#f96815] text-white px-5 py-2 rounded-[28px] text-sm font-normal">
          Save Audiobook
        </button>
      </div>
    </form>
  );
};



const TimestampsFieldArray = ({ control, langIndex, register }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `languages.${langIndex}.timestamps`,
  });

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-2">
          <label className="block text-[#060606] text-sm font-normal">Sr No.</label>
        </div>
        <div className="col-span-4">
          <label className="block text-[#060606] text-sm font-normal">Chapter Name</label>
        </div>
        <div className="col-span-5">
          <label className="block text-[#060606] text-sm font-normal">Select File</label>
        </div>
        <div className="col-span-1">
          {/* Remove button column header */}
        </div>
      </div>

      {/* Table Rows */}
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-12 gap-4 mb-4 items-center">
          {/* Sr No. */}
          <div className="col-span-2">
            <div className="text-[#6e6e6e] text-sm font-normal p-2">
              {String(index + 1).padStart(2, '0')}
            </div>
          </div>

          {/* Chapter Name */}
          <div className="col-span-4">
            <input
              type="text"
              {...register(`languages.${langIndex}.timestamps.${index}.chapterName`)}
              placeholder="Select File"
              className="w-full p-2 border border-gray-300 rounded-lg text-[#6e6e6e] text-sm font-normal"
            />
          </div>

          {/* Select File */}
          <div className="col-span-5">
            <div className="relative border rounded-lg p-2 flex items-center bg-white cursor-pointer">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={() => {
                  // Handle file selection if needed
                }}
              />
              <span className="flex-1 text-[#6e6e6e] text-sm font-normal">Select File</span>
              <span className="text-[#060606] ml-2">
                <FileIcon />
              </span>
            </div>
          </div>

          {/* Remove Button */}
          <div className="col-span-1 flex justify-center">
            <button
              type="button"
              onClick={() => remove(index)}
              className="w-8 h-8 bg-[#f91515] rounded-full flex items-center justify-center text-white"
            >
              <CrossIcon />
            </button>
          </div>
        </div>
      ))}

      {/* Add New Chapter Button */}
      <button
        type="button"
        onClick={() => append({ id: Date.now().toString(), chapterName: "", startTime: "00:00:00", endTime: "00:00:00" })}
        className="px-5 py-3 bg-[#157ff9] rounded-[28px] text-white text-sm font-normal"
      >
        + Add New Chapter
      </button>
    </div>
  );
};

export default AudiobookForm;