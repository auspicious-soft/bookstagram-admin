'use client'
import React, { useEffect, useRef, useState, useTransition } from 'react';
import Image from "next/image";
import preview from "@/assets/images/preview.png";
import { useParams, useSearchParams } from "next/navigation";
import UseAuthors from "@/utils/useAuthor";
import UseSubCategory from "@/utils/useSubCategory";
import UsePublisher from "@/utils/usePublisher";
import UseCategory from "@/utils/useCategory";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from 'sonner';
import { generateSignedUrlBookFiles, generateSignedUrlBooks } from '@/actions';
import CustomSelect from '@/app/components/CustomSelect';
import { addNewBook, getSingleBook, updateSingleBook, deleteAudiobookChapters } from '@/services/admin-services';
import useSWR from 'swr';
import { DashboardIcon1, DashboardIcon2 } from '@/utils/svgicons';
import DashboardCard from '../../components/DashboardCard';
import { useRouter } from 'next/navigation';
import { getProfileImageUrl } from '@/utils/getImageUrl';

type Language = "eng" | "kaz" | "rus";

interface OptionType {
  value: string;
  label: string;
}

const genresOptions: OptionType[] = [
  { value: "fiction", label: "Fiction" },
  { value: "non-fiction", label: "Non-Fiction" },
  { value: "poetry", label: "Poetry" },
  { value: "anti", label: "Anti" },
];

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
  fileTranslations: {
    id: string;
    language: Language;
    file: File | null;
  }[];
  price: number;
  authorId: string[];
  publisherId: string;
  categoryId: string[];
  subCategoryId: string[];
  genre: string[];
  type: string;
  image: File | null;
  format?: string;
}

const BookForm = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = useSWR(`/admin/books/${id}`, getSingleBook, { revalidateOnFocus: false });
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [usedLanguages, setUsedLanguages] = useState<Set<Language>>(new Set(["eng"]));
  const [usedDescLanguages, setUsedDescLanguages] = useState<Set<Language>>(new Set(["eng"]));
  const [usedFileLanguages, setUsedFileLanguages] = useState<Set<Language>>(new Set(["eng"]));
  const isFormPopulated = useRef(false);
  const isImageChanged = useRef(false);
  const initialFormat = useRef<string>('');
  const bookData = data?.data?.data?.books?.[0];
  const upperData = data?.data?.data;
  const bookType = data?.data?.data?.books?.[0]?.type;
  const moduleType = data?.data?.data?.books?.[0]?.module;
  const isAudioEbook = bookType === 'audio&ebook';
  const isEbookOrPodcast = bookType === 'e-book' || bookType === 'podcast';

  const getAcceptedFileTypes = () => {
    switch (bookType) {
      case "podcast":
      case "video-lecture":
        return ".mp4,.mov,.avi"; // Video files for podcast and video-lecture
      case "audio&ebook":
        return ".epub";
      default:
        return ""; // No restrictions for other types
    }
  };
  const validationSchema = yup.object({
    translations: yup.array().of(
      yup.object({
        language: yup.string(),
        name: yup.string().nullable()
      })
    ),
    descriptionTranslations: yup.array().of(
      yup.object({
        language: yup.string().required('Language is required'),
        content: yup.string().required('Description is required').nullable()
      })
    ),
    ...(isAudioEbook && {
      format: yup.string().oneOf(['e-book', 'audiobook', 'both']).required('Format is required'),
    }),
    fileTranslations: isAudioEbook
      ? yup.array().when('format', {
        is: 'audiobook',
        then: (schema) => schema.notRequired().optional(),
        otherwise: (schema) => schema.of(
          yup.object().shape({
            language: yup.string().required("Language is required"),
            file: yup.mixed().required("File is required"),
          })
        ),
      })
      : (bookType !== 'audiobook' && bookType !== 'course')
        ? yup.array().of(
          yup.object().shape({
            language: yup.string().required("Language is required"),
            file: yup.mixed().required("File is required"),
          })
        )
        : yup.array().notRequired().optional(),
    price: yup.number().required('Price is required'),
    authorId: yup.array().min(1, 'At least one author is required'),
    publisherId: yup.string().min(1, 'Publisher is required'),
    categoryId: yup.array().min(1, 'Category is required'),
    genre: yup.array().required('Genre is required')
  });

  const OverviewData = [
    { id: "1", title: "No of Book Sold", value: upperData?.totalBookSold, icon: <DashboardIcon2 /> },
    { id: "2", title: "Revenue By This Book", value: `$${upperData?.totalRevenue}`, icon: <DashboardIcon1 /> },
  ];

  const { authors } = UseAuthors(moduleType);
  const { publishers } = UsePublisher();
  const { category } = UseCategory(moduleType);
  // const { subCategory } = UseSubCategory();
  // const current = bookData?.categoryId,

  const methods = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      translations: [{ id: "1", language: "eng", name: "" }],
      descriptionTranslations: [{ id: "1", language: "eng", content: "" }],
      fileTranslations: [{ id: "1", language: "eng", file: null }],
      price: 0,
      authorId: [],
      publisherId: "",
      categoryId: [],
      subCategoryId: [],
      genre: [],
      type: bookType,
      image: null,
      ...(isAudioEbook && { format: 'both' }),
    }
  });

  const { control, handleSubmit, register, watch, setValue, reset, formState: { errors } } = methods;

  const { fields: nameFields, append: appendName, remove: removeName } = useFieldArray({
    control,
    name: "translations"
  });

  const { fields: descriptionFields, append: appendDescription, remove: removeDescription } = useFieldArray({
    control,
    name: "descriptionTranslations"
  });

  const { fields: fileFields, append: appendFile, remove: removeFile } = useFieldArray({
    control,
    name: "fileTranslations"
  });

  const format = watch('format');
  const currentSelectedCategory = watch('categoryId')
  const { subCategory } = UseSubCategory(currentSelectedCategory);
  const showFiles = isAudioEbook ? (format === 'e-book' || format === 'both') : (bookType !== 'audiobook' && bookType !== 'course');

  const isNext = isAudioEbook ? (format === 'audiobook' || format === 'both') : (bookType === 'audiobook' || bookType === 'course');

  const shouldUploadFiles = isAudioEbook ? (format !== 'audiobook') : (bookType !== 'audiobook' && bookType !== 'course');

  useEffect(() => {
    if (bookData && !isFormPopulated.current) {
      const nameTranslations = Object.entries(bookData.name || {})
        .filter(([_, name]) => name != null && (name as string).trim() !== '')
        .map(([lang, name], index) => ({
          id: String(index + 1),
          language: lang as Language,
          name: name as string
        }));

      const descTranslations = Object.entries(bookData.description || {})
        .filter(([_, content]) => content != null && (content as string).trim() !== '')
        .map(([lang, content], index) => ({
          id: String(index + 1),
          language: lang as Language,
          content: content as string
        }));

      const fileTranslations = Object.entries(bookData.file || {})
        .filter(([_, file]) => file != null)
        .map(([lang, file], index) => ({
          id: String(index + 1),
          language: lang as Language,
          file: file as File | null
        }));

      setUsedLanguages(new Set(nameTranslations.map(t => t.language)));
      setUsedDescLanguages(new Set(descTranslations.map(t => t.language)));
      setUsedFileLanguages(new Set(fileTranslations.map(t => t.language)));

      reset({
        translations: nameTranslations.length > 0 ? nameTranslations : [{ id: "1", language: "eng", name: "" }],
        descriptionTranslations: descTranslations.length > 0 ? descTranslations : [{ id: "1", language: "eng", content: "" }],
        fileTranslations: fileTranslations.length > 0 ? fileTranslations : [{ id: "1", language: "eng", file: null }],
        price: bookData.price,
        authorId: bookData.authorId.map((author: any) => author?._id),
        publisherId: bookData.publisherId?._id,
        categoryId: bookData.categoryId.map((cat: any) => cat?._id),
        subCategoryId: bookData.subCategoryId?.map((subCat: any) => subCat?._id) || [],
        genre: bookData.genre?.map((g: any) => g),
        type: bookData.type,
        image: null,
        ...(isAudioEbook && { format: bookData.format || 'both' }),
      });

      initialFormat.current = bookData.format || (bookType === 'e-book' ? 'e-book' : bookType === 'audiobook' ? 'audiobook' : 'both');

      if (bookData?.image && !isImageChanged.current) {
        const imageUrl = getProfileImageUrl(bookData?.image);
        setImagePreview(imageUrl);
      }

      isFormPopulated.current = true;
    }
  }, [bookData, reset]);

  useEffect(() => {
    return () => {
      isFormPopulated.current = false;
      isImageChanged.current = false;
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        isImageChanged.current = true;
      };
      reader.readAsDataURL(file);
    }
  };

  // const handleSelectChange = (name: string, value: any) => {
  //   setValue(name as any, Array.isArray(value) ? value.map(v => v.value) : value.value);
  // };

  const handleSelectChange = (name: string, value: any) => {
    if (Array.isArray(value)) {
      setValue(name as any, value.map(v => v.value)); // multi-select
    } else {
      setValue(name as any, value?.value || ""); // single-select
    }
  };
  const onSubmit = async (data: FormValues) => {
    const userName = data.translations[0].name?.split(" ").join("-").toLowerCase() || "default-book";

    startTransition(async () => {
      try {
        let imageUrl = null;

        // Upload new image only if changed
        if (imageFile) {
          const { signedUrl, key } = await generateSignedUrlBooks(imageFile.name, imageFile.type, userName);
          await fetch(signedUrl, {
            method: "PUT",
            body: imageFile,
            headers: { "Content-Type": imageFile.type },
          });
          imageUrl = key;
        }

        let uploadedFiles: { language: Language; fileUrl: string }[] = [];

        if (shouldUploadFiles) {
          const filePromises = data.fileTranslations.map(async (trans) => {
            // if file is File (new upload)
            if (trans.file instanceof File) {
              const file = trans.file;
              const { signedUrl, key } = await generateSignedUrlBookFiles(file.name, file.type, userName, trans.language);

              await fetch(signedUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
              });

              return { language: trans.language, fileUrl: key };
            }

            // if file is string (already in DB) -> reuse it
            if (typeof trans.file === "string") {
              return { language: trans.language, fileUrl: trans.file };
            }

            return null;
          });

          uploadedFiles = (await Promise.all(filePromises)).filter(Boolean) as {
            language: Language;
            fileUrl: string;
          }[];
        }

        // Name translations
        const nameTransforms = data.translations
          .filter((trans) => trans.name != null && trans.name.trim() !== "")
          .reduce((acc, curr) => ({ ...acc, [curr.language]: curr.name }), {});

        // Description translations
        const descriptionTransforms = data.descriptionTranslations
          .filter((trans) => trans.content != null && trans.content.trim() !== "")
          .reduce((acc, curr) => ({ ...acc, [curr.language]: curr.content }), {});

        // File transformations (reuse old + new uploads)
        const fileTransforms = uploadedFiles.reduce(
          (acc, curr) => ({ ...acc, [curr.language]: curr.fileUrl }),
          {}
        );

        const payload = {
          name: Object.keys(nameTransforms).length > 0 ? nameTransforms : { eng: "Untitled Book" },
          description:
            Object.keys(descriptionTransforms).length > 0
              ? descriptionTransforms
              : { eng: "No description provided" },
          file: fileTransforms,
          price: data.price,
          authorId: data.authorId,
          publisherId: data.publisherId,
          categoryId: data.categoryId,
          subCategoryId: data.subCategoryId,
          genre: data.genre,
          type: data.type,
          ...(isAudioEbook && { format: data.format }),
          ...(imageUrl && { image: imageUrl }),
        };

        if (id && isAudioEbook) {
          const prevFormat = initialFormat.current;
          const currFormat = data.format || '';
          if (currFormat !== prevFormat) {
            if (currFormat === 'audiobook' && (prevFormat === 'e-book' || prevFormat === 'both')) {
              payload.file = {};
            }
            if (currFormat === 'e-book' && (prevFormat === 'audiobook' || prevFormat === 'both')) {
              const deleteAudioBook = await deleteAudiobookChapters(`/admin/audiobook-chapters/product/${id}`);
            }
          }
        }

        let bookId = id as string;
        const isNew = !id;
        if (isNew || !isNext) {
          const action = isNew ? addNewBook : updateSingleBook;
          const url = isNew ? "/admin/books" : `/admin/books/${id}`;
          const response = await action(url, payload);
          if ((isNew && response?.status !== 201) || (!isNew && response?.status !== 200)) {
            toast.error(`Failed to ${isNew ? 'add' : 'update'} Book`);
            return; // Ensure no value is returned
          }
          toast.success(`Book ${isNew ? 'added' : 'updated'} successfully`);
          if (isNew) {
            bookId = response.data.data.books[0]._id; // Update bookId
          }
        }

        if (isNext) {
          let storageKey: string;
          let path: string;
          if (data.type === "course") {
            storageKey = "courseData";
            path = "lessons";
          } else {
            storageKey = "audioBookData";
            path = "timestamps";
          }
          sessionStorage.setItem(storageKey, JSON.stringify(payload));
          router.push(`/admin/books/${bookId}/${path}`);
        }
      } catch (error) {
        console.error("Error", error);
        toast.error(`An error occurred while ${id ? 'updating' : 'adding'} the Book`);
      }
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const onError = (errors: any) => {
    console.log(errors);
    toast.error("Please fill all required fields correctly");
  };

  return (
    <div>
      <div className='grid grid-cols-4 gap-4 mb-[60px]'>
        {OverviewData.map((card) => (
          <DashboardCard
            key={card.id}
            icon={card.icon}
            title={card.title}
            value={card.value}
          />
        ))}
      </div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="form-box">
          <div className="grid grid-cols-[1fr_2fr] gap-5">
            <div>
              <div className="custom relative p-5 bg-white rounded-[20px]">
                {imagePreview ? (
                  <div className="relative h-full">
                    <Image src={imagePreview} unoptimized alt="Preview" width={340} height={340} className="rounded-[10px] w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="grid place-items-center h-full w-full">
                    <Image src={preview} alt="upload" width={340} height={340} className="rounded-[10px] w-full" />
                  </div>
                )}
                <div className="relative mt-5">
                  <input className="absolute top-0 left-0 h-full w-full opacity-0 p-0 cursor-pointer" type="file" accept="image/*" onChange={handleImageChange} />
                  <button type="button"
                    className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] w-full"
                  >{imagePreview ? 'Edit Image' : 'Upload Image'}</button>
                </div>
              </div>
              <div className="mt-5">
                {showFiles &&
                  fileFields.map((field, index) => (
                    <div key={field.id} className="mb-4">
                      <div className="w-full">
                        <div className="bg-white p-5 rounded-[20px]">
                          <input
                            type="file"
                            accept={getAcceptedFileTypes()}
                            className="border border-[#BDBDBD] py-5 rounded-[10px] px-5 bg-[#F5F5F5] flex-1 w-full"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setValue(`fileTranslations.${index}.file`, e.target.files[0]);
                              }
                            }}
                          />
                          {field.file && (
                            <p className="text-sm mt-2 text-gray-600">
                              {typeof (field as any).file === 'string'
                                ? (field as any).file.substring((field as any).file.lastIndexOf('/') + 1 || 0)
                                : (field as any).file?.name || 'Selected file'}
                            </p>
                          )}
                          <select
                            {...register(`fileTranslations.${index}.language`)}
                            className="w-full bg-[#f5f5f5] py-4 px-4 rounded-[10px] p-2 mt-4"
                          >
                            <option value="" disabled>
                              Select Language
                            </option>
                            <option value="eng">Eng</option>
                            <option value="kaz">Kaz</option>
                            <option value="rus">Rus</option>
                          </select>
                        </div>
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const languageToRemove = field.language;
                              removeFile(index);
                              setUsedFileLanguages((prev) => {
                                const updated = new Set(prev);
                                updated.delete(languageToRemove);
                                return updated;
                              });
                            }}
                            className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm mt-5"
                          >
                            Remove
                          </button>
                        )}
                        {index === fileFields?.length - 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const unusedLanguage = ["eng", "kaz", "rus"].find(
                                (lang) => !usedFileLanguages.has(lang as Language)
                              );
                              if (unusedLanguage) {
                                appendFile({
                                  id: String(fileFields.length + 1),
                                  language: unusedLanguage as Language,
                                  file: null,
                                });
                                setUsedFileLanguages(
                                  new Set([...usedFileLanguages, unusedLanguage as Language])
                                );
                              }
                            }}
                            disabled={usedFileLanguages.size >= 3}
                            className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] w-full mt-5"
                          >
                            Add New
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="main-form bg-white p-[30px] rounded-[20px]">

              <div className="mb-6">
                {isAudioEbook && (
                  <div className="w-full">
                    <p className="mb-2 text-sm font-medium text-darkBlack">Format</p>
                    <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0">

                      {/* E-book */}
                      <label className="flex flex-row items-center justify-center px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50 transition-all w-full sm:w-auto space-x-2">
                        <input
                          type="radio"
                          {...register("format")}
                          value="e-book"
                          className="form-radio text-orange focus:ring-orange"
                        />
                        <span className="text-sm text-gray-700">E-book</span>
                      </label>

                      {/* Audiobook */}
                      <label className="flex flex-row items-center justify-center px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50 transition-all w-full sm:w-auto space-x-2">
                        <input
                          type="radio"
                          {...register("format")}
                          value="audiobook"
                          className="form-radio text-orange focus:ring-orange"
                        />
                        <span className="text-sm text-gray-700">Audiobook</span>
                      </label>

                      {/* Both */}
                      <label className="flex flex-row items-center justify-center px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50 transition-all w-full sm:w-auto space-x-2">
                        <input
                          type="radio"
                          {...register("format")}
                          value="both"
                          className="form-radio text-orange focus:ring-orange"
                        />
                        <span className="text-sm text-gray-700">Both</span>
                      </label>

                    </div>
                  </div>
                )}
              </div>


              <div className="space-y-5">
                {nameFields.map((field, index) => (
                  <div key={field.id}>
                    <p className="mb-1 text-sm text-darkBlack">Name of Book</p>
                    <div className="flex items-center gap-[5px] w-full">
                      <label className="!flex bg-[#F5F5F5] rounded-[10px] w-full">
                        <select {...register(`translations.${index}.language`)} className="!mt-0 max-w-[80px] !bg-[#D9D9D9]" >
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
                              setUsedLanguages(new Set([...usedLanguages, unusedLanguage as Language]));
                            }
                          }}
                          disabled={usedLanguages.size >= 3}
                          className="bg-[#70A1E5] text-white px-5 py-3 rounded-[10px] text-sm">
                          Add </button>
                      ) : (
                        <button type="button"
                          onClick={() => {
                            const languageToRemove = field.language;
                            removeName(index);
                            setUsedLanguages(prev => {
                              const updated = new Set(prev);
                              updated.delete(languageToRemove);
                              return updated;
                            });
                          }}
                          className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm" >
                          Remove </button>
                      )}
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block mb-2">Price of book</label>
                  <input type="number" {...register("price")} required />
                </div>



                {descriptionFields.map((field, index) => (
                  <div key={field.id}>
                    <p className="mb-1 text-sm text-darkBlack">Description</p>
                    <div className="flex items-start gap-[5px] w-full">
                      <label className="!flex items-start bg-[#F5F5F5] rounded-[10px] w-full">
                        <select {...register(`descriptionTranslations.${index}.language`)}
                          className="!mt-0 max-w-[80px] !bg-[#D9D9D9]" required >
                          <option value="eng">Eng</option>
                          <option value="kaz">Kaz</option>
                          <option value="rus">Rus</option>
                        </select>
                        <textarea
                          {...register(`descriptionTranslations.${index}.content`)}
                          placeholder="Enter description"
                          className="!mt-0 flex-1 min-h-[100px] resize-none"
                        />
                      </label>
                      {index === 0 ? (
                        <button type="button"
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
                              setUsedDescLanguages(new Set([...usedDescLanguages, unusedLanguage as Language]));
                            }
                          }}
                          disabled={usedDescLanguages.size >= 3}
                          className="bg-[#70A1E5] text-white px-5 py-3 rounded-[10px] text-sm">
                          Add </button>
                      ) : (
                        <button className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm"
                          type="button"
                          onClick={() => {
                            const languageToRemove = field.language;
                            removeDescription(index);
                            setUsedDescLanguages(prev => {
                              const updated = new Set(prev);
                              updated.delete(languageToRemove);
                              return updated;
                            });
                          }}> Remove</button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="space-y-5">
                  <CustomSelect
                    name="Select Author"
                    value={authors.filter(option =>
                      watch('authorId')?.includes(option.value))}
                    options={authors}
                    onChange={(value) => handleSelectChange('authorId', value)}
                    placeholder="Select Author"
                    isMulti={true}
                  />

                  {/* <CustomSelect
                    name="Select Publisher"
                    value={publishers.find(option =>
                      watch('publisherId')?.includes(option.value))}
                    options={publishers}
                    onChange={(value) => handleSelectChange('publisherId', value)}
                    placeholder="Select Publisher"
                  /> */}
                  <CustomSelect
                    name="Select Publisher"
                    value={publishers.find(option =>
                      option.value === watch('publisherId')) || null}
                    options={publishers}
                    onChange={(value) => handleSelectChange('publisherId', value)}
                    placeholder="Select Publisher"
                  />

                  <CustomSelect
                    name="Select Genre"
                    value={genresOptions.filter(option =>
                      watch('genre')?.includes(option.value))}
                    isMulti={true}
                    options={genresOptions}
                    onChange={(value) => handleSelectChange('genre', value)}
                    placeholder="Select Genre"
                  />

                  <CustomSelect
                    name="Select Category"
                    value={category.filter(option =>
                      watch('categoryId')?.includes(option.value))}
                    options={category}
                    onChange={(value) => handleSelectChange('categoryId', value)}
                    placeholder="Select Category"
                    isMulti={true}
                  />

                  <CustomSelect
                    name="Select Sub-Category (If Any)"
                    value={subCategory.filter(option =>
                      watch('subCategoryId')?.includes(option.value))}
                    options={subCategory}
                    onChange={(value) => handleSelectChange('subCategoryId', value)}
                    placeholder="Select Sub-Category"
                    isMulti={true}
                    required={false}
                  />
                </div>
                <button type="submit" disabled={isPending}
                  className="w-full bg-orange text-white py-2 px-4 rounded-[28px] hover:bg-opacity-90 disabled:bg-opacity-50">
                  {bookType ? (isNext ? (isPending ? 'Loading...' : 'Next') : (isPending ? 'Updating...' : 'Update')) : (isPending ? 'Adding...' : 'Add Details')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default BookForm;