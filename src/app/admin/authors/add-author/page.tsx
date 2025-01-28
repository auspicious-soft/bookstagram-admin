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

const professions = [
  { value: "poet", label: "Poet" },
  { value: "writer", label: "Writer" },
  { value: "artist", label: "Artist" },
];

const genresOptions = [
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
  profession: yup.array().min(1, 'At least one profession is required'),
  country: yup.string().required('Country is required'),
  dob: yup.string().required('Date of birth is required'),
  genres: yup.array().min(1, 'At least one genre is required'),
  description: yup.object({
    eng: yup.string().required('English description is required'),
    kaz: yup.string(),
    rus: yup.string()
  })
});

interface FormValues {
  translations: {
    id: string;
    language: Language;
    name: string;
  }[];
  profession: string[];
  country: string;
  dob: string;
  genres: string[];
  description: {
    [key in Language]?: string;
  };
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
      profession: [],
      country: "",
      dob: "",
      genres: [],
      description: { eng: "" },
    }
  });

  const { control, handleSubmit, register, watch, setValue, getValues, formState: { errors } } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "translations"
  });

  const handleGenresChange = (selectedOptions: any) => {
    const selectedValues = selectedOptions.map((option: any) => option.value);
    setValue('genres', selectedValues);
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

  const addLanguage = (type: 'description') => {
    const targetSet = usedDescLanguages;
    const setFunction = setUsedDescLanguages;
    
    const unusedLanguage = ["eng", "kaz", "rus"].find(
      lang => !targetSet.has(lang as Language)
    );

    if (unusedLanguage) {
      const currentValues = watch('description');
      setValue('description', {
        ...currentValues,
        [unusedLanguage]: ""
      });
      setFunction(prev => new Set([...prev, unusedLanguage as Language]));
    }
  };

  const removeLanguage = (language: Language, type: 'description') => {
    const currentValues = { ...watch('description') };
    delete currentValues[language];
    setValue('description', currentValues);
    
    setUsedDescLanguages(prev => {
      const updated = new Set(prev);
      updated.delete(language);
      return updated;
    });
  };

  const onSubmit = async (data: FormValues) => {
    const userName = data.translations[0].name.split(" ").join("-").toLowerCase() + "-" + data.dob;
    
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

        // Transform translations array to name object
        const nameTransforms = data.translations.reduce((acc, curr) => ({
          ...acc,
          [curr.language]: curr.name
        }), {});

        const payload = {
          ...data,
          name: nameTransforms,
          image: imageUrl,
        };
        
        console.log('payload:', payload);
        
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
                  {fields.map((field, index) => (
                    <div key={field.id}>
                      <div className="flex items-center gap-[5px] w-full">
                        <label className="!flex bg-[#F5F5F5] rounded-[10px] w-full">
                          <select
                            {...register(`translations.${index}.language`)}
                            className="!mt-0 max-w-[80px] !bg-[#D9D9D9]"
                          >
                            <option value="eng">ENG</option>
                            <option value="kaz">KAZ</option>
                            <option value="rus">RUS</option>
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
                                append({
                                  id: String(fields.length + 1),
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
                              remove(index);
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
              <CustomSelect
                name="profession"
                isMulti={true}
                options={professions}
                value={professions.filter((option) =>
                  watch('profession').includes(option.value)
                )}
                onChange={(selectedOptions: any) => {
                  const selectedValues = selectedOptions.map((option: any) => option.value);
                  setValue('profession', selectedValues);
                }}
                placeholder="Select Profession"
              />
                <div className="grid grid-cols-2 gap-[5px]">
                  <label>
                    Country
                    <input
                      type="text"
                      {...register("country")}
                      placeholder="Enter Name"
                      className="w-full p-2 border rounded"
                    />
                  </label>
                  <label>
                    Date Of Birth
                    <input
                      type="date"
                      {...register("dob")}
                      className="w-full p-2 border rounded"
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
                {(["eng", "kaz", "rus"] as Language[]).map((lang) => (
                  <div key={lang}>
                    {(usedDescLanguages.has(lang) || lang === "eng") && (
                      <div className="flex items-center gap-[5px] w-full">
                        <label className="!flex bg-[#F5F5F5] rounded-[10px] w-full">
                          <select
                            disabled
                            className="!mt-0 max-w-[80px] !bg-[#D9D9D9]"
                          >
                            <option value={lang}>{lang.toUpperCase()}</option>
                          </select>
                          <textarea
                            {...register(`description.${lang}`)}
                            rows={5}
                            placeholder="Add Description..."
                            className="!mt-0 flex-1"
                          />
                        </label>
                        {lang === "eng" ? (
                          <button
                            type="button"
                            onClick={() => addLanguage('description')}
                            disabled={usedDescLanguages.size >= 3}
                            className="bg-[#70A1E5] text-white px-5 py-3 rounded-[10px] text-sm"
                          >
                            Add
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeLanguage(lang, 'description')}
                            className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
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