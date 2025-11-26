"use client";
import Image from "next/image";
import React, { useEffect, useState, useTransition } from "react";
import preview from "@/assets/images/preview.png";
import useSWR from "swr";
import { getSingleUsers, updateSingleUser } from "@/services/admin-services";
import { deleteFileFromS3, generateUserProfilePicture } from "@/actions";
import { toast } from "sonner";
import { DashboardIcon1, DashboardIcon2, DashboardIcon3, DashboardIcon4 } from "@/utils/svgicons";
import DashboardCard from "./DashboardCard";
import UserRecentOrder from "./UserRecentOrder";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getProfileImageUrl } from "@/utils/getImageUrl";

type Language = "eng" | "kaz" | "rus";

interface NameEntry {
  id: string;
  language: Language;
  name: string;
}

interface FormValues {
  translations: NameEntry[];
  fullName: {
    [key in Language]?: string;
  };
  email: string;
  phoneNumber: string;
  countryCode: string;
  password: string;
  profilePic: string | null;
}

const validationSchema = yup.object({
  translations: yup.array().of(
    yup.object({
      language: yup.string().oneOf(["eng", "kaz", "rus"]).required(),
      name: yup.string().required(),
    })
  ),
  fullName: yup.object().required(),
  email: yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: yup.string().required("Phone number is required"),
  countryCode: yup.string().required("Country code is required"),
  password: yup.string().required("Password is required"),
});

interface Props {
  id: any;
}

const UserProfile = ({ id }: Props) => {
  const [user, setUser] = useState<string>("7");
  const { data, isLoading, error, mutate } = useSWR(`/admin/users/${id}?duration=${user}`, getSingleUsers);
  const overviews = data?.data?.data;
  const profileData = data?.data?.data?.data; 
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [usedLanguages, setUsedLanguages] = useState<Set<Language>>(new Set(["eng"]));
  const methods = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      translations: [{ id: "1", language: "eng", name: "" }],
      fullName: { eng: "" },
      email: "",
      phoneNumber: "",
      countryCode: "",
      password: "",
      profilePic: null,
    },
  });

  const {
    control,
    handleSubmit,
    register,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "translations",
  });

  const OverviewData = [
    { id: "1", title: "Total Amount Paid", value: `$${overviews?.amountPaid}`, icon: <DashboardIcon1 /> },
    { id: "2", title: "New Books", value: overviews?.booksPurchasedCount, icon: <DashboardIcon2 /> },
    { id: "3", title: "Courses", value: overviews?.courseCount, icon: <DashboardIcon3 /> }, 
  ];

  useEffect(() => {
    if (profileData) {
      // Convert existing fullName object into translations array, excluding languages with null values
      const existingTranslations = Object.entries(profileData.fullName ?? profileData.firstName)
        .filter(([_, name]) => name !== null)
        .map(([lang, name], index) => ({
          id: String(index + 1),
          language: lang as Language,
          name: name as string
        }));

      // Update used languages set
      setUsedLanguages(new Set(existingTranslations.map(t => t.language)));

      reset({
        translations: existingTranslations.length > 0 ? existingTranslations : [{ id: "1", language: "eng", name: "" }],
        fullName: profileData.fullName || { eng: "" },
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
        countryCode: profileData.countryCode,
        password: profileData.password,
        profilePic: profileData.profilePic,
      });

      if (profileData?.profilePic) {
        const imageUrl = getProfileImageUrl(profileData?.profilePic) ?? '';
        setImagePreview(imageUrl);
      }
    }
  }, [profileData, reset]);

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

  const triggerFileInputClick = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const handleUsersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setUser(selectedValue);
  };

  const handleLanguageAdd = () => {
    const availableLanguages = ["eng", "kaz", "rus"] as Language[];
    const unusedLanguage = availableLanguages.find(
      lang => !usedLanguages.has(lang)
    );

    if (unusedLanguage) {
      // Get the current fullName values
      const currentFullName = getValues("fullName");
      
      append({
        id: String(fields.length + 1),
        language: unusedLanguage,
        name: currentFullName[unusedLanguage] || "" // Use existing value if available
      });
      
      setUsedLanguages(prev => new Set([...prev, unusedLanguage]));
    }
  };

  const handleLanguageRemove = (index: number, language: Language) => {
    const currentFullName = getValues("fullName");
    
    // Don't allow removing if it's the last language
    if (fields.length <= 1) {
      toast.error("At least one language must be present");
      return;
    }

    remove(index);
    setUsedLanguages(prev => {
      const updated = new Set(prev);
      updated.delete(language);
      return updated;
    });

    // Keep the value in fullName object but remove from translations
    setValue("fullName", currentFullName);
  };

  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      try {
        let profilePicKey = data.profilePic;

        if (imageFile) {
          
          const { signedUrl, key } = await generateUserProfilePicture(
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

          if (data.profilePic) {
            await deleteFileFromS3(data.profilePic);
          }
          profilePicKey = key;
        }

        // Include all languages, set missing or empty ones to null
        const allLanguages: Language[] = ["eng", "kaz", "rus"];
        const fullNameObject = allLanguages.reduce((acc, lang) => {
          const translation = data.translations.find(t => t.language === lang);
          acc[lang] = translation?.name?.trim() || null;
          return acc;
        }, {} as Record<Language, string | null>);

        const { translations, ...otherFields } = data;
        const payload = {
          ...otherFields,
          fullName: fullNameObject,
          profilePic: profilePicKey,
        };

        const response = await updateSingleUser(`/admin/users/${id}`, payload);

        if (response?.status === 200) {
          toast.success("User details updated successfully");
          mutate();
        } else {
          toast.error("Failed to update user");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred while updating the user");
      }
    });
  };

  return (
    <div>
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
                  Upload Image
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
        <div className="main-form bg-white p-[30px] rounded-[20px]">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="form-box">
              <div className="space-y-5">
                {fields.map((field, index) => (
                  <div key={field.id}>
                    <p className="mb-1 text-sm text-darkBlack">Name</p>
                    <div className="flex items-center gap-[5px] w-full">
                      <label className="!flex bg-[#F5F5F5] rounded-[10px] w-full">
                        <select
                          {...register(`translations.${index}.language`)}
                          className="!mt-0 max-w-[80px] !bg-[#D9D9D9]"
                          disabled={index === 0 && fields.length === 1}
                        >
                          <option value="eng">Eng</option>
                          <option value="kaz">Kaz</option>
                          <option value="rus">Rus</option>
                        </select>
                        <input
                          type="text"
                          {...register(`translations.${index}.name`)}
                          onChange={(e) => {
                            register(`translations.${index}.name`).onChange(e);
                            setValue(`fullName.${field.language}`, e.target.value);
                          }}
                          placeholder="Enter name"
                          className="!mt-0 flex-1"
                        />
                      </label>
                      {index === 0 ? (
                        <button
                          type="button"
                          onClick={handleLanguageAdd}
                          disabled={usedLanguages.size >= 3}
                          className="bg-[#70A1E5] text-white px-5 py-3 rounded-[10px] text-sm disabled:opacity-50"
                        >
                          Add
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleLanguageRemove(index, field.language)}
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

                <label>
                  Email Address
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="example@mail.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </label>

                <label>
                  Phone Number
                  <div className="grid grid-cols-[74px_1fr] gap-[5px]">
                    <input
                      type="number"
                      {...register("countryCode")}
                      placeholder="+91"
                      className={errors.countryCode ? "border-red-500" : ""}
                    />
                    <input
                      type="tel"
                      {...register("phoneNumber")}
                      placeholder="1234567890"
                      className={errors.phoneNumber ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                  )}
                </label>

                <label>
                  Password
                  <input
                    type="password"
                    {...register("password")}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </label>

                <div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-orange text-white text-sm px-4 mt-5 py-[14px] text-center rounded-[28px] w-full"
                  >
                    {isPending ? "Updating..." : "Update Details"}
                  </button>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>

      <div className="flex justify-between items-center mt-[30px]">
        <h2 className="text-[22px] text-darkBlack">Overview</h2>
        <div>
          <select
            name="user"
            value={user}
            onChange={handleUsersChange}
            className="custom-arrow py-[9px] px-[14px] rounded-[17px]"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-5">
        {OverviewData.map((card) => (
          <DashboardCard
            key={card.id}
            icon={card.icon}
            title={card.title}
            value={card.value}
            backgroundColor="#fff"
          />
        ))}
      </div>

      <UserRecentOrder id={id} />
    </div>
  );
};

export default UserProfile;





// "use client";
// import Image from "next/image";
// import React, { useEffect, useState, useTransition } from "react";
// import preview from "@/assets/images/preview.png";
// import useSWR from "swr";
// import { getSingleUsers, updateSingleUser } from "@/services/admin-services";
// import { deleteFileFromS3, generateUserProfilePicture } from "@/actions";
// import { toast } from "sonner";
// import { DashboardIcon1, DashboardIcon2, DashboardIcon3, DashboardIcon4 } from "@/utils/svgicons";
// import DashboardCard from "./DashboardCard";
// import UserRecentOrder from "./UserRecentOrder";
// import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
// import { useFieldArray, useForm, FormProvider } from "react-hook-form";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { getProfileImageUrl } from "@/utils/getImageUrl";

// type Language = "eng" | "kaz" | "rus";

// interface NameEntry {
//   id: string;
//   language: Language;
//   name: string;
// }

// interface FormValues {
//   translations: NameEntry[];
//   fullName: {
//     [key in Language]?: string;
//   };
//   email: string;
//   phoneNumber: string;
//   countryCode: string;
//   password: string;
//   profilePic: string | null;
// }

// const validationSchema = yup.object({
//   translations: yup.array().of(
//     yup.object({
//       language: yup.string().oneOf(["eng", "kaz", "rus"]).required(),
//       name: yup.string().required(),
//     })
//   ),
//   fullName: yup.object().required(),
//   email: yup.string().email("Invalid email").required("Email is required"),
//   phoneNumber: yup.string().required("Phone number is required"),
//   countryCode: yup.string().required("Country code is required"),
//   password: yup.string().required("Password is required"),
// });

// interface Props {
//   id: any;
// }

// const UserProfile = ({ id }: Props) => {
//   const [user, setUser] = useState<string>("7");
//   const { data, isLoading, error, mutate } = useSWR(`/admin/users/${id}?duration=${user}`, getSingleUsers);
//   const overviews = data?.data?.data;
//   const profileData = data?.data?.data?.data; 
//   const [isPending, startTransition] = useTransition();
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [usedLanguages, setUsedLanguages] = useState<Set<Language>>(new Set(["eng"]));
//   const methods = useForm<FormValues>({
//     resolver: yupResolver(validationSchema) as any,
//     defaultValues: {
//       translations: [{ id: "1", language: "eng", name: "" }],
//       fullName: { eng: "" },
//       email: "",
//       phoneNumber: "",
//       countryCode: "",
//       password: "",
//       profilePic: null,
//     },
//   });

//   const {
//     control,
//     handleSubmit,
//     register,
//     setValue,
//     getValues,
//     reset,
//     formState: { errors },
//   } = methods;

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "translations",
//   });

//   const OverviewData = [
//     { id: "1", title: "Total Amount Paid", value: `$${overviews?.amountPaid}`, icon: <DashboardIcon1 /> },
//     { id: "2", title: "New Books", value: overviews?.booksPurchasedCount, icon: <DashboardIcon2 /> },
//     { id: "3", title: "Courses", value: overviews?.courseCount, icon: <DashboardIcon3 /> }, 
//   ];

//   useEffect(() => {
//     if (profileData) {
//       // Convert existing fullName object into translations array, excluding languages with null values
//       const existingTranslations = Object?.entries(profileData?.fullName?.eng ?? profileData?.fullName?.kaz ?? profileData?.fullName?.rus ?? profileData?.firstName?.eng ?? profileData?.firstName?.kaz ?? profileData?.firstName?.rus)
//         .filter(([_, name]) => name !== null)
//         .map(([lang, name], index) => ({
//           id: String(index + 1),
//           language: lang as Language,
//           name: name as string
//         }));

//       // Update used languages set
//       setUsedLanguages(new Set(existingTranslations.map(t => t.language)));

//       reset({
//         translations: existingTranslations.length > 0 ? existingTranslations : [{ id: "1", language: "eng", name: "" }],
//         fullName: profileData.fullName || { eng: "" },
//         email: profileData.email,
//         phoneNumber: profileData.phoneNumber,
//         countryCode: profileData.countryCode,
//         password: profileData.password,
//         profilePic: profileData.profilePic,
//       });

//       if (profileData?.profilePic) {
//         const imageUrl = getProfileImageUrl(profileData?.profilePic) ?? '';
//         setImagePreview(imageUrl);
//       }
//     }
//   }, [profileData, reset]);

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setImageFile(file);

//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const result = e.target?.result as string;
//         setImagePreview(result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const triggerFileInputClick = () => {
//     const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
//     if (fileInput) fileInput.click();
//   };

//   const handleUsersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedValue = e.target.value;
//     setUser(selectedValue);
//   };

//   const handleLanguageAdd = () => {
//     const availableLanguages = ["eng", "kaz", "rus"] as Language[];
//     const unusedLanguage = availableLanguages.find(
//       lang => !usedLanguages.has(lang)
//     );

//     if (unusedLanguage) {
//       // Get the current fullName values
//       const currentFullName = getValues("fullName");
      
//       append({
//         id: String(fields.length + 1),
//         language: unusedLanguage,
//         name: currentFullName[unusedLanguage] || "" // Use existing value if available
//       });
      
//       setUsedLanguages(prev => new Set([...prev, unusedLanguage]));
//     }
//   };

//   const handleLanguageRemove = (index: number, language: Language) => {
//     const currentFullName = getValues("fullName");
    
//     // Don't allow removing if it's the last language
//     if (fields.length <= 1) {
//       toast.error("At least one language must be present");
//       return;
//     }

//     remove(index);
//     setUsedLanguages(prev => {
//       const updated = new Set(prev);
//       updated.delete(language);
//       return updated;
//     });

//     // Keep the value in fullName object but remove from translations
//     setValue("fullName", currentFullName);
//   };

//   const onSubmit = async (data: FormValues) => {
//     startTransition(async () => {
//       try {
//         let profilePicKey = data.profilePic;

//         if (imageFile) {
//           const { signedUrl, key } = await generateUserProfilePicture(
//             imageFile.name,
//             imageFile.type,
//             data.email
//           );

//           const uploadResponse = await fetch(signedUrl, {
//             method: "PUT",
//             body: imageFile,
//             headers: {
//               "Content-Type": imageFile.type,
//             },
//             cache: "no-store",
//           });

//           if (!uploadResponse.ok) {
//             throw new Error("Failed to upload image");
//           }

//           if (data.profilePic) {
//             await deleteFileFromS3(data.profilePic);
//           }
//           profilePicKey = key;
//         }

//         // Include all languages, set missing or empty ones to null
//         const allLanguages: Language[] = ["eng", "kaz", "rus"];
//         const fullNameObject = allLanguages.reduce((acc, lang) => {
//           const translation = data.translations.find(t => t.language === lang);
//           acc[lang] = translation?.name?.trim() || null;
//           return acc;
//         }, {} as Record<Language, string | null>);

//         const { translations, ...otherFields } = data;
//         const payload = {
//           ...otherFields,
//           fullName: fullNameObject,
//           profilePic: profilePicKey,
//         };

//         const response = await updateSingleUser(`/admin/users/${id}`, payload);

//         if (response?.status === 200) {
//           toast.success("User details updated successfully");
//           mutate();
//         } else {
//           toast.error("Failed to update user");
//         }
//       } catch (error) {
//         console.error("Error:", error);
//         toast.error("An error occurred while updating the user");
//       }
//     });
//   };

//   return (
//     <div>
//       <div className="grid grid-cols-[1fr_2fr] gap-5">
//         <div>
//           <div className="custom relative p-5 bg-white rounded-[20px]">
//             {imagePreview ? (
//               <div className="relative">
//                 <Image
//                   unoptimized
//                   src={imagePreview}
//                   alt="Preview"
//                   width={340}
//                   height={340}
//                   className="rounded-[10px] w-full h-full object-cover"
//                 />
//               </div>
//             ) : (
//               <div className="grid place-items-center">
//                 <Image
//                   unoptimized
//                   src={preview}
//                   alt="upload"
//                   width={340}
//                   height={340}
//                   className="rounded-[10px] w-full"
//                 />
//               </div>
//             )}
//             <div className="relative mt-4">
//               <input
//                 className="absolute top-0 left-0 h-full w-full opacity-0 p-0 cursor-pointer"
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageChange}
//               />
//               {imagePreview ? (
//                 <button
//                   type="button"
//                   onClick={triggerFileInputClick}
//                   className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] w-full"
//                 >
//                   Upload Image
//                 </button>
//               ) : (
//                 <p
//                   className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] cursor-pointer"
//                   onClick={triggerFileInputClick}
//                 >
//                   Upload Image
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//         <div className="main-form bg-white p-[30px] rounded-[20px]">
//           <FormProvider {...methods}>
//             <form onSubmit={handleSubmit(onSubmit)} className="form-box">
//               <div className="space-y-5">
//                 {fields.map((field, index) => (
//                   <div key={field.id}>
//                     <p className="mb-1 text-sm text-darkBlack">Name</p>
//                     <div className="flex items-center gap-[5px] w-full">
//                       <label className="!flex bg-[#F5F5F5] rounded-[10px] w-full">
//                         <select
//                           {...register(`translations.${index}.language`)}
//                           className="!mt-0 max-w-[80px] !bg-[#D9D9D9]"
//                           disabled={index === 0 && fields.length === 1}
//                         >
//                           <option value="eng">Eng</option>
//                           <option value="kaz">Kaz</option>
//                           <option value="rus">Rus</option>
//                         </select>
//                         <input
//                           type="text"
//                           {...register(`translations.${index}.name`)}
//                           onChange={(e) => {
//                             register(`translations.${index}.name`).onChange(e);
//                             setValue(`fullName.${field.language}`, e.target.value);
//                           }}
//                           placeholder="Enter name"
//                           className="!mt-0 flex-1"
//                         />
//                       </label>
//                       {index === 0 ? (
//                         <button
//                           type="button"
//                           onClick={handleLanguageAdd}
//                           disabled={usedLanguages.size >= 3}
//                           className="bg-[#70A1E5] text-white px-5 py-3 rounded-[10px] text-sm disabled:opacity-50"
//                         >
//                           Add
//                         </button>
//                       ) : (
//                         <button
//                           type="button"
//                           onClick={() => handleLanguageRemove(index, field.language)}
//                           className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm"
//                         >
//                           Remove
//                         </button>
//                       )}
//                     </div>
//                     {errors.translations?.[index]?.name && (
//                       <p className="text-red-500 text-sm mt-1">
//                         {errors.translations[index]?.name?.message}
//                       </p>
//                     )}
//                   </div>
//                 ))}

//                 <label>
//                   Email Address
//                   <input
//                     type="email"
//                     {...register("email")}
//                     placeholder="example@mail.com"
//                   />
//                   {errors.email && (
//                     <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
//                   )}
//                 </label>

//                 <label>
//                   Phone Number
//                   <div className="grid grid-cols-[74px_1fr] gap-[5px]">
//                     <input
//                       type="number"
//                       {...register("countryCode")}
//                       placeholder="+91"
//                       className={errors.countryCode ? "border-red-500" : ""}
//                     />
//                     <input
//                       type="tel"
//                       {...register("phoneNumber")}
//                       placeholder="1234567890"
//                       className={errors.phoneNumber ? "border-red-500" : ""}
//                     />
//                   </div>
//                   {errors.phoneNumber && (
//                     <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
//                   )}
//                 </label>

//                 <label>
//                   Password
//                   <input
//                     type="password"
//                     {...register("password")}
//                     className={errors.password ? "border-red-500" : ""}
//                   />
//                   {errors.password && (
//                     <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
//                   )}
//                 </label>

//                 <div>
//                   <button
//                     type="submit"
//                     disabled={isPending}
//                     className="bg-orange text-white text-sm px-4 mt-5 py-[14px] text-center rounded-[28px] w-full"
//                   >
//                     {isPending ? "Updating..." : "Update Details"}
//                   </button>
//                 </div>
//               </div>
//             </form>
//           </FormProvider>
//         </div>
//       </div>

//       <div className="flex justify-between items-center mt-[30px]">
//         <h2 className="text-[22px] text-darkBlack">Overview</h2>
//         <div>
//           <select
//             name="user"
//             value={user}
//             onChange={handleUsersChange}
//             className="custom-arrow py-[9px] px-[14px] rounded-[17px]"
//           >
//             <option value="7">Last 7 days</option>
//             <option value="30">Last 30 days</option>
//           </select>
//         </div>
//       </div>

//       <div className="grid grid-cols-4 gap-4 mt-5">
//         {OverviewData.map((card) => (
//           <DashboardCard
//             key={card.id}
//             icon={card.icon}
//             title={card.title}
//             value={card.value}
//             backgroundColor="#fff"
//           />
//         ))}
//       </div>

//       <UserRecentOrder id={id} />
//     </div>
//   );
// };

// export default UserProfile;