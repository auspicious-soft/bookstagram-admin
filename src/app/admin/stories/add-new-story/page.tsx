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

type Language = "eng" | "kaz" | "rus";

interface RepeatSection {
  imageFile: File | null;
  imagePreview: string | null;
  link: string;
}

interface FormValues {
  translations: {
    language: Language;
    name: string;
  }[];
  repeatSections: RepeatSection[];
}

const validationSchema = yup.object({
  translations: yup.array().of(
    yup.object({
      language: yup.string().oneOf(["eng", "kaz", "rus"]).required(),
      name: yup.string().required("Name is required"),
    })
  ),
  repeatSections: yup.array().of(
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
      repeatSections: [{ imageFile: null, imagePreview: null, link: "" }],
    },
  });

  const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = methods;
  const translations = watch("translations");
  const repeatSections = watch("repeatSections");

  const addTranslation = () => {
    const currentTranslations = getValues("translations");
    const availableLanguages: Language[] = ["eng", "kaz", "rus"];
    const unusedLanguage = availableLanguages.find((lang) => !usedLanguages.has(lang)) as Language;

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

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const currentSections = getValues("repeatSections");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = (event) => {
        currentSections[index] = {
          ...currentSections[index],
          imageFile: file,
          imagePreview: event.target?.result as string,
        };
        setValue("repeatSections", [...currentSections]);
      };
      reader.readAsDataURL(file);
    }
  };

  const repeatBox = () => {
    const currentSections = getValues("repeatSections");
    setValue("repeatSections", [...currentSections, { imageFile: null, imagePreview: null, link: "" }]);
  };

  const removeBox = (index: number) => {
    const currentSections = getValues("repeatSections");
    currentSections.splice(index, 1);
    setValue("repeatSections", [...currentSections]);
  };

  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      try {
        const repeatData = await data.repeatSections.reduce(async (accPromise, section, index) => {
          const acc = await accPromise;
          let imageKey = null;
  
          if (section.imageFile) {
            // Use the name from translations or fall back to a default
            const storyName = data.translations[0]?.name.trim() || `story-${index}`;
            const sanitizedStoryName = storyName.replace(/\s+/g, "-").toLowerCase(); // Replace spaces with dashes and lowercase
            const fileName = section.imageFile.name;
  
            // Generate signed URL for S3
            const { signedUrl, key } = await generateSignedUrlForStories(
              `stories/${sanitizedStoryName}`, // Folder based on sanitized story name
              fileName,
              section.imageFile.type
            );
  
            const uploadResponse = await fetch(signedUrl, {
              method: "PUT",
              body: section.imageFile,
              headers: {
                "Content-Type": section.imageFile.type,
              },
            });
  
            if (!uploadResponse.ok) {
              throw new Error("Failed to upload image to S3");
            }
  
            imageKey = `stories/${sanitizedStoryName}/${fileName}`; // Build the full path
          }
  
          if (imageKey) {
            acc[imageKey] = section.link; // Add key-value pair to object
          }
          return acc;
        }, Promise.resolve({} as Record<string, string>)); // Initialize as an empty object
  
        // Transform translations array into name object
        const nameObject = data.translations.reduce((acc, { language, name }) => {
          acc[language] = name.trim(); // Ensure trimmed values
          return acc;
        }, {} as Record<Language, string>);
  
        const payload = {
          name: nameObject,
          file: repeatData, // Object with proper paths and links
        };
  
        console.log("payload:", payload);
        const response = await addNewStory("/admin/stories", payload);
  
        if (response?.status === 201) {
          toast.success("Banner added successfully");
          window.location.href = "/admin/stories";
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
      <div className="main-form">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {translations.map((_, index) => (
            <div key={index} className="mb-3">
              <p className="mb-1 text-sm text-darkBlack">Name/Title of the story</p>
              <div className="flex items-center">
                <select {...register(`translations.${index}.language`)} className="!mt-0 max-w-[80px] !bg-[#D9D9D9]">
                  <option value="eng">Eng</option>
                  <option value="kaz">Kaz</option>
                  <option value="rus">Rus</option>
                </select>
                <input type="text" {...register(`translations.${index}.name`)} placeholder="Enter name" />
                {index === 0 ? (
                  <button type="button" onClick={addTranslation}>Add</button>
                ) : (
                  <button type="button" onClick={() => removeTranslation(index)}>Remove</button>
                )}
              </div>
            </div>
          ))}
          {repeatSections.map((section, index) => (
            <div key={index} className="repeat-section">
              <div>
                {section.imagePreview ? (
                  <Image src={section.imagePreview} alt="Preview" width={200} height={200} />
                ) : (
                  <p>No Image</p>
                )}
                <input type="file" accept="image/*" onChange={(e) => handleImageChange(index, e)} />
              </div>
              <input type="text" {...register(`repeatSections.${index}.link`)} placeholder="Link" />
              <button type="button" onClick={() => removeBox(index)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={repeatBox}>Add Section</button>
          <button type="submit"  className="bg-orange text-white text-sm px-4 mt-10 py-[14px] text-center rounded-[28px] w-full" 
          disabled={isPending}>Add New Story</button>
        </form>
      </FormProvider>
      </div>
    </div>
  );
};

export default Page;
