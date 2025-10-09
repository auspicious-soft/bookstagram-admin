// import React, { useState } from "react";
// import Modal from "@mui/material/Modal";
// import { useForm, FormProvider, useFieldArray } from "react-hook-form";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import Image, { StaticImageData } from "next/image";
// import { PlusIcon } from "@/utils/svgicons";
// import sumImg from '@/assets/images/Summary.png';
// import CustomSelect from "@/app/components/CustomSelect";

// type Language = "eng" | "kaz" | "rus";

// type FormValues = {
//   image: File | null;
//   descriptionTranslations: { id: string; language: Language; content: string | null }[];
// };

// const validationSchema = yup.object({
//   image: yup.mixed().required("Image is required"),
//   descriptionTranslations: yup.array().of(
//     yup.object({
//       language: yup.string().required("Language is required"),
//       content: yup.string().nullable().transform((value) => value || null),
//     })
//   ).min(1, "At least one translation is required"),
// });

// interface ModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSubmit?: (data: FormValues) => void;
//   buttonText: string;
//   title: string;
//   image: string | StaticImageData;
//   labelname: string;
//   disabled?: boolean;
// }

// const AddCommonModal: React.FC<ModalProps> = ({
//   open,
//   onClose,
//   onSubmit,
//   buttonText,
//   title,
//   image,
//   labelname,
//   disabled
// }) => {
//   const [previewImage, setPreviewImage] = useState<string>();
//   const [usedDescLanguages, setUsedDescLanguages] = useState<Set<Language>>(new Set());

//   interface OptionType {
//     value: string;
//     label: string;
//   }
//   const categories: OptionType[] = [
//     { value: "bookMarket", label: "Book Market" },
//     { value: "bookStudy", label: "Book Study" },
//     { value: "bookUniversity", label: "Book University" },
//     { value: "bookMaster", label: "Book Masters" },
//   ];
//   const methods = useForm<FormValues>({
//     resolver: yupResolver(validationSchema) as any,
//     defaultValues: {
//       image: null,
//       descriptionTranslations: [{ id: "1", language: "eng", content: "" }],
//     },
//     mode: "onChange",
//   });

//   const { control, handleSubmit, formState: { isValid, errors }, watch, reset } = methods;

//   const { fields: descriptionFields, append, remove } = useFieldArray({
//     control,
//     name: "descriptionTranslations",
//   });

//   // Watch the image field to check if it has a value
//   const imageValue = watch("image");

//   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreviewImage(reader.result as string);
//         methods.setValue("image", file, { shouldValidate: true });
//       };
//       reader.readAsDataURL(file);
//     }
//   };
//  const handleCategoryChange = (selectedOptions: MultiValue<OptionType>) => {
//     const selectedValues = selectedOptions.map((option) => option.value);
//     setValue('category', selectedValues);
//   };
//   const handleFormSubmit = (data: FormValues) => {
//     if (onSubmit) {
//       // Transform descriptionTranslations to include all languages with null for empty content
//       const allLanguages: Language[] = ["eng", "kaz", "rus"];
//       const transformedTranslations = allLanguages.map((lang) => {
//         const existingTranslation = data.descriptionTranslations.find(t => t.language === lang);

//         return {
//           id: existingTranslation?.id || String(allLanguages.indexOf(lang) + 1),
//           language: lang,
//           content: existingTranslation?.content?.trim() || null,
//         };
//       });

//       onSubmit({
//         ...data,
//         descriptionTranslations: transformedTranslations,
//       });
//       handleClose();
//     }
//   };

//   // Handle modal close and reset all state
//   const handleClose = () => {
//     reset({
//       image: null,
//       descriptionTranslations: [{ id: "1", language: "eng", content: "" }],
//     }); // Reset form to default values
//     setPreviewImage(undefined); // Clear image preview
//     setUsedDescLanguages(new Set()); // Clear used languages
//     onClose(); // Call the original onClose
//   };

//   // Determine if the submit button should be disabled
//   const isSubmitDisabled = !isValid || !imageValue || disabled;

//   return (
//     <Modal open={open} onClose={handleClose} aria-labelledby="child-modal-title" className="grid place-items-center">
//       <div className="modal bg-white py-[30px] px-5 max-w-[620px] mx-auto rounded-[20px] w-full h-auto">
//         <div className="max-h-[80vh] overflow-auto overflo-custom">
//           <Image src={image} alt="imgg" width={244} height={194} className="mx-auto" />
//           <h2 className="text-[32px] text-darkBlack mb-5 mt-[27px]">{title}</h2>
//           <FormProvider {...methods}>
//             <form onSubmit={handleSubmit(handleFormSubmit)}>
//               <div className="grid grid-cols-[1fr_2fr] gap-5 main-form mt-4">
//                 <div>
//                   <p className="mb-1 text-sm text-darkBlack">Upload Image</p>
//                   <div className="flex items-center gap-2.5">
//                     {previewImage ? (
//                       <Image
//                         src={previewImage}
//                         alt="Preview"
//                         className="w-[43px] h-[43px] rounded-full object-contain"
//                         width={43}
//                         height={43}
//                       />
//                     ) : (
//                       <div className="bg-[#D9D9D9] h-[43px] w-[43px] rounded-full"></div>
//                     )}
//                     <div className="relative">
//                       <p className="border border-darkBlack text-xs text-[#6E6E6E] py-[7px] px-[15px] rounded-[5px]">
//                         Choose Image
//                       </p>
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleImageChange}
//                         className="absolute inset-0 opacity-0 cursor-pointer !p-0"
//                       />
//                     </div>
//                   </div>
//                   {errors.image && (
//                     <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>
//                   )}
//                 </div>
//                 <div>
//                   {descriptionFields.map((field, index) => (
//                     <div key={field.id}>
//                       <p className="mb-1 text-sm text-darkBlack">{labelname}</p>
//                       <div className="flex items-start gap-[5px] w-full">
//                         <label className="!flex items-start bg-[#F5F5F5] rounded-[10px] w-full">
//                           <select
//                             {...methods.register(`descriptionTranslations.${index}.language`)}
//                             className="!mt-0 max-w-[80px] !bg-[#D9D9D9]"
//                           >
//                             <option value="eng">Eng</option>
//                             <option value="kaz">Kaz</option>
//                             <option value="rus">Rus</option>
//                           </select>
//                           <input
//                             {...methods.register(`descriptionTranslations.${index}.content`)}
//                             type="text"
//                             placeholder="Enter value.."
//                             className="!mt-0 flex-1"
//                           />
//                         </label>
//                         {index === 0 ? (
//                           <button
//                             type="button"
//                             onClick={() => {
//                               const unusedLanguage = ["kaz", "rus"].find(
//                                 (lang) => !usedDescLanguages.has(lang as Language)
//                               );
//                               if (unusedLanguage) {
//                                 append({
//                                   id: String(descriptionFields.length + 1),
//                                   language: unusedLanguage as Language,
//                                   content: "",
//                                 });
//                                 setUsedDescLanguages((prev) => new Set([...prev, unusedLanguage as Language]));
//                               }
//                             }}
//                             disabled={usedDescLanguages.size >= 3}
//                             className="bg-[#70A1E5] text-white px-5 py-3 rounded-[10px] text-sm"
//                           >
//                             Add
//                           </button>
//                         ) : (
//                           <button
//                             type="button"
//                             onClick={() => {
//                               const languageToRemove = methods.getValues(`descriptionTranslations.${index}.language`);
//                               remove(index);
//                               setUsedDescLanguages((prev) => {
//                                 const updated = new Set(prev);
//                                 updated.delete(languageToRemove as Language);
//                                 return updated;
//                               });
//                             }}
//                             className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm"
//                           >
//                             Remove
//                           </button>
//                         )}
//                       </div>
//                       {errors.descriptionTranslations?.[index]?.content && (
//                         <p className="text-red-500 text-xs mt-1">
//                           {errors.descriptionTranslations[index].content.message}
//                         </p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//                 <CustomSelect
//                   name="category"
//                   isMulti={true}
//                   options={categories}
//                   value={categories.filter((option) =>
//                     watch('category').includes(option.value)
//                   )}
//                   onChange={handleCategoryChange}
//                   placeholder="Select Category"
//                 />
//               </div>

//               <div className="mt-[30px] flex gap-2.5 justify-end">
//                 <button
//                   type="submit"
//                   disabled={isSubmitDisabled}
//                   className="flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px] hover:bg-opacity-90 disabled:bg-opacity-50"
//                 >
//                   <PlusIcon />
//                   {buttonText}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleClose}
//                   className="rounded-[28px] border border-darkBlack py-2 px-5 text-sm"
//                 >
//                   Cancel
//                 </button>
//               </div>

//             </form>
//           </FormProvider>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default AddCommonModal;




import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Image, { StaticImageData } from "next/image";
import { PlusIcon } from "@/utils/svgicons";
import CustomSelect from "@/app/components/CustomSelect";
import { MultiValue } from "react-select";

type Language = "eng" | "kaz" | "rus";

type FormValues = {
  image: File | null;
  descriptionTranslations: { id: string; language: Language; content: string | null }[];
  module?: string[]; // ✅ Added for "Add a Category"
};

const validationSchema = yup.object({
  image: yup.mixed().required("Image is required"),
  descriptionTranslations: yup
    .array()
    .of(
      yup.object({
        language: yup.string().required("Language is required"),
        content: yup.string().nullable().transform((value) => value || null),
      })
    )
    .min(1, "At least one translation is required"),
});

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: FormValues) => void;
  buttonText: string;
  title: string;
  image: string | StaticImageData;
  labelname: string;
  disabled?: boolean;
}

const AddCommonModal: React.FC<ModalProps> = ({
  open,
  onClose,
  onSubmit,
  buttonText,
  title,
  image,
  labelname,
  disabled,
}) => {
  const [previewImage, setPreviewImage] = useState<string>();
  const [usedDescLanguages, setUsedDescLanguages] = useState<Set<Language>>(new Set());
  const [selectedModules, setSelectedModules] = useState<string[]>([]); // ✅ state for module selection

  interface OptionType {
    value: string;
    label: string;
  }

  const categories: OptionType[] = [
    { value: "bookMarket", label: "Book Market" },
    { value: "bookStudy", label: "Book Study" },
    { value: "bookUniversity", label: "Book University" },
    { value: "bookMaster", label: "Book Masters" },
  ];

  const methods = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      image: null,
      descriptionTranslations: [{ id: "1", language: "eng", content: "" }],
      module: [], // ✅ default empty array
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
    watch,
    reset,
    setValue,
  } = methods;

  const { fields: descriptionFields, append, remove } = useFieldArray({
    control,
    name: "descriptionTranslations",
  });

  const imageValue = watch("image");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        methods.setValue("image", file, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Handle category (module) change
  const handleCategoryChange = (selectedOptions: MultiValue<OptionType>) => {
    const selectedValues = selectedOptions.map((option) => option.value);
    setSelectedModules(selectedValues);
    setValue("module", selectedValues, { shouldValidate: true });
  };

  const handleFormSubmit = (data: FormValues) => {
    if (onSubmit) {
      const allLanguages: Language[] = ["eng", "kaz", "rus"];
      const transformedTranslations = allLanguages.map((lang) => {
        const existingTranslation = data.descriptionTranslations.find((t) => t.language === lang);
        return {
          id: existingTranslation?.id || String(allLanguages.indexOf(lang) + 1),
          language: lang,
          content: existingTranslation?.content?.trim() || null,
        };
      });

      const finalPayload = {
        ...data,
        descriptionTranslations: transformedTranslations,
        module: selectedModules 
        // ...(title === "Add a Category" && {
          //  module: selectedModules 
          // }), // ✅ add module only for Add a Category
      };

      console.log('finalPayload: ', finalPayload);
      onSubmit(finalPayload);
      handleClose();
    }
  };

  const handleClose = () => {
    reset({
      image: null,
      descriptionTranslations: [{ id: "1", language: "eng", content: "" }],
      module: [],
    });
    setPreviewImage(undefined);
    setUsedDescLanguages(new Set());
    setSelectedModules([]);
    onClose();
  };

  const isSubmitDisabled = !isValid || !imageValue || disabled;

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="child-modal-title" className="grid place-items-center">
      <div className="modal bg-white py-[30px] px-5 max-w-[620px] mx-auto rounded-[20px] w-full h-auto">
        <div className="max-h-[80vh] overflow-auto overflo-custom">
          <Image src={image} alt="imgg" width={244} height={194} className="mx-auto" />
          <h2 className="text-[32px] text-darkBlack mb-5 mt-[27px]">{title}</h2>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="grid grid-cols-[1fr_2fr] gap-5 main-form mt-4">
                {/* Upload Image */}
                <div>
                  <p className="mb-1 text-sm text-darkBlack">Upload Image</p>
                  <div className="flex items-center gap-2.5">
                    {previewImage ? (
                      <Image
                        src={previewImage}
                        alt="Preview"
                        className="w-[43px] h-[43px] rounded-full object-contain"
                        width={43}
                        height={43}
                      />
                    ) : (
                      <div className="bg-[#D9D9D9] h-[43px] w-[43px] rounded-full"></div>
                    )}
                    <div className="relative">
                      <p className="border border-darkBlack text-xs text-[#6E6E6E] py-[7px] px-[15px] rounded-[5px]">
                        Choose Image
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer !p-0"
                      />
                    </div>
                  </div>
                  {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
                </div>

                {/* Description Translations */}
                <div>
                  {descriptionFields.map((field, index) => (
                    <div key={field.id}>
                      <p className="mb-1 text-sm text-darkBlack">{labelname}</p>
                      <div className="flex items-start gap-[5px] w-full">
                        <label className="!flex items-start bg-[#F5F5F5] rounded-[10px] w-full">
                          <select
                            {...methods.register(`descriptionTranslations.${index}.language`)}
                            className="!mt-0 max-w-[80px] !bg-[#D9D9D9]"
                          >
                            <option value="eng">Eng</option>
                            <option value="kaz">Kaz</option>
                            <option value="rus">Rus</option>
                          </select>
                          <input
                            {...methods.register(`descriptionTranslations.${index}.content`)}
                            type="text"
                            placeholder="Enter value.."
                            className="!mt-0 flex-1"
                          />
                        </label>
                        {index === 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              const unusedLanguage = ["kaz", "rus"].find(
                                (lang) => !usedDescLanguages.has(lang as Language)
                              );
                              if (unusedLanguage) {
                                append({
                                  id: String(descriptionFields.length + 1),
                                  language: unusedLanguage as Language,
                                  content: "",
                                });
                                setUsedDescLanguages((prev) => new Set([...prev, unusedLanguage as Language]));
                              }
                            }}
                            disabled={usedDescLanguages.size >= 3}
                            className="bg-[#70A1E5] text-white px-5 py-3 rounded-[10px] text-sm"
                          >
                            Add
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const languageToRemove = methods.getValues(
                                `descriptionTranslations.${index}.language`
                              );
                              remove(index);
                              setUsedDescLanguages((prev) => {
                                const updated = new Set(prev);
                                updated.delete(languageToRemove as Language);
                                return updated;
                              });
                            }}
                            className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {errors.descriptionTranslations?.[index]?.content && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.descriptionTranslations[index].content.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* ✅ Show category multi-select only for "Add a Category" */}
                {title === "Add a Category" && (
                  <div className="col-span-2">
                    {/* <p className="mb-1 text-sm text-darkBlack">Select Modules</p> */}
                    <CustomSelect
                      name="Select Module"
                      isMulti={true}
                      options={categories}
                      value={categories.filter((option) => selectedModules.includes(option.value))}
                      onChange={handleCategoryChange}
                      placeholder="Select Module"
                    />
                  </div>
                )}
              </div>

              <div className="mt-[30px] flex gap-2.5 justify-end">
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px] hover:bg-opacity-90 disabled:bg-opacity-50"
                >
                  <PlusIcon />
                  {buttonText}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-[28px] border border-darkBlack py-2 px-5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </Modal>
  );
};

export default AddCommonModal;
