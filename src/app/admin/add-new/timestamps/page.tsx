"use client";
import { generateSignedUrlAudioBookFile } from "@/actions";
import { addNewBook } from "@/services/admin-services";
import { DeleteIcon, CrossIcon, FileIcon } from "@/utils/svgicons";
import React, { useState, useEffect, startTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from 'sonner';

const AudiobookForm = () => {
  const { register, control, handleSubmit } = useForm({
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
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]); // Track selected languages

  useEffect(() => {
    const data = sessionStorage.getItem('audioBookData');
    if (data) {
      setFormData(JSON.parse(data));
    }
  }, []);
  const userName = formData?.name ? Object.values(formData.name).find(name => name && (name as string).trim() !== "").toString() : "Audiobook Name";  

  const handleCancel = () => {
    sessionStorage.removeItem("audioBookData");
       window.location.href = "/admin/book-hub";
   }
  const onSubmit = async (data: any) => {

    startTransition(async () => {
      try {
        const filePromises = data.languages
          .filter(lang => lang.file)
          .map(async lang => {
            const file = lang.file[0] as File;
            const timestampsMetadata = Array.isArray(lang.timestamps) ? lang.timestamps : [];
            const timestampsEncoded = Buffer.from(JSON.stringify(timestampsMetadata)).toString("base64");

            const { signedUrl, key } = await generateSignedUrlAudioBookFile(
              file.name,
              file.type,
              userName,
              lang.language,
              { timestamps: timestampsEncoded }
            );

            console.log("Generated Signed URL:", signedUrl);

            await fetch(signedUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type },
            });

            return { language: lang.language, fileUrl: key };
          });

        const uploadedFiles = await Promise.all(filePromises);
        const fileTransforms = uploadedFiles.reduce((acc, curr) => ({
          ...acc,
          [curr.language]: curr.fileUrl
        }), {});

        const finalPayload = {
          ...formData,
          file: fileTransforms
        };

        const response = await addNewBook("/admin/books", finalPayload);
        if (response?.status === 201) {
          toast.success("Book added successfully");
          sessionStorage.setItem("audioBookData", "");
          window.location.href = "/admin/book-hub";
        } else {
          toast.error("Failed to add Book");
        }
      } catch (error) {
        console.error("Error", error);
        toast.error("An error occurred while adding the Book");
      }
    });
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguages(prev => [...prev, language]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-[#FFF] p-8 rounded-[20px] shadow-md">
      <div className="flex justify-between mb-4 h-10">
        <h2 className=" text-[#060606] text-2xl font-normal tracking-tight">{userName}</h2>
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
          className="bg-orange text-white px-5 py-2 rounded-[28px]"
          disabled={languageFields.length >= 3}
        >
          Add New Language
        </button>
      </div>

      {languageFields.map((languageField, langIndex) => (
        <div key={languageField.id} className="bg-[#fef7f3] p-6 rounded-xl shadow-md mb-4">
          <div className="mb-4 flex gap-3">
            <select
              {...register(`languages.${langIndex}.language`)}
              onChange={(e) => handleLanguageSelect(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="" disabled>
                Select Language
              </option>
              {["eng", "kaz", "rus"].map((lang) => (
                <option key={lang} value={lang} disabled={selectedLanguages.includes(lang)}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Show Remove button only if there's more than one language field */}
            {languageFields.length > 1 && (
              <button type="button" onClick={() => removeLanguage(langIndex)} className="bg-red-500 text-white px-5 py-2 rounded-[28px] flex items-center gap-2">
                <DeleteIcon stroke="#FFF" /> Remove
              </button>
            )}
          </div>
<div className="p-5 bg-white rounded-[10px] ">
          {/* File Upload */}
          <CustomFileUpload register={register} langIndex={langIndex} />

          {/* Timestamps */}
          <TimestampsFieldArray control={control} langIndex={langIndex} register={register} />
          </div>
        </div>
      ))}

      {/* Footer Buttons */}
      <div className="flex justify-end gap-[10px] mt-6 h-10">
        <button type="button" onClick={()=>handleCancel()} className="border border-orange text-orange px-5 py-2 rounded-[28px]">Cancel</button>
        <button type="submit" className="bg-[#f96815] text-white px-5 py-2 rounded-[28px]">Save Audiobook</button>
      </div>
    </form>
  );
};

// Custom File Upload Component
const CustomFileUpload = ({ register, langIndex }) => {
  const [fileName, setFileName] = useState("");

  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium">Select File</label>
      <div className="relative border rounded-lg p-3 flex items-center bg-white cursor-pointer">
        <input
          type="file"
          {...register(`languages.${langIndex}.file`)}
          className="absolute inset-0 opacity-0 cursor-pointer  text-[#6e6e6e] text-sm font-normal "
          onChange={(e) => {
            const selectedFile = e.target.files?.[0]?.name || "Select File";
            setFileName(selectedFile);
          }}
        />
        <span className=" flex-1 text-[#6e6e6e] text-sm font-normal">{fileName || "Select File"}</span>
        <span className="text-[#060606]">
          <FileIcon />
        </span>
      </div>
    </div>
  );
};

// Timestamp Input Section
const TimestampsFieldArray = ({ control, langIndex, register }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `languages.${langIndex}.timestamps`,
  });

  return (
    <>
      {/* {fields.map((field, index) => (
        <div key={field.id} className="flex gap-4 items-center mb-4 flex-wrap">
          <input type="text" {...register(`languages.${langIndex}.timestamps.${index}.chapterName`)} placeholder="Name of chapter" className=" flex-1 p-3 border rounded-lg text-[#6e6e6e] text-sm font-normal"  />
          <div className="space-x-4  ">

          <input type="time" step="1" {...register(`languages.${langIndex}.timestamps.${index}.startTime`)} className="p-3 border rounded-lg " />
          <input type="time" step="1" {...register(`languages.${langIndex}.timestamps.${index}.endTime`)} className="p-3 border rounded-lg" />
          <button type="button" onClick={() => remove(index)} className="border-[#989898] border-[1px] text-white px-2 py-2 rounded-[28px]">
            <CrossIcon />
          </button>
          </div>
        </div>
      ))} */}
{/*  */}
{fields.map((field, index) => (
  <div key={field.id} className="flex flex-col gap-2 mb-4 w-full">
    <div className="flex flex-wrap items-center gap-2 justify-between md:flex-nowrap">
      {['Name of Chapter', 'Start Time', 'End Time'].map((label, i) => (
        <div key={i} className="flex-1 min-w-[120px] max-w-[33%] md:max-w-[30%]">
          <label className=" mb-1 block text-[#060606] text-sm font-normal ">{label}</label>
          {i === 0 ? (
            <input 
              type="text" 
              {...register(`languages.${langIndex}.timestamps.${index}.chapterName`)} 
              placeholder="Name of chapter" 
              className="w-full p-2 border border-gray-300 rounded-lg text-[#060606] text-sm font-normal "
            />
          ) : i === 1 ? (
            <input 
              type="time" 
              step="1" 
              {...register(`languages.${langIndex}.timestamps.${index}.startTime`)} 
              className="w-full p-2 border border-gray-300 rounded-lg text-[#060606] text-sm font-normal  focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <input 
              type="time" 
              step="1" 
              {...register(`languages.${langIndex}.timestamps.${index}.endTime`)} 
              className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      ))}
      <div className="w-[40px] min-w-[40px]">
      <button type="button" onClick={() => remove(index)} className="border-[#989898] border-[1px] items-center text-white px-2 py-2 rounded-[28px]">
       <CrossIcon />
      </button>
      </div>
    </div>
  </div>
))}
      <button type="button" onClick={() => append({ id: Date.now().toString(), chapterName: "", startTime: "00:00:00", endTime: "00:00:00" })} className=" px-5 py-3 bg-[#157ff9] rounded-[28px] text-white text-sm font-normal  ">
        Add New Timestamp
      </button>
    </>
  );
};

export default AudiobookForm;
