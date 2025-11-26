"use client";

import { generateSignedUrlAudioBookChaptersFiles, getFileWithMetadata, deleteFileFromS3 } from "@/actions";
import { getSingleBook, updateSingleBook } from "@/services/admin-services";
import { DeleteIcon, FileIcon } from "@/utils/svgicons";
import { useParams } from "next/navigation";
import React, { useState, useEffect, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";

const AudiobookChaptersForm = () => {
  const { id } = useParams();
  const [bookData, setBookData] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const { data, isLoading: isFetchingData } = useSWR(`/admin/audiobook-chapters/product/${id}`, getSingleBook);
  const productId = data?.data?.data?.productData._id;
  const { register, control, handleSubmit, watch, reset, setValue } = useForm({
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

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const courseData = sessionStorage.getItem("audioBookData");
    if (courseData && courseData !== "undefined" && courseData !== "null" && courseData.trim() !== "") {
      const parsedData = JSON.parse(courseData);
      setBookData(parsedData);
      setFormData(parsedData);
    }
  }, []);

  useEffect(() => {
    if (data?.data?.data?.chapters && !isFormInitialized) {
      const chapters = data.data.data.chapters;
      const languagesMap = {};

      chapters.forEach((chapter) => {
        const lang = chapter.lang || 'eng';
        if (!languagesMap[lang]) {
          languagesMap[lang] = [];
        }
        languagesMap[lang].push({
          srNo: chapter.srNo || languagesMap[lang].length + 1,
          chapterName: chapter.name || "",
          file: null,
          existingFile: chapter.file || null, // Store the existing file path
        });
      });

      const formLanguages = Object.entries(languagesMap).map(([lang, chapters]) => ({
        language: lang,
        chapters: Array.isArray(chapters) ? chapters : [],
      }));

      reset({ languages: formLanguages });
      setIsFormInitialized(true);
    }
  }, [data, reset, isFormInitialized]);

  const handleCancel = () => {
    sessionStorage.removeItem("audioBookData");
    window.location.href = "/admin/book-hub";
  };

  // const onSubmit = async (data:any) => {
  //   startTransition(async () => {console.log();
  //     try {
  //       const chaptersData = [];
  //       const existingFiles = data?.data?.data?.chapters?.reduce((acc, chapter) => ({
  //         ...acc,
  //         [chapter.lang]: chapter.file
  //       }), {}) || {};

  //       for (const lang of data.languages) {
  //         if (lang.language && lang.chapters.length > 0) {
  //           for (const chapter of lang.chapters) {
  //             if (chapter.chapterName) {
  //               let fileKey = existingFiles[lang.language];
                
  //               if (chapter.file && chapter.file[0]) {
  //                 const file = chapter.file[0];
  //                 if (fileKey) {
  //                   await deleteFileFromS3(fileKey);
  //                 }

  //                 const { signedUrl, key } = await generateSignedUrlAudioBookChaptersFiles(
  //                   file.name,
  //                   file.type,
  //                   bookData.name.eng,
  //                   lang.language,
  //                 );

  //                 await fetch(signedUrl, {
  //                   method: "PUT",
  //                   body: file,
  //                   headers: { "Content-Type": file.type },
  //                 });

  //                 fileKey = key;
  //               } else if (chapter.existingFile) {
  //                 // Use existing file if no new file is uploaded
  //                 fileKey = chapter.existingFile;
  //               }

  //               if (fileKey) {
  //                 chaptersData.push({
  //                   name: chapter.chapterName,
  //                   description: `Chapter ${chapter.srNo}`,
  //                   srNo: chapter.srNo,
  //                   file: fileKey,
  //                   lang: lang.language,
  //                   productId: productId,
  //                   _id: chapter._id || null
  //                 });
  //               }
  //             }
  //           }
  //         }
  //       }

  //       const payload = {
  //         bookDetails: bookData,
  //         chapters: chaptersData,
  //       };

  //       const response = await updateSingleBook(`/admin/audiobook-chapters`, payload);
  //       if (response?.status === 200 || response?.status === 201) {
  //         toast.success("Audiobook updated successfully");
  //         // sessionStorage.removeItem("audioBookData");
  //         // window.location.href = "/admin/book-hub";
  //       } else {
  //         toast.error("Failed to update Audiobook");
  //       }
  //     } catch (error) {
  //       console.error("Error during submission:", error);
  //       toast.error("An error occurred while updating the Audiobook");
  //     }
  //   });
  // };

  const onSubmit = async (formData) => {
  startTransition(async () => {
    try {
      const chaptersData = [];
      const existingFiles = data?.data?.data?.chapters?.reduce((acc, chapter) => ({
        ...acc,
        [`${chapter.lang}_${chapter.srNo}`]: chapter.file
      }), {}) || {};

      // Create a map of existing chapters by language and srNo for easy lookup of _id
      const existingChaptersMap = data?.data?.data?.chapters?.reduce((acc, chapter) => ({
        ...acc,
        [`${chapter.lang}_${chapter.srNo}`]: chapter
      }), {}) || {};

      for (const lang of formData.languages) {
        if (lang.language && lang.chapters.length > 0) {
          for (const chapter of lang.chapters) {
            if (chapter.chapterName) {
              const chapterKey = `${lang.language}_${chapter.srNo}`;
              const existingChapter = existingChaptersMap[chapterKey];
              let fileKey = existingFiles[chapterKey];
              
              if (chapter.file && chapter.file[0]) {
                const file = chapter.file[0];
                if (fileKey) {
                  await deleteFileFromS3(fileKey);
                }

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

                fileKey = key;
              } else if (chapter.existingFile) {
                // Use existing file if no new file is uploaded
                fileKey = chapter.existingFile;
              }

              if (fileKey) {
                const chapterPayload: {
                  name: any;
                  description: string;
                  srNo: any;
                  file: any;
                  lang: any;
                  productId: any;
                  _id?: any;
                } = {
                  name: chapter.chapterName,
                  description: `Chapter ${chapter.srNo}`,
                  srNo: chapter.srNo,
                  file: fileKey,
                  lang: lang.language,
                  productId: productId,
                };

                // Add _id only if it exists for this specific chapter
                if (existingChapter && existingChapter._id) {
                  chapterPayload._id = existingChapter._id;
                }

                chaptersData.push(chapterPayload);
              }
            }
          }
        }
      }      
      const payload = {
        bookDetails: bookData,
        chapters: chaptersData,
      };
      const bookResponse = await updateSingleBook(`/admin/books/${id}`, bookData);
      const response = await updateSingleBook(`/admin/audiobook-chapters`, payload);
      if (response?.status === 200 || response?.status === 201) {
        toast.success("Audiobook updated successfully");
        sessionStorage.removeItem("audioBookData");
        window.location.href = "/admin/book-hub";
      } else {
        toast.error("Failed to update Audiobook");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error("An error occurred while updating the Audiobook");
    }
  });
};

  const languages = watch("languages");
  const getSelectedLanguages = () => {
    return languages
      .map((lang) => lang.language)
      .filter((lang) => lang !== "" && lang !== undefined);
  };

  const handleRemoveLanguage = async (index) => {
    const languageToRemove = languages[index].language;
    const chapters = data?.data?.data?.chapters?.filter(chapter => chapter.lang === languageToRemove);
    
    if (chapters && chapters.length > 0) {
      try {
        for (const chapter of chapters) {
          if (chapter.file) {
            await deleteFileFromS3(chapter.file);
          }
        }
        toast.success(`Files for ${languageToRemove} removed`);
      } catch (error) {
        console.error("Error deleting files from S3:", error);
        toast.error("Failed to delete files from S3");
      }
    }

    removeLanguage(index);
  };

  if (isFetchingData) {
    return <div className="text-[#060606] text-lg">Loading...</div>;
  }

  const userName = formData?.name
    ? Object.values(formData.name)
        .find((name) => typeof name === "string" && name.trim() !== "")
        ?.toString()
    : "Audiobook Name";

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

          <div className="bg-white rounded-[10px] p-4">
            <ChaptersFieldArray control={control} langIndex={langIndex} register={register} watch={watch} />
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-[10px] mt-6 h-10">
        <button type="button" onClick={handleCancel} className="border border-[#f96815] text-[#f96815] px-5 py-2 rounded-[28px]">
          Cancel
        </button>
        <button disabled={isPending} type="submit" className="bg-[#f96815] text-white px-5 py-2 rounded-[28px] hover:bg-opacity-90 disabled:bg-opacity-50">
          {isPending ? "Saving..." : "Save Audiobook"}
        </button>
      </div>
    </form>
  );
};

const CustomFileUpload = ({ register, chapterIndex, langIndex, existingFileName }) => {
  const [fileName, setFileName] = useState(existingFileName || "");

  // Function to extract filename from path
  const getFileNameFromPath = (filePath) => {
    if (!filePath) return "";
    return filePath.split('/').pop() || "";
  };

  useEffect(() => {
    if (existingFileName) {
      setFileName(getFileNameFromPath(existingFileName));
    }
  }, [existingFileName]);

  return (
    <div className="">
      <div className="h-11 relative border rounded-lg p-3 flex items-center bg-white cursor-pointer">
        <input
          type="file"
          accept="audio/*"
          {...register(`languages.${langIndex}.chapters.${chapterIndex}.file`)}
          className="absolute inset-0 opacity-0 cursor-pointer text-sm font-normal border border-gray-300 text-[#6e6e6e]"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0]?.name || "";
            setFileName(selectedFile);
          }}
        />
        <span className="flex-1 text-[#6e6e6e] text-sm font-normal">
          {fileName || "Select File"}
        </span>
        <span className="text-[#060606]">
          <FileIcon />
        </span>
      </div>
    </div>
  );
};

const ChaptersFieldArray = ({ control, langIndex, register, watch }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `languages.${langIndex}.chapters`,
  });

  const watchedChapters = watch(`languages.${langIndex}.chapters`) || [];

  return (
    <>
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-[20px] mb-4 items-center w-full">
          <div className="w-[8%] flex-col text-[#6e6e6e] text-sm font-normal space-y-[10px]">
            <div className="text-[#060606] text-sm font-normal">Sr No.</div>
            <div className="w-12 px-3.5 py-3 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-2.5">
              {String(index + 1).padStart(2, '0')}
            </div>
          </div>

          <div className="flex-col font-medium text-sm text-[#060606] w-full space-y-[10px]">
            <div>Chapter Name</div>
            <input
              type="text"
              {...register(`languages.${langIndex}.chapters.${index}.chapterName`)}
              placeholder="Chapter Name"
              className="w-full p-2 border border-gray-300 text-[#6e6e6e] text-sm font-normal h-11 px-5 py-4 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-72"
            />
          </div>

          <div className="flex-col font-medium text-sm text-[#060606] w-full space-y-[10px]">
            <div>Select File</div>
            <CustomFileUpload 
              register={register} 
              chapterIndex={index} 
              langIndex={langIndex}
              existingFileName={watchedChapters[index]?.existingFile}
            />
          </div>

          {/* Hidden input to store existing file path */}
          <input
            type="hidden"
            {...register(`languages.${langIndex}.chapters.${index}.existingFile`)}
          />

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

      <button
        type="button"
        onClick={() => append({
          srNo: fields.length + 1,
          chapterName: "",
          file: null,
          existingFile: null
        })}
        className="px-5 py-3 bg-[#157ff9] rounded-[28px] text-white text-sm font-normal flex items-center gap-2"
      >
        <span>+</span> Add New Chapter
      </button>
    </>
  );
};

export default AudiobookChaptersForm;