"use client";
import React, { useState, useTransition } from "react";
import Image from "next/image";
import preview from "@/assets/images/preview.png";
import { toast } from "sonner";
import { generateSignedUrlForBanners } from "@/actions";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addNewBaner } from "@/services/admin-services";

type Language = "eng" | "kaz" | "rus";

interface FormValues {
  translations: {
    language: Language;
    name: string;
  }[];
  link: string;
}

const validationSchema = yup.object({
  translations: yup.array().of(
    yup.object({
      language: yup.string().oneOf(["eng", "kaz", "rus"]).required(),
      name: yup.string().required("Name is required"),
    })
  ),
  link: yup.string().url("Invalid link").required("Link is required"),
});

const Page = () => {
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [usedLanguages, setUsedLanguages] = useState<Set<Language>>(new Set(["eng"]));

  const methods = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      translations: [{ language: "eng", name: "" }],
      link: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    getValues,
    watch,
  } = methods;

  const translations = watch("translations");
  const link = watch("link");

  // Check if all required fields are filled (image is not required)
  const isFormComplete = isValid && translations.every(t => t.name.trim() !== "") && link.trim() !== "";

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

  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      try {
        let imageKey = null;
        const timestamp = Date.now();
        if (imageFile) {
          const { signedUrl, key } = await generateSignedUrlForBanners(
            `${timestamp}-${imageFile.name}`,
            imageFile.type
          );

          const uploadResponse = await fetch(signedUrl, {
            method: "PUT",
            body: imageFile,
            headers: {
              "Content-Type": imageFile.type,
            },
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload image to S3");
          }

          imageKey = key;
        }

        // Include all languages, set missing or empty ones to null
        const allLanguages: Language[] = ["eng", "kaz", "rus"];
        const nameObject = allLanguages.reduce((acc, lang) => {
          const translation = data.translations.find(t => t.language === lang);
          acc[lang] = translation?.name?.trim() || null;
          return acc;
        }, {} as Record<Language, string | null>);

        const payload = {
          name: nameObject,
          image: imageKey,
          link: data.link,
        };

        const response = await addNewBaner("/admin/banners", payload);

        if (response?.status === 201) {
          toast.success("Banner added successfully");
          window.location.href = "/admin/promotions";
        } else {
          toast.error("Failed to add banner");
        }
      } catch (error: any) {
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
                  <p className="mb-1 text-sm text-darkBlack">Name/Title of the banner</p>
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
              <div className="mt-10 max-w-[536px]">
                <div className="custom relative mb-5">
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
                  <div className="relative mt-5">
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
                <label>
                  Link
                  <input
                    type="text"
                    {...register("link")}
                    placeholder="https://example.com"
                    className="w-full"
                  />
                  {errors.link && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.link.message}
                    </p>
                  )}
                </label>

                <div>
                  <button
                    type="submit"
                    disabled={isPending || !isFormComplete}
                    className={`bg-orange text-white text-sm px-4 mt-10 py-[14px] text-center rounded-[28px] w-full flex items-center justify-center gap-2 ${
                      isPending || !isFormComplete ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isPending ? (                     
                        "Adding..."
                    ) : (
                      "Add New Banner"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default Page;