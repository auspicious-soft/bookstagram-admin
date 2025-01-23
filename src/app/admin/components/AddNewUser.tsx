import Modal from '@mui/material/Modal';
import React, { FormEvent, useState, useTransition } from 'react';
import Image from "next/image";
import preview from "@/assets/images/preview.png"; 
import { toast } from 'sonner';
import { generateUserProfilePicture } from '@/actions';
import { addNewUser } from '@/services/admin-services';

interface ModalProp {
    open: any;
    onClose: any;
    mutate: any;
}

const AddNewUser: React.FC<ModalProp> = ({ open, onClose, mutate }) => {
    const [isPending, startTransition] = useTransition();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formData, setFormData] = useState<any>({
        fullName: "",
        email: "",
        phoneNumber: "",
        countryCode: "",
        profilePic: null,
        password: "",
        confirmPassword: "",
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

  const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        startTransition(async () => {
            try {
                let profilePicKey = null;

                if (imageFile) {
                 const { signedUrl, key } = await generateUserProfilePicture(imageFile.name, imageFile.type, formData.email);

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

                    profilePicKey = key;
                }

                const { confirmPassword, ...otherFields } = formData;
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
                    toast.error( "Failed to add user");
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
           
                <Image unoptimized
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
          >Edit </button>
        ) : (
          <p className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] cursor-pointer"
            onClick={triggerFileInputClick}> Upload Image </p>
        )}
        </div>
        </div>
      </div>
      <div className="main-form bg-white p-[30px] rounded-[30px] ">
      <form onSubmit={handleSubmit} className="form-box">
        <div className="space-y-5 ">
         <label>Name of User
            <input
              type="text"
              name="fullName"
              placeholder="First Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            </label>
            <label>Email Address
             <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="kjbdsfijdasfn@mail.com" required /> 
            </label>
            <label>Phone Number
              <div className="grid grid-cols-[74px_1fr] gap-[5px]">
                <input type="text" name="countryCode" value={formData.countryCode} onChange={handleChange} placeholder="+91" />
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="1234567890"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                /> 
              </div>
            </label>
           <div className="flex gap-[5px] ">
           <label>Password
              <input type="text" name="password" value={formData.password} onChange={handleChange} placeholder='****' required/>
            </label>
            <label>Confirm Password
              <input type="text" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder='****' required />
            </label>
           </div>
            <div>
            <button
            type="submit" disabled={isPending}
            className="bg-orange text-white text-sm px-4 mt-5 py-[14px] text-center rounded-[28px] w-full"
          >Add Details</button>
            </div>
          </div>
    </form>
      </div>
    </div>
        </div>
        </div>
        </Modal>
    );
}

export default AddNewUser;
