'use client'
import React, { useState, useTransition } from 'react';
import Image from "next/image";
import preview from "@/assets/images/preview.png";
import { toast } from 'sonner';
import { generatePublishersProfilePicture } from '@/actions';
import { addNewPublisher } from '@/services/admin-services';
import CustomSelect from '@/app/components/CustomSelect';
import UseCategory from '@/utils/useCategory';
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";

type Language = "eng" | "kaz" | "rus";

const validationSchema = yup.object({
  translations: yup.array().of(
    yup.object({
      language: yup.string().required('Language is required'),
      name: yup.string().nullable().transform((value) => value || null),
    })
  ),
  descriptionTranslations: yup.array().of(
    yup.object({
      language: yup.string().required('Language is required'),
      content: yup.string().nullable().transform((value) => value || null),
    })
  ),
  categoryId: yup.array().min(1, 'At least one category is required'),
  country: yup.string().required('Country is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

interface FormValues {
  translations: {
    id: string;
    language: Language;
    name: string | null;
  }[];
  descriptionTranslations: {
    id: string;
    language: Language;
    content: string | null;
  }[];
  categoryId: string[];
  country: string;
  email: string;
  password: string;
}

const Page = () => {
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { category, isLoading } = UseCategory();
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
      categoryId: [],
      country: "",
      email: "",
      password: "",
    }
  });

  const { control, handleSubmit, register, watch, setValue, formState: { errors } } = methods;

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

  const handleCategoryChange = (selectedOptions: any) => {
    const selectedValues = selectedOptions.map((option: any) => option.value);
    setValue('categoryId', selectedValues);
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
    startTransition(async () => {
      try {
        let profilePicKey = null;
        if (imageFile) {
          const { signedUrl, key } = await generatePublishersProfilePicture(
            imageFile.name, 
            imageFile.type, 
            data.email
          );
          
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
          profilePicKey = key;
        }

        // Ensure all languages are included in translations and descriptionTranslations
        const allLanguages: Language[] = ["eng", "kaz", "rus"];

        // Transform translations to include all languages with null for empty content
        const nameTransforms = allLanguages.reduce((acc, lang) => {
          const translation = data.translations.find(t => t.language === lang);
          return {
            ...acc,
            [lang]: translation?.name?.trim() || null
          };
        }, {});

        // Transform descriptionTranslations to include all languages with null for empty content
        const descriptionTransforms = allLanguages.reduce((acc, lang) => {
          const description = data.descriptionTranslations.find(d => d.language === lang);
          return {
            ...acc,
            [lang]: description?.content?.trim() || null
          };
        }, {});

        const { translations, descriptionTranslations, ...filteredData } = data;
        const payload = {
          ...filteredData,
          name: nameTransforms,
          description: descriptionTransforms,
          image: profilePicKey,
        };

        console.log('payload: ', payload);
        const response = await addNewPublisher("/admin/publishers", payload);
        
        if (response?.status === 201) {
          toast.success("Publisher added successfully");
          window.location.href = "/admin/publishers";
        } else {
          toast.error("Failed to add publisher");
        }
      } catch (error) {
        console.error("Error", error);
        toast.error("An error occurred while adding the publisher");
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
                     <p className="mb-1 text-sm text-darkBlack">Name of Publisher</p>
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
                              const languageToRemove = watch(`translations.${index}.language`);
                              removeName(index);
                              setUsedLanguages((prev) => {
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
                <div className="grid grid-cols-2 gap-5">
                  <label>
                    Email
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="email.."
                    />
                    {errors.email && (
                      <span className="text-red-500 text-sm">{errors.email.message}</span>
                    )}
                  </label>
                  <label>
                    Password
                    <input
                      type="text"
                      {...register("password")}
                      placeholder="***"
                    />
                    {errors.password && (
                      <span className="text-red-500 text-sm">{errors.password.message}</span>
                    )}
                  </label>
                </div>
                <CustomSelect
                  name="Categories"
                  isMulti={true}
                  options={category}
                  value={category.filter((option) =>
                    watch('categoryId').includes(option.value)
                  )}
                  onChange={handleCategoryChange}
                  placeholder="Select Categories"
                />
                {errors.categoryId && (
                  <span className="text-red-500 text-sm">{errors.categoryId.message}</span>
                )}
                <label>
                  Country
                  <input
                    type="text"
                    {...register("country")}
                    placeholder="Enter Name"
                  />
                  {errors.country && (
                    <span className="text-red-500 text-sm">{errors.country.message}</span>
                  )}
                </label>
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
                            const languageToRemove = watch(`descriptionTranslations.${index}.language`);
                            removeDescription(index);
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
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-orange text-white text-sm px-4 mt-5 py-[14px] text-center rounded-[28px] w-full"
                >
                  {isPending ? "Adding..." : "Add A New Publisher"}
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