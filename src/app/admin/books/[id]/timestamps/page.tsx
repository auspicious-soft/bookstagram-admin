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
 const [isLoading, setIsLoading] = useState(true); // Loading state
 const { data, isLoading: isFetchingData } = useSWR(`/admin/books/${id}`, getSingleBook);

 const fileName = data?.data?.data?.books?.[0]?.file || {};
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
 const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
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
     metas[lang] = metadata?.timestamps ? metadata.timestamps : [];
    } catch (error) {
     console.error(`Error fetching metadata for ${lang}:`, error);
     metas[lang] = [];
    }
   }
   setFileUrls(urls);
   setMetadatas(metas);
   setIsLoading(false); // Set loading to false once data is fetched
  };

  if (Object.keys(fileName).length > 0) {
   fetchFileMetadata();
  } else {
   setIsLoading(false); // No files to fetch, stop loading
  }
 }, [fileName]);

 useEffect(() => {
  if (fileUrls && metadatas && !isFormInitialized) {
   const languages = Object.entries(fileName).map(([lang, path]) => ({
    language: lang,
    file: null,
    timestamps: metadatas[lang] || [],
   }));
   reset({ languages });
   setSelectedLanguages(Object.keys(fileName));
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
 }
 const onSubmit = async (data: any) => {
  startTransition(async () => {
   try {
    const filePromises = data.languages.map(async (lang) => {
     const timestampsEncoded = Buffer.from(JSON.stringify(lang.timestamps || [])).toString("base64");
     const existingFilePath = fileName[lang.language];

     // If new file is uploaded
     if (lang.file?.[0]) {
      // Delete existing file if it exists
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

     // If no new file but metadata changed
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

    if (response?.status === 200) {
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

 const handleRemoveLanguage = async (index: number) => {
  const languageToRemove = languageFields[index].language;
  const filePath = fileName[languageToRemove];

  if (filePath) {
   try {
    await deleteFileFromS3(filePath); // Delete the file from S3
    toast.success(`File for ${languageToRemove} deleted from S3`);
   } catch (error) {
    console.error("Error deleting file from S3:", error);
    toast.error("Failed to delete file from S3");
   }
  }

  removeLanguage(index);
  setSelectedLanguages(selectedLanguages.filter((lang) => lang !== languageToRemove));
 };

 if (isLoading || isFetchingData) {
  return (
   <div className="">
    Loading...
    {/* <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div> */}
   </div>
  );
 }

 return (
  <form onSubmit={handleSubmit(onSubmit)} className="bg-[#FFF] p-8 rounded-[20px] shadow-md">
   <div className="flex justify-between mb-4 h-10">
    <h2 className=" text-[#060606] text-2xl font-normal tracking-tight">{userName}</h2>
    {languageFields.length < 3 && (
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
      className="bg-[#f96815] text-white text-sm font-normal px-5 py-2 rounded-[28px]"
      disabled={languageFields.length >= 3}
     >
      Add New Language
     </button>
    )}
   </div>

   {languageFields.map((languageField, langIndex) => (
    <div key={languageField.id} className="bg-[#fef7f3] p-6 rounded-xl shadow-md mb-4 relative">
     <div className="mb-4 flex gap-3 items-center">
      <select
       {...register(`languages.${langIndex}.language`)}
       onChange={(e) => {
        const newLang = e.target.value;
        const prevLang = languageField.language;
        if (prevLang) {
         setSelectedLanguages(selectedLanguages.filter((l) => l !== prevLang));
        }
        setSelectedLanguages([...selectedLanguages, newLang]);
        setValue(`languages.${langIndex}.language`, newLang);
       }}
       className="w-full p-3 border rounded-lg"
      >
       <option value="" disabled>
        Select Language
       </option>
       {availableLanguages.map((lang) => (
        <option key={lang} value={lang} disabled={selectedLanguages.includes(lang) && languageField.language !== lang}>
         {lang.toUpperCase()}
        </option>
       ))}
      </select>
      {languageFields.length > 1 && (
       <button type="button" onClick={() => handleRemoveLanguage(langIndex)} className="bg-[#f91515]  text-white text-sm font-normal  px-5 py-2 rounded-[28px] flex items-center gap-2">
        <DeleteIcon stroke="#FFF" /> Remove
       </button>
      )}
     </div>
     <div className="p-5 bg-white rounded-[10px] ">
      <CustomFileUpload register={register} langIndex={langIndex} existingFile={fileName[languageField.language]} watch={watch} />
      <TimestampsFieldArray control={control} langIndex={langIndex} register={register} />
     </div>
    </div>
   ))}

   <div className="flex justify-end gap-[10px] mt-6 h-10">
    <button type="button" onClick={()=>handleCancel()} className="text-[#f96815] text-sm font-normal rounded-[28px] border border-[#f96815] px-5 py-2 ">
     Cancel
    </button>
    <button type="submit" className="bg-[#f96815] text-white text-sm font-normal px-5 py-2 rounded-[28px]">
     Save Audiobook
    </button>
   </div>
  </form>
 );
};

const CustomFileUpload = ({ register, langIndex, existingFile, watch }) => {
 const file = watch(`languages.${langIndex}.file`);
 const [fileName, setFileName] = useState(existingFile ? existingFile.split("/").pop() : "");

 useEffect(() => {
  if (file?.[0]) {
   setFileName(file[0].name);
  }
 }, [file]);

 return (
  <div className="mb-4 ">
   <label className="block mb-1 text-sm font-medium">Select File</label>
   <div className="relative border rounded-lg p-3 flex items-center bg-white cursor-pointer">
    <input type="file" {...register(`languages.${langIndex}.file`)} className="absolute inset-0 opacity-0 cursor-pointer" />
    <span className="text-[#6e6e6e] text-sm font-normal flex-1">{fileName || "Select File"}</span>
    <FileIcon />
   </div>
  </div>
 );
};

const TimestampsFieldArray = ({ control, langIndex, register }) => {
 const { fields, append, remove } = useFieldArray({
  control,
  name: `languages.${langIndex}.timestamps`,
 });

 return (
  <>
   {fields.map((field, index) => (
    <div key={field.id} className="flex gap-4 items-center mb-4 flex-wrap">
     <input type="text" {...register(`languages.${langIndex}.timestamps.${index}.chapterName`)} placeholder="Name of chapter" className="flex-1 p-3 border rounded-lg text-[#6e6e6e] text-sm font-normal" />
     <div className="space-x-4">
      <input type="time" step="1" {...register(`languages.${langIndex}.timestamps.${index}.startTime`)} className="p-3 border rounded-lg" />
      <input type="time" step="1" {...register(`languages.${langIndex}.timestamps.${index}.endTime`)} className="p-3 border rounded-lg" />
      <button type="button" onClick={() => remove(index)} className="border-[#989898] border-[1px] text-white px-2 py-2 rounded-[28px]">
       <CrossIcon />
      </button>
     </div>
    </div>
   ))}
   <button type="button" onClick={() => append({ id: Date.now().toString(), chapterName: "", startTime: "00:00:00", endTime: "00:00:00" })} className="px-5 py-3 bg-[#157ff9] rounded-[28px] text-white text-sm font-normal">
    Add New Timestamp
   </button>
  </>
 );
};

export default AudiobookForm;
