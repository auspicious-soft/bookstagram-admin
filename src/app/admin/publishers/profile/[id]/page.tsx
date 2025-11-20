"use client";
import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import preview from "@/assets/images/preview.png";
import { toast } from "sonner";
import { deleteFileFromS3, generatePublishersProfilePicture } from "@/actions";
import {
  getSinglePublisher,
  updateSinglePublisher,
} from "@/services/admin-services";
import CustomSelect from "@/app/components/CustomSelect";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import UseCategory from "@/utils/useCategory";
import { useSession } from "next-auth/react";
import BookCard from "@/app/admin/components/BookCard";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getProfileImageUrl } from "@/utils/getImageUrl";

type Language = "eng" | "kaz" | "rus";

const validationSchema = yup.object({
  translations: yup.array().of(
    yup.object({
      language: yup.string().required("Language is required"),
      name: yup.string().nullable().transform((value) => value || null),
    })
  ),
  descriptionTranslations: yup.array().of(
    yup.object({
      language: yup.string().required("Language is required"),
      content: yup.string().nullable().transform((value) => value || null),
    })
  ),
  // categoryId: yup.array().min(1, "At least one category is required"),
  country: yup.string().required("Country is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
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
  // categoryId: any[];
  country: string;
  email: string;
  password: string;
}

const Page = () => {
  const { id } = useParams();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();
  const { category } = UseCategory();
  const { data: publisherResponse, mutate } = useSWR(
    `/admin/publishers/${id}`,
    getSinglePublisher
  );
  const publishersData = publisherResponse?.data?.data?.publisher;
  const book = publisherResponse?.data?.data?.booksCount;
  const bookData = publisherResponse?.data?.data?.publisherBooks;
  const session = useSession();
  const role = (session as any)?.data?.user?.role;
  const [usedLanguages, setUsedLanguages] = useState<Set<Language>>(
    new Set(["eng"])
  );
  const [usedDescLanguages, setUsedDescLanguages] = useState<Set<Language>>(
    new Set(["eng"])
  );
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [isPasswordModified, setIsPasswordModified] = useState(false);

  const methods = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      translations: [{ id: "1", language: "eng", name: "" }],
      descriptionTranslations: [{ id: "1", language: "eng", content: "" }],
      // categoryId: [],
      country: "",
      email: "",
      password: "",
    },
  });

  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = methods;

  const {
    fields: nameFields,
    append: appendName,
    remove: removeName,
  } = useFieldArray({
    control,
    name: "translations",
  });

  const {
    fields: descriptionFields,
    append: appendDescription,
    remove: removeDescription,
  } = useFieldArray({
    control,
    name: "descriptionTranslations",
  });
  // const bookName= data?.name?.eng || data?.name?.kaz || data?.name?.rus;
  // console.log('bookName: ', bookName);
  // Initialize form data once when publishersData is available
  useEffect(() => {
    if (publishersData && category && !isFormInitialized) {
      try {
        const selectedCategories = Array.isArray(publishersData.categoryId)
        ? publishersData.categoryId.map((catId) => {
          const id = typeof catId === "object" ? catId._id : catId;
          const foundCategory = category.find((cat) => cat.value === id);
          console.log('foundCategory: ', foundCategory);
          return foundCategory || { value: id, label: catId.name.eng ?? catId.name.rus ?? catId.name.kaz };
        })
        : [];

        const allLanguages: Language[] = ["eng", "kaz", "rus"];
        const nameTranslations = allLanguages.map((lang, index) => {
          const name = publishersData.name?.[lang] || null;
          return {
            id: String(index + 1),
            language: lang,
            name: (name as string)?.trim() || null,
          };
        }).filter(t => t.name != null && (t.name as string).trim() !== "");

        const descriptionTranslations = allLanguages.map((lang, index) => {
          const content = publishersData.description?.[lang] || null;
          return {
            id: String(index + 1),
            language: lang,
            content: (content as string)?.trim() || null,
          };
        }).filter(t => t.content != null && (t.content as string).trim() !== "");

        // Reset form with all values at once
        reset({
          translations: nameTranslations.length > 0 ? nameTranslations : [{ id: "1", language: "eng", name: "" }],
          descriptionTranslations: descriptionTranslations.length > 0 ? descriptionTranslations : [{ id: "1", language: "eng", content: "" }],
          email: publishersData.email || "",
          password: publishersData.password || "",
          // categoryId: selectedCategories,
          country: publishersData.country || "",
        });

        setUsedLanguages(new Set(nameTranslations.map((t) => t.language)));
        setUsedDescLanguages(
          new Set(descriptionTranslations.map((t) => t.language))
        );

        if (publishersData.image) {
          const imageUrl = getProfileImageUrl(publishersData.image);
          setImagePreview(imageUrl);
        }

        setIsFormInitialized(true);
      } catch (error) {
        console.error("Error initializing form:", error);
      }
    }
  }, [publishersData, category, reset, isFormInitialized]);

  // const handleCategoryChange = (selectedOptions: any) => {
  //   setValue("categoryId", selectedOptions || [], { shouldValidate: true });
  // };

  const openBookProfile = (id: string, name: string) => {
    localStorage.setItem("getbookName", name);
    router.push(`/admin/books/${id}`);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      try {
        let profilePicKey = publishersData?.image;
        if (imageFile) {
          const { signedUrl, key } = await generatePublishersProfilePicture(
            imageFile.name,
            imageFile.type,
            data.email
          );

          const uploadResponse = await fetch(signedUrl, {
            method: "PUT",
            body: imageFile,
            headers: {
              "Content-Type": imageFile.type,
            },
            cache: "no-store",
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload image");
          }

          if (publishersData?.image) {
            await deleteFileFromS3(publishersData.image);
          }
          profilePicKey = key;
        }

        // Include all languages, set empty or removed values to null
        const allLanguages: Language[] = ["eng", "kaz", "rus"];
        const nameTransforms = allLanguages.reduce((acc, lang) => {
          const translation = data.translations.find(t => t.language === lang);
          acc[lang] = translation?.name?.trim() || null;
          return acc;
        }, {} as Record<Language, string | null>);

        const descriptionTransforms = allLanguages.reduce((acc, lang) => {
          const description = data.descriptionTranslations.find(d => d.language === lang);
          acc[lang] = description?.content?.trim() || null;
          return acc;
        }, {} as Record<Language, string | null>);

        const { translations, descriptionTranslations, ...filteredData } = data;
        const payload = {
          ...filteredData,
          name: nameTransforms,
          description: descriptionTransforms,
          image: profilePicKey,
          // categoryId: data.categoryId.map((category) => category.value),
        };

        const response = await updateSinglePublisher(
          `/admin/publishers/${id}`,
          payload
        );

        if (response?.status === 200) {
          toast.success("Publisher details updated successfully");
          mutate();
          setIsPasswordModified(false); // Reset password modification state
        } else {
          toast.error("Failed to update publisher");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred while updating the publisher");
      }
    });
  };

  // Watch the password field to detect changes
  const passwordValue = watch("password");

  // Handle password input change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPasswordModified(true);
    setValue("password", e.target.value, { shouldValidate: true });
  };

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
                                  (prev) =>
                                    new Set([
                                      ...prev,
                                      unusedLanguage as Language,
                                    ])
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
                              const languageToRemove = watch(
                                `translations.${index}.language`
                              );
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
                </div>
                <div className="relative mt-4">
                  <input
                    className="absolute top-0 left-0 h-full w-full opacity-0 p-0 cursor-pointer"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] w-full"
                  >
                    Upload Image
                  </button>
                </div>
              </div>
            </div>
            <div className="main-form bg-white p-[30px] rounded-[20px]">
              <div className="space-y-5">
                {role === "admin" && (
                  <div className="grid grid-cols-2 gap-5">
                    <label>
                      Email
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="email.."
                      />
                      {errors.email && (
                        <span className="text-red-500 text-sm">
                          {errors.email.message}
                        </span>
                      )}
                    </label>
                    <label>
                      Password
                      <input
                        type="text"
                        value={isPasswordModified ? passwordValue : "******"}
                        onChange={handlePasswordChange}
                        placeholder="******"
                      />
                      {errors.password && (
                        <span className="text-red-500 text-sm">
                          {errors.password.message}
                        </span>
                      )}
                    </label>
                  </div>
                )}
                <label>
                  Number of Books Released
                  <input
                    type="text"
                    value={book}
                    placeholder="123"
                    readOnly
                    className="!text-orange border border-orange !bg-white"
                  />
                </label>
                {/* <CustomSelect
                  name="Categories"
                  isMulti={true}
                  value={watch("categoryId")}
                  options={category}
                  onChange={handleCategoryChange}
                  placeholder="Selected Categories"
                />
                {errors.categoryId && (
                  <span className="text-red-500 text-sm">
                    {errors.categoryId.message}
                  </span>
                )} */}
                <label>
                  Country
                  <input
                    type="text"
                    {...register("country")}
                    placeholder="Enter Name"
                  />
                  {errors.country && (
                    <span className="text-red-500 text-sm">
                      {errors.country.message}
                    </span>
                  )}
                </label>                     
                {descriptionFields.map((field, index) => (
                  <div key={field.id}>
                    <div className="flex items-start gap-[5px] w-full">
                      <label className="!flex items-start bg-[#F5F5F5] rounded-[10px] w-full">
                        <select
                          {...register(
                            `descriptionTranslations.${index}.language`
                          )}
                          className="!mt-0 max-w-[80px] !bg-[#D9D9D9]"
                        >
                          <option value="eng">Eng</option>
                          <option value="kaz">Kaz</option>
                          <option value="rus">Rus</option>
                        </select>
                        <textarea
                          {...register(
                            `descriptionTranslations.${index}.content`
                          )}
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
                                (prev) =>
                                  new Set([...prev, unusedLanguage as Language])
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
                            const languageToRemove = watch(
                              `descriptionTranslations.${index}.language`
                            );
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
                  {isPending ? "Updating..." : "Update Publisher"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>

      <div className="mt-8">
        <h2 className="text-[32px] text-darkBlack font-aeonikRegular tracking-[0.16px] capitalize">
          Books By The Publisher
        </h2>
        <div className="grid grid-cols-4 gap-6 mt-5">
          {bookData?.length > 0 ? (
            bookData?.map((data: any) => (
              <BookCard
                key={data?._id}
                handleClick={() => openBookProfile(data?._id, data?.name?.eng || data?.name?.kaz || data?.name?.rus)}
                title={data?.name?.eng || data?.name?.kaz || data?.name?.rus}
                price={`$${data?.price}`}
                imgSrc={getProfileImageUrl(data?.image)}
                author={data?.authorId[0]?.name?.eng || data?.authorId[0]?.name?.kaz || data?.authorId[0]?.name?.rus}
                format={data?.format}
                discount={data?.discountPercentage}
              />
            ))
          ) : (
            <p>No data found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;