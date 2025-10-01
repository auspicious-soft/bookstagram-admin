// "use client";
// import React, { useState, useTransition } from "react";
// import Image from "next/image";
// import preview from "@/assets/images/preview.png";
// import { toast } from "sonner";
// import { generateSignedUrlForStories } from "@/actions";
// import { FormProvider, useForm } from "react-hook-form";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { addNewStory } from "@/services/admin-services";
// import { PlusIcon2 } from "@/utils/svgicons";

// type Language = "eng" | "kaz" | "rus";

// interface FileSection {
//   imageFile: File | null;
//   imagePreview: string | null;
//   link: string;
// }

// interface FormValues {
//   translations: {
//     language: Language;
//     name: string;
//   }[];
//   fileSections: FileSection[];
// }

// const validationSchema = yup.object({
//   translations: yup.array().of(
//     yup.object({
//       language: yup.string().oneOf(["eng", "kaz", "rus"]).required(),
//       name: yup.string().required("Name is required"),
//     })
//   ),
//   fileSections: yup.array().of(
//     yup.object({
//       link: yup.string().url("Invalid link").required("Link is required"),
//     })
//   ),
// });

// const Page = () => {
//   const [isPending, startTransition] = useTransition();
//   const [usedLanguages, setUsedLanguages] = useState<Set<Language>>(new Set(["eng"]));

//   const methods = useForm<FormValues>({
//     resolver: yupResolver(validationSchema) as any,
//     defaultValues: {
//       translations: [{ language: "eng", name: "" }],
//       fileSections: [{ imageFile: null, imagePreview: null, link: "" }],
//     },
//   });

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     getValues,
//     watch,
//   } = methods;

//   const translations = watch("translations");
//   const fileSections = watch("fileSections");

//   const triggerFileInputClick = (index: number) => {
//     const fileInput = document.querySelector(`input[data-index="${index}"]`) as HTMLInputElement;
//     if (fileInput) fileInput.click();
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       const reader = new FileReader();
      
//       reader.onload = (e) => {
//         const result = e.target?.result as string;
//         const currentSections = getValues("fileSections");
//         currentSections[index] = {
//           ...currentSections[index],
//           imageFile: file,
//           imagePreview: result,
//         };
//         setValue("fileSections", [...currentSections]);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const addTranslation = () => {
//     const currentTranslations = getValues("translations");
//     const availableLanguages: Language[] = ["eng", "kaz", "rus"];
//     const unusedLanguage = availableLanguages.find(
//       (lang) => !usedLanguages.has(lang as Language)
//     ) as Language;

//     if (unusedLanguage) {
//       setValue("translations", [
//         ...currentTranslations,
//         { language: unusedLanguage, name: "" },
//       ]);
//       setUsedLanguages((prev) => new Set([...prev, unusedLanguage]));
//     }
//   };

//   const removeTranslation = (index: number) => {
//     const currentTranslations = getValues("translations");
//     const languageToRemove = currentTranslations[index].language;
    
//     const newTranslations = currentTranslations.filter((_, i) => i !== index);
//     setValue("translations", newTranslations);
    
//     setUsedLanguages((prev) => {
//       const updated = new Set(prev);
//       updated.delete(languageToRemove);
//       return updated;
//     });
//   };

//   const addFileSection = () => {
//     const currentSections = getValues("fileSections");
//     setValue("fileSections", [...currentSections, { imageFile: null, imagePreview: null, link: "" }]);
//   };

//   const removeFileSection = (index: number) => {
//     const currentSections = getValues("fileSections");
//     const newSections = currentSections.filter((_, i) => i !== index);
//     setValue("fileSections", newSections);
//   };

//   const onSubmit = async (data: FormValues) => {
//     startTransition(async () => {
//       try {
//         const fileObject: Record<string, string> = {};
        
//         // Get the banner name from translations
//         const bannerName = data.translations[0].name.trim();
//         const sanitizedBannerName = bannerName.replace(/\s+/g, "-").toLowerCase();

//         // Upload all images and create the file object
//         for (const section of data.fileSections) {
//           if (section.imageFile && section.link) {
//             const file = section.imageFile;
            
//             try {
//               const { signedUrl, key } = await generateSignedUrlForStories(
//                 file.name,
//                 file.type,
//                 sanitizedBannerName  // This is the 'name' parameter that determines the folder
//               );

//               // Upload the image
//               const uploadResponse = await fetch(signedUrl, {
//                 method: "PUT",
//                 body: file,
//                 headers: {
//                   "Content-Type": file.type,
//                 },
//               });

//               if (!uploadResponse.ok) {
//                 throw new Error("Failed to upload image to S3");
//               }

//               // Use the key returned from generateSignedUrlForStories
//               fileObject[key] = section.link;
//             } catch (error) {
//               console.error(`Error uploading image ${file.name}:`, error);
//               toast.error(`Failed to upload image ${file.name}`);
//             }
//           }
//         }

//         // Include all languages, set empty or removed values to null
//         const allLanguages: Language[] = ["eng", "kaz", "rus"];
//         const nameObject = allLanguages.reduce((acc, lang) => {
//           const translation = data.translations.find(t => t.language === lang);
//           acc[lang] = translation?.name?.trim() || null;
//           return acc;
//         }, {} as Record<Language, string | null>);

//         const payload = {
//           name: nameObject,
//           file: fileObject
//         };
 
//         const response = await addNewStory("/admin/stories", payload);

//         console.log('payload: ', payload);
        
//         if (response?.status === 201) {
//           toast.success("Banner added successfully");
//           window.location.href = "/admin/stories";
//         } else {
//           toast.error("Failed to add banner");
//         }
//       } catch (error: any) {
//         console.error('Submission error:', error);
//         toast.error(
//           error?.response?.status === 400
//             ? error?.response?.data?.message
//             : "An error occurred"
//         );
//       }
//     });
//   };

//   return ( 
//     <div className="bg-white p-5 rounded-[20px]">
//       <div className="main-form bg-white p-[30px] rounded-[20px]">
//         <FormProvider {...methods}>
//           <form onSubmit={handleSubmit(onSubmit)} className="form-box">
//             <div className="">
//               {translations.map((_, index) => (
//                 <div key={index} className="mb-3">
//                   <p className="mb-1 text-sm text-darkBlack">Name/Title of the Story</p>
//                   <div className="flex items-center gap-[5px] w-full">
//                     <label className="!flex bg-[#F5F5F5] rounded-[10px] w-full">
//                       <select
//                         {...register(`translations.${index}.language`)}
//                         className="!mt-0 max-w-[80px] !bg-[#D9D9D9]"
//                       >
//                         <option value="eng">Eng</option>
//                         <option value="kaz">Kaz</option>
//                         <option value="rus">Rus</option>
//                       </select>
//                       <input
//                         type="text"
//                         {...register(`translations.${index}.name`)}
//                         placeholder="Enter name"
//                         className="!mt-0 flex-1"
//                       />
//                     </label>
//                     {index === 0 ? (
//                       <button
//                         type="button"
//                         onClick={addTranslation}
//                         disabled={usedLanguages.size >= 3}
//                         className="bg-[#70A1E5] text-white px-5 py-3 rounded-[10px] text-sm"
//                       >
//                         Add
//                       </button>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={() => removeTranslation(index)}
//                         className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm"
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </div>
//                   {errors.translations?.[index]?.name && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.translations[index]?.name?.message}
//                     </p>
//                   )}
//                 </div>
//               ))}
//               <div className="mt-10 grid gap-2 grid-cols-3">
//                 {fileSections.map((section, index) => (
//                   <div key={index} className="repeat-section mb-8">
//                     <div className="custom relative mb-5">
//                       {section.imagePreview ? (
//                         <div className="relative">
//                           <Image
//                             unoptimized
//                             src={section.imagePreview}
//                             alt="Preview"
//                             width={340}
//                             height={340}
//                             className="rounded-[10px] aspect-square w-full h-full object-cover"
//                           />
//                         </div>
//                       ) : (
//                         <div className="grid place-items-center">
//                           <Image
//                             unoptimized
//                             src={preview}
//                             alt="upload"
//                             width={340}
//                             height={340}
//                             className="rounded-[10px] aspect-square object-cover w-full"
//                           />
//                         </div>
//                       )}
//                       <div className="relative mt-5">
//                         <input
//                           className="absolute top-0 left-0 h-full w-full opacity-0 p-0 cursor-pointer"
//                           type="file"
//                           accept="image/*"
//                           data-index={index}
//                           onChange={(e) => handleImageChange(e, index)}
//                         />
//                         {section.imagePreview ? (
//                           <button
//                             type="button"
//                             onClick={() => triggerFileInputClick(index)}
//                             className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] w-full"
//                           >
//                             Edit
//                           </button>
//                         ) : (
//                           <p
//                             className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] cursor-pointer"
//                             onClick={() => triggerFileInputClick(index)}
//                           >
//                             Upload Image
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                     <label>
//                       Link
//                       <input
//                         type="text"
//                         {...register(`fileSections.${index}.link`)}
//                         placeholder="https://example.com"
//                         className="w-full"
//                       />
//                     </label>
//                     {index > 0 && (
//                       <button
//                         type="button"
//                         onClick={() => removeFileSection(index)}
//                         className="bg-[#FF0004] text-white px-5 py-3 mt-3 rounded-[10px] text-sm"
//                       >
//                         Remove Section
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                <div>
//                <button
//                   type="button"
//                   onClick={addFileSection}
//                   className="bg-[#FFDCBD] text-darkBlack border-orange border [&_*]:mx-auto px-5 py-3 rounded-[10px] text-sm"
//                 >
//                   <PlusIcon2/>
//                   Add
//                 </button>
//                </div>
//               </div>
//               <button
//                 type="submit"
//                 disabled={isPending}
//                 className="bg-orange text-white text-sm px-4 mt-10 py-[14px] text-center rounded-[28px] w-full"
//               >
//                 {isPending ? "Adding Story..." : "Add New Story"}
//               </button>
//             </div>
//           </form>
//         </FormProvider>
//       </div>
//     </div>
//   );
// };

// export default Page;





"use client";
import React, { useState, useTransition } from "react";
import Image from "next/image";
import preview from "@/assets/images/preview.png";
import { toast } from "sonner";
import { generateSignedUrlForStories } from "@/actions";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addNewStory } from "@/services/admin-services";
import { PlusIcon2 } from "@/utils/svgicons";

type Language = "eng" | "kaz" | "rus";

interface FileSection {
  file: File | null;
  filePreview: string | null;
  fileType: "image" | "video" | null;
  link: string;
}

interface FormValues {
  translations: {
    language: Language;
    name: string;
  }[];
  fileSections: FileSection[];
}

const validationSchema = yup.object({
  translations: yup.array().of(
    yup.object({
      language: yup.string().oneOf(["eng", "kaz", "rus"]).required(),
      name: yup.string().required("Name is required"),
    })
  ),
  fileSections: yup.array().of(
    yup.object({
      link: yup.string().url("Invalid link").required("Link is required"),
    })
  ),
});

const Page = () => {
  const [isPending, startTransition] = useTransition();
  const [usedLanguages, setUsedLanguages] = useState<Set<Language>>(new Set(["eng"]));

  const methods = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      translations: [{ language: "eng", name: "" }],
      fileSections: [{ file: null, filePreview: null, fileType: null, link: "" }],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = methods;

  const translations = watch("translations");
  const fileSections = watch("fileSections");

  const triggerFileInputClick = (index: number) => {
    const fileInput = document.querySelector(`input[data-index="${index}"]`) as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileType = file.type.startsWith("video") ? "video" : "image";

      if (fileType === "image") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const currentSections = getValues("fileSections");
          currentSections[index] = {
            ...currentSections[index],
            file,
            filePreview: result,
            fileType,
          };
          setValue("fileSections", [...currentSections]);
        };
        reader.readAsDataURL(file);
      } else {
        // For videos, use object URL instead of base64
        const videoUrl = URL.createObjectURL(file);
        const currentSections = getValues("fileSections");
        currentSections[index] = {
          ...currentSections[index],
          file,
          filePreview: videoUrl,
          fileType,
        };
        setValue("fileSections", [...currentSections]);
      }
    }
  };

  const addTranslation = () => {
    const currentTranslations = getValues("translations");
    const availableLanguages: Language[] = ["eng", "kaz", "rus"];
    const unusedLanguage = availableLanguages.find(
      (lang) => !usedLanguages.has(lang as Language)
    ) as Language;

    if (unusedLanguage) {
      setValue("translations", [
        ...currentTranslations,
        { language: unusedLanguage, name: "" },
      ]);
      setUsedLanguages((prev) => new Set([...prev, unusedLanguage]));
    }
  };

  const removeTranslation = (index: number) => {
    const currentTranslations = getValues("translations");
    const languageToRemove = currentTranslations[index].language;

    const newTranslations = currentTranslations.filter((_, i) => i !== index);
    setValue("translations", newTranslations);

    setUsedLanguages((prev) => {
      const updated = new Set(prev);
      updated.delete(languageToRemove);
      return updated;
    });
  };

  const addFileSection = () => {
    const currentSections = getValues("fileSections");
    setValue("fileSections", [
      ...currentSections,
      { file: null, filePreview: null, fileType: null, link: "" },
    ]);
  };

  const removeFileSection = (index: number) => {
    const currentSections = getValues("fileSections");
    const newSections = currentSections.filter((_, i) => i !== index);
    setValue("fileSections", newSections);
  };

  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      try {
        const fileObject: Record<string, { link: string; type: string }> = {};

        // Get the banner name from translations
        const bannerName = data.translations[0].name.trim();
        const sanitizedBannerName = bannerName.replace(/\s+/g, "-").toLowerCase();

        // Upload all files and create the file object
        for (const section of data.fileSections) {
          if (section.file && section.link) {
            const file = section.file;
            try {
              const { signedUrl, key } = await generateSignedUrlForStories(
                file.name,
                file.type,
                sanitizedBannerName
              );

              const uploadResponse = await fetch(signedUrl, {
                method: "PUT",
                body: file,
                headers: {
                  "Content-Type": file.type,
                },
              });

              if (!uploadResponse.ok) throw new Error("Failed to upload file to S3");

              // include file type too
              fileObject[key] = {
                link: section.link,
                type: section.fileType || "image",
              };
            } catch (error) {
              console.error(`Error uploading ${file.name}:`, error);
              toast.error(`Failed to upload ${file.name}`);
            }
          }
        }

        // Include all languages, set empty or removed values to null
        const allLanguages: Language[] = ["eng", "kaz", "rus"];
        const nameObject = allLanguages.reduce((acc, lang) => {
          const translation = data.translations.find((t) => t.language === lang);
          acc[lang] = translation?.name?.trim() || null;
          return acc;
        }, {} as Record<Language, string | null>);

        const payload = {
          name: nameObject,
          file: fileObject,
        };

        const response = await addNewStory("/admin/stories", payload);

        console.log("payload: ", payload);

        if (response?.status === 201) {
          toast.success("Story added successfully");
          window.location.href = "/admin/stories";
        } else {
          toast.error("Failed to add banner");
        }
      } catch (error: any) {
        console.error("Submission error:", error);
        toast.error(
          error?.response?.status === 400
            ? error?.response?.data?.message
            : "An error occurred"
        );
      }
    });
  };

  return (
    <div className="bg-white p-5 rounded-[20px]">
      <div className="main-form bg-white p-[30px] rounded-[20px]">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="form-box">
            <div className="">
              {translations.map((_, index) => (
                <div key={index} className="mb-3">
                  <p className="mb-1 text-sm text-darkBlack">Name/Title of the Story</p>
                  <div className="flex items-center gap-[5px] w-full">
                    <label className="!flex bg-[#F5F5F5] rounded-[10px] w-full">
                      <select
                        {...register(`translations.${index}.language`)}
                        className="!mt-0 max-w-[80px] !bg-[#D9D9D9]"
                      >
                        <option value="eng">Eng</option>
                        <option value="kaz">Kaz</option>
                        <option value="rus">Rus</option>
                      </select>
                      <input
                        type="text"
                        {...register(`translations.${index}.name`)}
                        placeholder="Enter name"
                        className="!mt-0 flex-1"
                      />
                    </label>
                    {index === 0 ? (
                      <button
                        type="button"
                        onClick={addTranslation}
                        disabled={usedLanguages.size >= 3}
                        className="bg-[#70A1E5] text-white px-5 py-3 rounded-[10px] text-sm"
                      >
                        Add
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeTranslation(index)}
                        className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {errors.translations?.[index]?.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.translations[index]?.name?.message}
                    </p>
                  )}
                </div>
              ))}
              <div className="mt-10 grid gap-2 grid-cols-3">
                {fileSections.map((section, index) => (
                  <div key={index} className="repeat-section mb-8">
                    <div className="custom relative mb-5">
                      {section.filePreview ? (
                        section.fileType === "image" ? (
                          <Image
                            unoptimized
                            src={section.filePreview}
                            alt="Preview"
                            width={340}
                            height={340}
                            className="rounded-[10px] aspect-square w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            controls
                            src={section.filePreview}
                            className="rounded-[10px] aspect-square w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="grid place-items-center">
                          <Image
                            unoptimized
                            src={preview}
                            alt="upload"
                            width={340}
                            height={340}
                            className="rounded-[10px] aspect-square object-cover w-full"
                          />
                        </div>
                      )}
                      <div className="relative mt-5">
                        <input
                          className="absolute top-0 left-0 h-full w-full opacity-0 p-0 cursor-pointer"
                          type="file"
                          accept="image/*,video/*"
                          data-index={index}
                          onChange={(e) => handleFileChange(e, index)}
                        />
                        {section.filePreview ? (
                          <button
                            type="button"
                            onClick={() => triggerFileInputClick(index)}
                            className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] w-full"
                          >
                            Edit
                          </button>
                        ) : (
                          <p
                            className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] cursor-pointer"
                            onClick={() => triggerFileInputClick(index)}
                          >
                            Upload File
                          </p>
                        )}
                      </div>
                    </div>
                    <label>
                      Link
                      <input
                        type="text"
                        {...register(`fileSections.${index}.link`)}
                        placeholder="https://example.com"
                        className="w-full"
                      />
                    </label>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeFileSection(index)}
                        className="bg-[#FF0004] text-white px-5 py-3 mt-3 rounded-[10px] text-sm"
                      >
                        Remove Section
                      </button>
                    )}
                  </div>
                ))}
                <div>
                  <button
                    type="button"
                    onClick={addFileSection}
                    className="bg-[#FFDCBD] text-darkBlack border-orange border [&_*]:mx-auto px-5 py-3 rounded-[10px] text-sm"
                  >
                    <PlusIcon2 />
                    Add
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="bg-orange text-white text-sm px-4 mt-10 py-[14px] text-center rounded-[28px] w-full"
              >
                {isPending ? "Adding Story..." : "Add New Story"}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default Page;
