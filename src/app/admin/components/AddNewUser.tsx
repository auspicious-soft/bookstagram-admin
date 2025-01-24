'use client';
import Modal from '@mui/material/Modal';
import React, { useState, useTransition } from 'react';
import Image from "next/image";
import preview from "@/assets/images/preview.png"; 
import { toast } from 'sonner';
import { generateUserProfilePicture } from '@/actions';
import { addNewUser } from '@/services/admin-services';
import { useFieldArray, useForm, FormProvider } from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';

interface ModalProp {
  open: any;
  onClose: any;
  mutate: any;
}

// Validation schema
const validationSchema = yup.object({
  users: yup.array().of(
    yup.object({
      name: yup.string().required("Name is required"),
      language: yup.string().required("Language is required"),
    })
  ).min(1, "At least one user must be added"),
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

  // Form setup
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      users: [{ name: "", language: "" }],
      email: "",
      phoneNumber: "",
      countryCode: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { control, handleSubmit, watch, setValue } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "users", // Access the "users" array
  });

  const triggerFileInputClick = () => {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
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

  const onSubmit = async (data: any) => {
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

        const { confirmPassword, ...otherFields } = data;
        const payload = {
          ...otherFields,
          profilePic: profilePicKey,
        };

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
      className="grid place-items-center "
    >
      <div className="modal bg-[#EBDFD7] p-[30px] max-w-[1000px] mx-auto rounded-[20px] w-full h-auto ">
        <div className="max-h-[80vh] overflow-auto overflo-custom">
          <h2 className="text-[32px] text-darkBlack mb-5  ">Add New User</h2>

          <div className="grid grid-cols-[1fr_2fr] gap-5  ">
            <div>
              <div className="custom relative p-5 bg-white rounded-[20px] h-full">
                {imagePreview ? (
                  <div className="relative ">
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
                <div className="relative mt-5 ">
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
                      Edit{" "}
                    </button>
                  ) : (
                    <p
                      className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] cursor-pointer"
                      onClick={triggerFileInputClick}
                    >
                      Upload Image{" "}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="main-form bg-white p-[30px] rounded-[30px] ">
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="form-box">
                  <div className="space-y-5 ">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-5">
                        <label>
                          Name
                          <input
                            type="text"
                            {...methods.register(`users.${index}.name`)}
                            placeholder="Enter name"
                            required
                          />
                        </label>
                        <label>
                          Language
                          <input
                            type="text"
                            {...methods.register(`users.${index}.language`)}
                            placeholder="Enter language"
                            required
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => append({ name: "", language: "" })}
                      className="bg-orange text-white px-4 py-[10px] rounded-[28px]"
                    >
                      Add New User
                    </button>

                    <label>
                      Email Address
                      <input
                        type="email"
                        {...methods.register("email")}
                        placeholder="example@mail.com"
                        required
                      />
                    </label>
                    <label>
                      Phone Number
                      <div className="grid grid-cols-[74px_1fr] gap-[5px]">
                        <input
                          type="text"
                          {...methods.register("countryCode")}
                          placeholder="+91"
                          required
                        />
                        <input
                          type="text"
                          {...methods.register("phoneNumber")}
                          placeholder="1234567890"
                          required
                        />
                      </div>
                    </label>
                    <div className="flex gap-[5px] ">
                      <label>
                        Password
                        <input
                          type="password"
                          {...methods.register("password")}
                          placeholder="****"
                          required
                        />
                      </label>
                      <label>
                        Confirm Password
                        <input
                          type="password"
                          {...methods.register("confirmPassword")}
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
