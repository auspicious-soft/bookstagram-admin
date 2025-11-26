'use client'
import React, { FormEvent, useEffect, useState, useTransition, useRef } from 'react';
import Image from "next/image";
import preview from "@/assets/images/preview.png";
import { toast } from 'sonner';
import { deleteFileFromS3, generateAuthorsProfilePicture } from '@/actions';
import { getSingleAuthor, updateSingleAuthor } from '@/services/admin-services';
import CustomSelect from '@/app/components/CustomSelect';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import BookCard from '@/app/admin/components/BookCard';
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { getProfileImageUrl } from '@/utils/getImageUrl';

// Types
interface OptionType {
  value: string;
  label: string;
}

type Language = "eng" | "kaz" | "rus";

const professions: OptionType[] = [
  { value: "speaker", label: "Speaker" },
  { value: "teacher", label: "Teacher" },
  { value: "poet", label: "Poet" },
  { value: "writer", label: "Writer" },
  { value: "artist", label: "Artist" },
  { value: "publicist", label: "Publicist" },
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
  const { id } = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [usedLanguages, setUsedLanguages] = useState<Set<Language>>(new Set(["eng"]));
  const [usedDescLanguages, setUsedDescLanguages] = useState<Set<Language>>(new Set(["eng"]));
  const isFormPopulated = useRef(false);
  const isImageChanged = useRef(false);
  const { data, mutate } = useSWR(`/admin/authors/${id}`, getSingleAuthor);
  const authorBooks = data?.data?.authorBooks;
  const authorData = data?.data?.data;

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
      category:[],
      country: "",
      dob: "",
      genres: [],
    }
  });

  const { control, handleSubmit, register, watch, setValue, reset } = methods;

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

  useEffect(() => {
    if (authorData && !isFormPopulated.current) {
      // Transform name translations, excluding null values
      const nameTranslations = Object.entries(authorData.name || {})
        .filter(([_, name]) => name !== null) // Exclude null values
        .map(([lang, name], index) => ({
          id: String(index + 1),
          language: lang as Language,
          name: name as string,
        }));

      // Transform description translations, excluding null values
      const descTranslations = Object.entries(authorData.description || {})
        .filter(([_, content]) => content !== null) // Exclude null values
        .map(([lang, content], index) => ({
          id: String(index + 1),
          language: lang as Language,
          content: content as string,
        }));

      // Update used languages sets
      setUsedLanguages(new Set(nameTranslations.map((t) => t.language)));
      setUsedDescLanguages(new Set(descTranslations.map((t) => t.language)));

      // Transform professions and genres
      const professionOptions = authorData.profession.map((prof: string) => prof);
      const categoryOptions = authorData.category.map((prof: string) => prof);
      const genreOptions = authorData.genres.map((genre: string) => genre);

      // Format date
      const formattedDate = authorData.dob
        ? new Date(authorData.dob)?.toISOString()?.split("T")[0]
        : "";

      // Reset form with all values
      reset({
        translations: nameTranslations.length > 0 ? nameTranslations : [{ id: "1", language: "eng" as Language, name: "" }],
        descriptionTranslations: descTranslations.length > 0 ? descTranslations : [{ id: "1", language: "eng" as Language, content: "" }],
        profession: professionOptions,
        category: categoryOptions,
        country: authorData.country,
        dob: formattedDate,
        genres: genreOptions,
      });

      // Set image preview if exists
      if (authorData?.image && !isImageChanged.current) {
        const imageUrl = getProfileImageUrl(authorData?.image) ?? "";
        setImagePreview(imageUrl);
      }

      isFormPopulated.current = true;
    }
  }, [authorData, reset]);

  useEffect(() => {
    return () => {
      isFormPopulated.current = false;
      isImageChanged.current = false;
    };
  }, []);

  const handleGenresChange = (selectedOptions: any) => {
    const selectedValues = selectedOptions.map((option: OptionType) => option.value);
    setValue('genres', selectedValues);
  };

  const handleProfessionChange = (selectedOptions: any) => {
    const selectedValues = selectedOptions.map((option: OptionType) => option.value);
    setValue('profession', selectedValues);
  };
  const handleCategoryChange = (selectedOptions: any) => {
    const selectedValues = selectedOptions.map((option: OptionType) => option.value);
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
        isImageChanged.current = true;  // Mark that image has been changed
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    const userName = data?.translations[0]?.name?.split(" ").join("-").toLowerCase() + "-" + data.dob;

    startTransition(async () => {
      try {
        let profilePicKey = null;
        if (imageFile) {
          const { signedUrl, key } = await generateAuthorsProfilePicture(imageFile.name, imageFile.type, userName);
          const uploadResponse = await fetch(signedUrl, {
            method: 'PUT',
            body: imageFile,
            headers: {
              'Content-Type': imageFile.type,
            },
            cache: 'no-store'
          });

          if (!uploadResponse.ok) {
            toast.error('Failed to upload image. Please try again');
            return;
          }

          if (authorData?.profilePic) {
            await deleteFileFromS3(authorData.profilePic);
          }
          profilePicKey = key;
        }

        // Define all possible languages
        const allLanguages: Language[] = ["eng", "kaz", "rus"];

        // Transform translations, setting null for unused languages
        const nameTransforms = allLanguages.reduce((acc, lang) => {
          const translation = data.translations.find(t => t.language === lang);
          return {
            ...acc,
            [lang]: translation ? translation.name : null
          };
        }, {});

        // Transform description translations, setting null for unused languages
        const descriptionTransforms = allLanguages.reduce((acc, lang) => {
          const descTranslation = data.descriptionTranslations.find(t => t.language === lang);
          return {
            ...acc,
            [lang]: descTranslation ? descTranslation.content : null
          };
        }, {});

        const payload = {
          name: nameTransforms,
          description: descriptionTransforms,
          image: profilePicKey,
          profession: data.profession,
          country: data.country,
          dob: data.dob,
          genres: data.genres,
        };

        const response = await updateSingleAuthor(`/admin/authors/${id}`, payload);

        if (response?.status === 200) {
          toast.success("Author details updated successfully");
          mutate();
        } else {
          toast.error("Failed to update author");
        }
      } catch (error) {
        console.error("Error", error);
        toast.error("An error occurred while updating the author");
      }
    });
  };

  const openBookProfile = (id: string, name: string) => {
    localStorage.setItem("getbookName", name);
    router.push(`/admin/books/${id}`)
  }

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="form-box">
          <div className="grid grid-cols-[1fr_2fr] gap-5">
            <div>
              <div className="custom relative p-5 bg-white rounded-[20px]">
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
            <div className="main-form bg-white p-[30px] rounded-[20px]">
              <div className="space-y-5">
                {/* <CustomSelect
                  name="profession"
                  isMulti={true}
                  options={professions}
                  value={professions.filter((option) =>
                    watch('profession').includes(option.value)
                  )}
                  onChange={handleProfessionChange}
                  placeholder="Select Profession"
                /> */}
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
                  {isPending ? "Updating..." : "Update Details"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>

      <div className="mt-10">
        <h2 className="text-[32px] text-darkBlack font-aeonikRegular tracking-[0.16px] capitalize">
          Books By The Author
        </h2>
        <div className="grid grid-cols-4 gap-6 mt-5">
          {authorBooks?.length > 0 ? (
            authorBooks?.map((data: any) => (
              <BookCard
                key={data?._id}
                handleClick={() => openBookProfile(data?._id, data?.name.eng || data?.name.kaz || data?.name.rus)}
                title={data?.name.eng || data?.name.kaz || data?.name.rus}
                price={`$${data?.price}`}
                imgSrc={getProfileImageUrl(data?.image)}
                author={authorData?.name?.eng || authorData?.name?.kaz || authorData?.name?.rus }
                format={data?.format} 
                discount={data?.discountPercentage}               
              />
            ))
          ) : (
            <p>No data found</p> // Show message if no books are available
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;