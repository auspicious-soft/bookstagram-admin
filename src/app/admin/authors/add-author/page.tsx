'use client'
import React, { FormEvent, useState, useTransition } from 'react';
import Image from "next/image";
import preview from "@/assets/images/preview.png";
import { toast } from 'sonner';
import { generateAuthorsProfilePicture } from '@/actions';
import { addNewAuthor } from '@/services/admin-services';
import CustomSelect from '@/app/components/CustomSelect';
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";

// Define types for select options
interface OptionType {
  value: string;
  label: string;
}

type MultiValue<T> = T[];

const professions: OptionType[] = [
  { value: "speaker", label: "Speaker" },
  { value: "teacher", label: "Teacher" },
  { value: "poet", label: "Poet" },
  { value: "writer", label: "Writer" },
  { value: "artist", label: "Artist" },
];
const categories: OptionType[] = [
  { value: "bookMarket", label: "Book Market" },
  { value: "bookStudy", label: "Book Study" },
  { value: "bookUniversity", label: "Book University" },
  { value: "bookMaster", label: "Book Masters" },
];

const genresOptions: OptionType[] = [
  { value: "fiction", label: "Fiction" },
  { value: "non-fiction", label: "Non-Fiction" },
  { value: "poetry", label: "Poetry" },
];

type Language = "eng" | "kaz" | "rus";

const validationSchema = yup.object({
  translations: yup.array().of(
    yup.object({
      language: yup.string().required('Language is required'),
      name: yup.string().required('Name is required')
    })
  ),
  descriptionTranslations: yup.array().of(
    yup.object({
      language: yup.string().required('Language is required'),
      content: yup.string().required('Description is required')
    })
  ),
  profession: yup.array().min(1, 'At least one profession is required'),
  category: yup.array().min(1, 'At least one profession is required'),
  country: yup.string().required('Country is required'),
  dob: yup.string().required('Date of birth is required'),
  genres: yup.array().min(1, 'At least one genre is required'),
});

interface FormValues {
  translations: {
    id: string;
    language: Language;
    name: string;
  }[];
  descriptionTranslations: {
    id: string;
    language: Language;
    content: string;
  }[];
  profession: string[];
  category: string[];
  country: string;
  dob: string;
  genres: string[];
}

const Page = () => {
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [usedLanguages, setUsedLanguages] = useState<Set<Language>>(new Set(["eng"]));
  const [usedDescLanguages, setUsedDescLanguages] = useState<Set<Language>>(new Set(["eng"]));

  const methods = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      translations: [
        { id: "1", language: "eng" as Language, name: "" }
      ],
      descriptionTranslations: [
        { id: "1", language: "eng" as Language, content: "" }
      ],
      profession: [],
      category: [],
      country: "",
      dob: "",
      genres: [],
    }
  });

  const { control, handleSubmit, register, watch, setValue, getValues, formState: { errors } } = methods;
  
  const { 
    fields: nameFields, 
    append: appendName, 
    remove: removeName 
  } = useFieldArray({
    control,
    name: "translations"
  });

  const { 
    fields: descriptionFields, 
    append: appendDescription, 
    remove: removeDescription 
  } = useFieldArray({
    control,
    name: "descriptionTranslations"
  });

  const handleGenresChange = (selectedOptions: MultiValue<OptionType>) => {
    const selectedValues = selectedOptions.map((option) => option.value);
    setValue('genres', selectedValues);
  };

  const handleProfessionChange = (selectedOptions: MultiValue<OptionType>) => {
    const selectedValues = selectedOptions.map((option) => option.value);
    setValue('profession', selectedValues);
  };
  const handleCategoryChange = (selectedOptions: MultiValue<OptionType>) => {
    const selectedValues = selectedOptions.map((option) => option.value);
    setValue('category', selectedValues);
  };

  const triggerFileInputClick = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    const userName = data?.translations[0]?.name?.split(" ").join("-").toLowerCase() + "-" + data.dob;
    
    startTransition(async () => {
      try {
        let imageUrl = null;
        if (imageFile) {
          const { signedUrl, key } = await generateAuthorsProfilePicture(imageFile.name, imageFile.type, userName);
          const uploadResponse = await fetch(signedUrl, {
            method: 'PUT',
            body: imageFile,
            headers: {
              'Content-Type': imageFile.type,
            },
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image to S3');
          }
          imageUrl = key;
        }

        // Define all languages and set undefined ones to null
        const allLanguages: Language[] = ["eng", "kaz", "rus"];
        
        // Transform translations arrays to objects, including all languages
        const nameTransforms = allLanguages.reduce((acc, lang) => {
          const translation = data.translations.find(t => t.language === lang);
          return {
            ...acc,
            [lang]: translation ? translation.name : null
          };
        }, {});

        // Transform description translations arrays to objects, including all languages
        const descriptionTransforms = allLanguages.reduce((acc, lang) => {
          const descTranslation = data.descriptionTranslations.find(t => t.language === lang);
          return {
            ...acc,
            [lang]: descTranslation ? descTranslation.content : null
          };
        }, {});

        const { translations, descriptionTranslations, ...filteredData } = data;
        const payload = {
          ...filteredData,
          name: nameTransforms,
          description: descriptionTransforms,
          image: imageUrl,
        };
        
        const response = await addNewAuthor("/admin/authors", payload);
        
        if (response?.status === 201) {
          toast.success("Author added successfully");
          window.location.href = "/admin/authors";
        } else {
          toast.error("Failed to add author");
        }
      } catch (error) {
        console.error("Error", error);
        toast.error("An error occurred while adding the author");
      }
    });
  };

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="form-box">
          <div className="grid grid-cols-[1fr_2fr] gap-5">
            <div>
              <div className="custom relative p-5 bg-white rounded-[20px] h-full">
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      unoptimized
                      src={imagePreview}
                      alt="Preview"
                      width={340}
                      height={340}
                      className="rounded-[10px] w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="grid place-items-center">
                    <Image 
                      unoptimized
                      src={preview}
                      alt="upload"
                      width={340}
                      height={340}
                      className="rounded-[10px] w-full"
                    />
                  </div>
                )}
                <div className="main-form space-y-5 mt-4">
                  {nameFields.map((field, index) => (
                    <div key={field.id}>
                      <p className="mb-1 text-sm text-darkBlack">Name of Author</p>
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
                            onClick={() => {
                              const unusedLanguage = ["eng", "kaz", "rus"].find(
                                (lang) => !usedLanguages.has(lang as Language)
                              );
                              if (unusedLanguage) {
                                appendName({
                                  id: String(nameFields.length + 1),
                                  language: unusedLanguage as Language,
                                  name: "",
                                });
                                setUsedLanguages(
                                  (prev) => new Set([...prev, unusedLanguage as Language])
                                );
                              }
                            }}
                            disabled={usedLanguages.size >= 3}
                            className="bg-[#70A1E5] text-white px-5 py-3 rounded-[10px] text-sm"
                          >
                            Add
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const languageToRemove = field.language;
                              removeName(index);
                              setUsedLanguages((prev) => {
                                const updated = new Set(prev);
                                updated.delete(languageToRemove);
                                return updated;
                              });
                            }}
                            className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="relative mt-4">
                    <input
                      className="absolute top-0 left-0 h-full w-full opacity-0 p-0 cursor-pointer"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview ? (
                      <button
                        type="button"
                        onClick={triggerFileInputClick}
                        className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] w-full"
                      >
                        Edit
                      </button>
                    ) : (
                      <p
                        className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] cursor-pointer"
                        onClick={triggerFileInputClick}
                      >
                        Upload Image
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="main-form bg-white p-[30px] rounded-[30px]">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-[5px]">
                <CustomSelect
                  name="profession"
                  isMulti={true}
                  options={professions}
                  value={professions.filter((option) =>
                    watch('profession').includes(option.value)
                  )}
                  onChange={handleProfessionChange}
                  placeholder="Select Profession"
                />
                <CustomSelect
                  name="category"
                  isMulti={true}
                  options={categories}
                  value={categories.filter((option) =>
                    watch('category').includes(option.value)
                  )}
                  onChange={handleCategoryChange}
                  placeholder="Select Category"
                />
                </div>
                <div className="grid grid-cols-2 gap-[5px]">
                  <label>
                    Country
                    <input
                      type="text"
                      {...register("country")}
                      placeholder="Enter Name" 
                    />
                  </label>
                  <label>
                    Date Of Birth
                    <input
                      type="date"
                      {...register("dob")} 
                    />
                  </label>
                </div>
                <CustomSelect
                  name="genres"
                  isMulti={true}
                  options={genresOptions}
                  value={genresOptions.filter((option) =>
                    watch('genres').includes(option.value)
                  )}
                  onChange={handleGenresChange}
                  placeholder="Select Genres"
                />
                {descriptionFields.map((field, index) => (
                  <div key={field.id}>
                    <p className="mb-1 text-sm text-darkBlack">Description</p>
                    <div className="flex items-start gap-[5px] w-full">
                      <label className="!flex items-start bg-[#F5F5F5] rounded-[10px] w-full">
                        <select
                          {...register(`descriptionTranslations.${index}.language`)}
                          className="!mt-0 max-w-[80px] !bg-[#D9D9D9]"
                        >
                          <option value="eng">Eng</option>
                          <option value="kaz">Kaz</option>
                          <option value="rus">Rus</option>
                        </select>
                        <textarea
                          {...register(`descriptionTranslations.${index}.content`)}
                          rows={5}
                          placeholder="Add Description..."
                          className="!mt-0 flex-1"
                        />
                      </label>
                      {index === 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            const unusedLanguage = ["eng", "kaz", "rus"].find(
                              (lang) => !usedDescLanguages.has(lang as Language)
                            );
                            if (unusedLanguage) {
                              appendDescription({
                                id: String(descriptionFields.length + 1),
                                language: unusedLanguage as Language,
                                content: "",
                              });
                              setUsedDescLanguages(
                                (prev) => new Set([...prev, unusedLanguage as Language])
                              );
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
                            const languageToRemove = field.language;
                            removeDescription(index);
                            setUsedDescLanguages((prev) => {
                              const updated = new Set(prev);
                              updated.delete(languageToRemove);
                              return updated;
                            });
                          }}
                          className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-orange text-white text-sm px-4 mt-5 py-[14px] text-center rounded-[28px] w-full"
                >
                  {isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default Page;