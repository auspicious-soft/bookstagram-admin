'use client';
import Modal from '@mui/material/Modal';
import React, { useState, useTransition } from 'react';
import Image from "next/image";
import preview from "@/assets/images/preview.png";
import { toast } from 'sonner';
import { generateUserProfilePicture } from '@/actions';
import { useFieldArray, useForm, FormProvider } from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import LanguageSelector from '@/app/components/LanguageSelector';
import { addNewUser } from '@/services/admin-services';

interface ModalProp {
  open: any;
  onClose: any;
  mutate: any;
}

type Language = 'eng' | 'kaz' | 'rus';

interface NameEntry {
  id: string;
  language: Language;
  name: string;
}

interface FormValues {
  nameEntries: NameEntry[];
  fullName: {
    [key in Language]?: string;
  };
  email: string;
  phoneNumber: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
}

const validationSchema = yup.object({
  nameEntries: yup.array().of(
    yup.object({
      language: yup.string().oneOf(['eng', 'kaz', 'rus']).required(),
      name: yup.string().required()
    })
  ),
  fullName: yup.object().required(),
  email: yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: yup.string().required("Phone number is required"),
  countryCode: yup.string().required("Country code is required"),
  password: yup.string().required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const AddNewUser: React.FC<ModalProp> = ({ open, onClose, mutate }) => {
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [usedLanguages, setUsedLanguages] = useState<Set<Language>>(new Set(['eng']));

  const methods = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      nameEntries: [
        { id: '1', language: 'eng', name: '' }
      ],
      fullName: { eng: '' },
      email: '',
      phoneNumber: '',
      countryCode: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { control, handleSubmit, register, setValue, getValues } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "nameEntries",
  });

  const handleLanguageChange = (index: number) => (event: React.FormEvent<HTMLSelectElement>) => {
    const newLanguage = event.currentTarget.value as Language;
    const oldLanguage = fields[index].language;
    
    setUsedLanguages(prev => {
      const updated = new Set(prev);
      updated.delete(oldLanguage);
      updated.add(newLanguage);
      return updated;
    });

    const currentFullName = getValues('fullName');
    const nameValue = currentFullName[oldLanguage] || '';
    const newFullName = { ...currentFullName };
    delete newFullName[oldLanguage];
    newFullName[newLanguage] = nameValue;
    
    setValue('fullName', newFullName);
    setValue(`nameEntries.${index}`, {
      ...fields[index],
      language: newLanguage
    });
  };

  // Image handling functions
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
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    startTransition(async () => {
      try {
        let profilePicKey = null;

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
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload image to S3");
          }

          profilePicKey = key;
        }

        const { confirmPassword, nameEntries, ...otherFields } = data;
        const payload = {
          ...otherFields,
          profilePic: profilePicKey,
        };
        
        console.log('payload:', payload);
        const response = await addNewUser("/admin/users", payload);

        if (response?.status === 201) {
          toast.success("User added successfully");
          onClose();
          mutate();
        } else {
          toast.error("Failed to add user");
        }
      } catch (error) {
        console.error("Error", error);
        toast.error("An error occurred while adding the user");
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
      <div className="modal bg-[#EBDFD7] p-[30px] max-w-[1000px] mx-auto rounded-[20px] w-full h-auto">
        <div className="max-h-[80vh] overflow-auto overflo-custom">
          <h2 className="text-[32px] text-darkBlack mb-5">Add New User</h2>

          <div className="grid grid-cols-[1fr_2fr] gap-5">
            {/* Left side - Image upload section */}
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
            </div>

            {/* Right side - Form section */}
            <div className="main-form bg-white p-[30px] rounded-[20px]">
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="form-box">
                  <div className="space-y-5">
                    {/* Name entries */}
                    {fields.map((field, index) => (
                      <div key={field.id} className="">
                        <p className='mb-1 text-sm text-darkBlack'>Name</p>
                        <div className='flex items-center gap-[5px] w-full'>
                          <label className='!flex bg-[#F5F5F5] rounded-[10px] w-full'>
                            <LanguageSelector
                              value={field.language}
                              onChange={handleLanguageChange(index)}
                            />
                            <input
                              type="text"
                              {...register(`nameEntries.${index}.name` as const)}
                              onChange={(e) => {
                                register(`nameEntries.${index}.name` as const).onChange(e);
                                setValue(`fullName.${field.language}`, e.target.value);
                              }}
                              placeholder="Enter name"
                              className="!mt-0 flex-1"
                              required
                            />
                          </label>
                          {index === 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                const unusedLanguage = ['eng', 'kaz', 'rus'].find(
                                  lang => !usedLanguages.has(lang as Language)
                                );
                                if (unusedLanguage) {
                                  append({ 
                                    id: String(fields.length + 1),
                                    language: unusedLanguage as Language, 
                                    name: '' 
                                  });
                                  setUsedLanguages(prev => new Set([...prev, unusedLanguage as Language]));
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
                                setUsedLanguages(prev => {
                                  const updated = new Set(prev);
                                  updated.delete(languageToRemove);
                                  return updated;
                                });
                                const currentFullName = getValues('fullName');
                                delete currentFullName[languageToRemove];
                                setValue('fullName', currentFullName);
                              }}
                              className="bg-[#FF0004] text-white px-5 py-3 rounded-[10px] text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Rest of the form fields */}
                    <label>
                      Email Address
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="example@mail.com"
                        required
                      />
                    </label>
                    <label>
                      Phone Number
                      <div className="grid grid-cols-[74px_1fr] gap-[5px]">
                        <input
                          type="number"
                          {...register("countryCode")}
                          placeholder="+91"
                          required
                        />
                        <input
                          type="number"
                          {...register("phoneNumber")}
                          placeholder="1234567890"
                          required
                        />
                      </div>
                    </label>
                    <div className="flex gap-[5px]">
                      <label>
                        Password
                        <input
                          type="password"
                          {...register("password")}
                          placeholder="****"
                          required
                        />
                      </label>
                      <label>
                        Confirm Password
                        <input
                          type="password"
                          {...register("confirmPassword")}
                          placeholder="****"
                          required
                        />
                      </label>
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="bg-orange text-white text-sm px-4 mt-5 py-[14px] text-center rounded-[28px] w-full"
                      >
                        Add Details
                      </button>
                    </div>
                  </div>
                </form>
              </FormProvider>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddNewUser;