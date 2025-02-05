import Modal from '@mui/material/Modal';
import Image from 'next/image';
import React, { useState, useTransition, useEffect, useRef } from 'react';  
import preview from "@/assets/images/preview.png";
import { toast } from "sonner";
import { generateSignedUrlForStories } from "@/actions";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateStory } from "@/services/admin-services";
import { PlusIcon2 } from "@/utils/svgicons";
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';

type Language = "eng" | "kaz" | "rus";

interface FileSection {
  imageFile: File | null;
  imagePreview: string | null;
  link: string;
  key?: string;
  isNewImage?: boolean;
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
      language: yup.string().oneOf(["eng", "kaz", "rus"], "Invalid language").required("Language is required"),
      name: yup.string().required("Name is required").trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters"),
    })
  ).min(1, "At least one translation is required"),
  fileSections: yup.array().of(
    yup.object({
      link: yup.string()
        .required("Link is required")
        .url("Please enter a valid URL")
        .matches(/^https?:\/\//, "URL must start with http:// or https://"),
    })
  ).min(1, "At least one file section is required"),
});

interface Props {
  open: boolean;
  onClose: () => void;
  data: any;
}

const EditStoryModal = ({open, onClose, data}: Props) => {
  const [isPending, startTransition] = useTransition();
  const [usedLanguages, setUsedLanguages] = useState<Set<Language>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isInitialized = useRef(false);
  
  const methods = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    mode: 'onChange', 
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
    reset, trigger,
  } = methods;

  const showFormErrors = () => {
    const allErrors: string[] = [];
    
    // Translation errors
    if (errors.translations) {
      errors.translations.forEach((translation: any, index: number) => {
        if (translation?.name) {
          allErrors.push(`Translation ${index + 1}: ${translation.name.message}`);
        }
        if (translation?.language) {
          allErrors.push(`Translation ${index + 1}: ${translation.language.message}`);
        }
      });
    }

    if (errors.fileSections) {
      errors.fileSections.forEach((section: any, index: number) => {
        if (section?.link) {
          allErrors.push(`File Section ${index + 1}: ${section.link.message}`);
        }
      });
    }

    if (allErrors.length > 0) {
      toast.error(
        <div className="space-y-1">
          <p className="font-semibold">Please fix the following errors:</p>
          {allErrors.map((error, index) => (
            <p key={index} className="text-sm">• {error}</p>
          ))}
        </div>
      );
    }
  };

  useEffect(() => {
    if (data && open && !isInitialized.current) {
      try {
        // Initialize translations
        const initialTranslations = Object.entries(data.name).map(([lang, value]) => ({
          language: lang as Language,
          name: value as string,
        }));
        
        // Initialize file sections
        const initialFileSections = Object.entries(data.file).map(([key, value]) => ({
          imageFile: null,
          imagePreview: getImageClientS3URL(key),
          link: value as string,
          key: key,
          isNewImage: false
        }));

        reset({
          translations: initialTranslations,
          fileSections: initialFileSections,
        });

        // Update used languages
        setUsedLanguages(new Set(initialTranslations.map(t => t.language)));
        isInitialized.current = true;
      } catch (error) {
        console.error('Error initializing form:', error);
        toast.error('Error initializing form data');
      }
    }
  }, [data, reset, open]);

  useEffect(() => {
    if (!open) {
      isInitialized.current = false;
      setIsSubmitting(false);
      reset(); // Reset form when modal closes
    }
  }, [open, reset]);

  const translations = watch("translations");
  const fileSections = watch("fileSections");

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Validate file size (e.g., 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image size must be less than 5MB');
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error('Please upload only image files');
          return;
        }

        const previewUrl = URL.createObjectURL(file);
        
        const currentSections = getValues("fileSections");
        const updatedSection = {
          ...currentSections[index],
          imageFile: file,
          imagePreview: previewUrl,
          isNewImage: true
        };

        if (currentSections[index].imagePreview && currentSections[index].isNewImage) {
          URL.revokeObjectURL(currentSections[index].imagePreview);
        }

        currentSections[index] = updatedSection;
        setValue("fileSections", [...currentSections]);
      }
    } catch (error) {
      console.error('Error handling image:', error);
      toast.error('Error uploading image');
    }
  };

  useEffect(() => {
    return () => {
      const sections = getValues("fileSections") || [];
      sections.forEach(section => {
        if (section.imagePreview && section.isNewImage) {
          URL.revokeObjectURL(section.imagePreview);
        }
      });
    };
  }, [getValues]);

  const addTranslation = async () => {
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
      // Trigger validation after adding new translation
      await trigger("translations");
    } else {
      toast.error('All languages are already in use');
    }
  };

  const addFileSection = async () => {
    const currentSections = getValues("fileSections");
    setValue("fileSections", [
      ...currentSections, 
      { 
        imageFile: null, 
        imagePreview: null, 
        link: "",
        isNewImage: false
      }
    ]);
    // Trigger validation after adding new section
    await trigger("fileSections");
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

  // const addFileSection = () => {
  //   const currentSections = getValues("fileSections");
  //   setValue("fileSections", [
  //     ...currentSections, 
  //     { 
  //       imageFile: null, 
  //       imagePreview: null, 
  //       link: "",
  //       isNewImage: false
  //     }
  //   ]);
  // };

  const removeFileSection = (index: number) => {
    const currentSections = getValues("fileSections");
    const newSections = currentSections.filter((_, i) => i !== index);
    setValue("fileSections", newSections);
  };

  const onSubmit = async (formData: FormValues) => {
    startTransition(async () => {
      try {
        const fileObject: Record<string, string> = {};
         
        const bannerName = formData.translations[0].name.trim();
        const sanitizedBannerName = bannerName.replace(/\s+/g, "-").toLowerCase();
 
        // Process each file section
        for (const section of formData.fileSections) {
          if (section.imageFile && section.isNewImage) {
            // Handle new or updated images
            const { signedUrl, key } = await generateSignedUrlForStories(
              section.imageFile.name,
              section.imageFile.type,
              sanitizedBannerName
            );

            // Upload the image
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

            fileObject[key] = section.link;
          } else if (section.key) {
            // Keep existing images
            fileObject[section.key] = section.link;
          }
        }

        const nameObject = formData.translations.reduce((acc, { language, name }) => {
          acc[language] = name.trim();
          return acc;
        }, {} as Record<Language, string>);

        const payload = {
          name: nameObject,
          file: fileObject
        };

        const response = await updateStory(`/admin/stories/${data._id}`, payload);
        
        if (response?.status === 200) {
          toast.success("Story updated successfully");
          onClose();
          window.location.reload(); 
        } else {
          toast.error("Failed to update story");
        }
      } catch (error: any) {
        console.error('Update error:', error);
        toast.error(
          error?.response?.status === 400
            ? error?.response?.data?.message
            : "An error occurred"
        );
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="child-modal-title"
      className="grid place-items-center"
    >
      <div className="modal bg-white py-[30px] px-5 max-w-[950px] mx-auto rounded-[20px] w-full h-full">
        <div className="max-h-[80vh] main-form overflow-auto overflo-custom">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="form-box">
              <div className="">
                {translations?.map((_, index) => (
                  <div key={index} className="mb-3">
                    <p className="mb-1 text-sm text-darkBlack">Update Story</p>
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
                  {fileSections?.map((section, index) => (
                    <div key={index} className="repeat-section mb-8">
                      <div className="custom relative mb-5">
                        <div className="relative">
                          <Image
                            unoptimized
                            src={section.imagePreview || preview}
                            alt="Preview"
                            width={340}
                            height={340}
                            className="rounded-[10px] w-full h-full aspect-square object-cover"
                          />
                        </div>
                        <div className="relative mt-5">
                          <input
                            className="absolute top-0 left-0 h-full w-full opacity-0 p-0 cursor-pointer"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, index)}
                          />
                          <button
                            type="button"
                            className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] w-full"
                          >
                          Edit
                          </button>
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
                          Remove 
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
                      <PlusIcon2/>
                      Add
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-orange text-white text-sm px-4 mt-10 py-[14px] text-center rounded-[28px] w-full"
                >
                  {isPending ? "Updating Story..." : "Update Story"}
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </Modal>
  );
}

export default EditStoryModal;