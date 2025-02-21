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
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-semibold">{userName}</h2>
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

          {/* File Upload */}
          <CustomFileUpload register={register} langIndex={langIndex} />

          {/* Timestamps */}
          <TimestampsFieldArray control={control} langIndex={langIndex} register={register} />
        </div>
      ))}

      {/* Footer Buttons */}
      <div className="flex justify-end gap-[10px] mt-6">
        <button type="button" className="border border-orange text-orange px-5 py-2 rounded-[28px]">Cancel</button>
        <button type="submit" className="bg-orange text-white px-5 py-2 rounded-[28px]">Save Audiobook</button>
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
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0]?.name || "Select File";
            setFileName(selectedFile);
          }}
        />
        <span className="text-gray-500 flex-1">{fileName || "Select File"}</span>
        <span className="text-gray-400">
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
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-4 items-center mb-4 flex-wrap">
          <input type="text" {...register(`languages.${langIndex}.timestamps.${index}.chapterName`)} placeholder="Name of chapter" className="flex-1 p-3 border rounded-lg"  />
          <div className="space-x-4  ">

          <input type="time" step="1" {...register(`languages.${langIndex}.timestamps.${index}.startTime`)} className="p-3 border rounded-lg" />
          <input type="time" step="1" {...register(`languages.${langIndex}.timestamps.${index}.endTime`)} className="p-3 border rounded-lg" />
          <button type="button" onClick={() => remove(index)} className="border-[#989898] border-[1px] text-white px-2 py-2 rounded-[28px]">
            <CrossIcon />
          </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => append({ id: Date.now().toString(), chapterName: "", startTime: "00:00:00", endTime: "00:00:00" })} className="bg-blue-600 text-white px-5 py-2 rounded-lg">
        Add New Timestamp
      </button>
    </>
  );
};

export default AudiobookForm;
