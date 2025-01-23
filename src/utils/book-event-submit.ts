"use client";
import { generateSignedUrlToUploadOn } from "@/actions";
import { addBookEventFormData } from "@/services/admin-services";
import { toast } from "sonner";

export const submitForm = async (
  formData: any,
  router: any
) => {    
      if (formData.image) {
        try {
          const timestamp = Date.now();

          const { signedUrl, key } = await generateSignedUrlToUploadOn(
           `${timestamp}-${formData.image.name}`,
            formData.image.type,
          );
          
          const uploadResponse = await fetch(signedUrl, {
            method: "PUT",
            body: formData.image,
            headers: {
              "Content-Type": formData.image.type,
              
            },
            cache: "no-store",
            // mode: "no-cors"
          });

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload ${formData.image}`);
          }

          // Replace the file object with the S3 key
          formData.image = key;
          const response = await addBookEventFormData("/admin/events", formData);
      
          if (response?.status === 201 || response?.status === 200) {
            toast.success("Book Event data added successfully");
            router.push('/admin/book-events');
          
          } 
          else {
            toast.error("Failed to add Book Event Data");
          }
          } 
        catch (error) {
    console.error("Error adding Book Event Data:", error);
    toast.error("An error occurred while adding the Book Event Data");
  }}
};

