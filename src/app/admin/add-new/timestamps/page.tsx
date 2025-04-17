"use client";
import { generateSignedUrlAudioBookFile } from "@/actions";
import { addNewBook } from "@/services/admin-services";
import { DeleteIcon, CrossIcon, FileIcon } from "@/utils/svgicons";
import React, { useState, useEffect,  useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

const AudiobookForm = () => {
  const [isPending, startTransition] = useTransition();
  const { register, control, handleSubmit, watch } = useForm({
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

  useEffect(() => {
    const data = sessionStorage.getItem("audioBookData");
    if (data) {
      setFormData(JSON.parse(data));
    }
  }, []);

  const userName = formData?.name
    ? Object.values(formData.name)
        .find((name) => name && (name as string).trim() !== "")
        .toString()
    : "Audiobook Name";

  const handleCancel = () => {
    sessionStorage.removeItem("audioBookData");
    window.location.href = "/admin/book-hub";
  };

  const onSubmit = async (data: any) => {
    startTransition(async () => {
      try {
        const filePromises = data.languages
          .filter((lang) => lang.file && lang.language)
          .map(async (lang) => {
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

            await fetch(signedUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type },
            });

            return { language: lang.language, fileUrl: key };
          });

        const uploadedFiles = await Promise.all(filePromises);

        const fileTransforms = uploadedFiles.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.language]: curr.fileUrl,
          }),
          {}
        );

        const finalPayload = {
          ...formData,
          file: fileTransforms,
        };


        const response = await addNewBook("/admin/books", finalPayload);
        if (response?.status === 201 || response?.status === 200) {
          toast.success("Book added successfully");
          sessionStorage.setItem("audioBookData", "");
          window.location.href = "/admin/book-hub";
        } else {
          toast.error("Failed to add Book");
        }
      } catch (error) {
        console.error("Error during submission:", error);
        toast.error("An error occurred while adding the Book");
      }
    });
  };

  // Watch the languages field to get real-time updates
  const languages = watch("languages");

  // Get the list of currently selected languages dynamically
  const getSelectedLanguages = () => {
    return languages
      .map((lang) => lang.language)
      .filter((lang) => lang !== "" && lang !== undefined);
  };

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
          <div className="p-5 bg-white rounded-[10px]">
            <CustomFileUpload register={register} langIndex={langIndex} />
            <TimestampsFieldArray control={control} langIndex={langIndex} register={register} />
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-[10px] mt-6 h-10">
        <button type="button" onClick={() => handleCancel()} className="border border-orange text-orange px-5 py-2 rounded-[28px]">
          Cancel
        </button>
        <button disabled={isPending} type="submit" className="bg-[#f96815] text-white px-5 py-2 rounded-[28px] hover:bg-opacity-90 disabled:bg-opacity-50">
          {isPending ? "Saving..." :"Save Audiobook"}
        </button>
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
      <div className="h-11 relative border rounded-lg p-3 flex items-center bg-white cursor-pointer">
        <input
          type="file"
          required
          {...register(`languages.${langIndex}.file`)}
          className="absolute inset-0 opacity-0 cursor-pointer text-[#6e6e6e] text-sm font-normal"
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

// Timestamp Input Section
const TimestampsFieldArray = ({ control, langIndex, register }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `languages.${langIndex}.timestamps`,
  });

  return (
    <>
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-2 mb-4 w-full">
          <div className="flex flex-wrap items-center gap-2 justify-between md:flex-nowrap">
            {["Name of Chapter", "Start Time", "End Time"].map((label, i) => (
              <div key={i} className="flex-1 min-w-[120px] max-w-[33%] md:max-w-[30%]">
                <label className="mb-1 block text-[#060606] text-sm font-normal">{label}</label>
                {i === 0 ? (
                  <input
                    type="text"
                    {...register(`languages.${langIndex}.timestamps.${index}.chapterName`)}
                    placeholder="Name of chapter"
                    className="w-full p-2 border border-gray-300 rounded-lg text-[#6e6e6e] text-sm font-normal"
                  />
                ) : i === 1 ? (
                  <input
                    type="time"
                    step="1"
                    {...register(`languages.${langIndex}.timestamps.${index}.startTime`)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-[#6e6e6e] text-sm font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type="time"
                    step="1"
                    {...register(`languages.${langIndex}.timestamps.${index}.endTime`)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-[#6e6e6e] text-sm font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}
            <div className="mt-[20px]">
              <button
                type="button"
                onClick={() => remove(index)}
                className="border-[#989898] border-[1px] items-center text-white p-[5px] rounded-[28px]"
              >
                <CrossIcon />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ id: Date.now().toString(), chapterName: "", startTime: "00:00:00", endTime: "00:00:00" })}
        className="px-5 py-3 bg-[#157ff9] rounded-[28px] text-white text-sm font-normal"
      >
        Add New Timestamp
      </button>
    </>
  );
};

export default AudiobookForm;