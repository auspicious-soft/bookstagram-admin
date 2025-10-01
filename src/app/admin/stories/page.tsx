// "use client";
// import Button from "@/app/components/Button";
// import DeleteConfirmationModal from "@/app/admin/components/DeleteConfirmationModal";
// import { deleteSingleStory, getAllStories } from "@/services/admin-services";
// import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
// import { DeleteIcon } from "@/utils/svgicons";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import React, { useState, useTransition } from "react";
// import { toast } from "sonner";
// import useSWR from "swr";
// import { getProfileImageUrl } from "@/utils/getImageUrl";

// const Page = () => {
//   const router = useRouter();
//   const { data, mutate } = useSWR(`/admin/stories`, getAllStories);
//   const stories = data?.data?.data;
//   const [, startTransition] = useTransition();
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const addStory = () => {
//     router.push('/admin/stories/add-new-story');
//   };

//   const openSingleStory = (id: string) => {
//     router.push(`/admin/stories/single-story/${id}`);
//   };

//   const openDeleteModal = (id: string) => {
//     setStoryToDelete(id);
//     setIsDeleteModalOpen(true);
//   };

//   const closeDeleteModal = () => {
//     setIsDeleteModalOpen(false);
//     setStoryToDelete(null);
//   };

//   const handleDelete = async () => {
//     if (!storyToDelete) return;

//     setIsDeleting(true);
//     try {
//       startTransition(async () => {
//         const response = await deleteSingleStory(`/admin/stories/${storyToDelete}`);
//         if (response.status === 200) {
//           toast.success("Deleted successfully");
//           mutate();
//         } else {
//           toast.error("Failed To Delete Story");
//         }
//         setIsDeleting(false);
//         closeDeleteModal();
//       });
//     } catch (error) {
//       toast.error("An Error Occurred While Deleting The Story");
//       setIsDeleting(false);
//       closeDeleteModal();
//     }
//   };

//   return (
//     <div>
//       <div className="flex justify-end mb-5">
//         <Button text="Add A New Story" onClick={addStory} />
//       </div>
//       {stories?.length === 0 && <p className="text-center text-gray-500">No data found.</p> }
//       <div className="grid grid-cols-4 gap-6">
//         {stories?.map((story: any) => (
//           <div key={story?._id} className="relative">
//             {story?.file && Object.entries(story?.file).slice(0, 1).map(([key]: [string, string], index) => (
//               <div key={index} onClick={() => openSingleStory(story?._id)} className="cursor-pointer">
//                 <Image
//                   unoptimized
//                   src={getProfileImageUrl(key)}
//                   width={264}
//                   height={260}
//                   alt="story"
//                   className="rounded-[10px] aspect-square object-cover w-full"
//                 />
//               </div>
//             ))}
//             <h2 className="font-aeonikBold text-lg capitalize text-darkBlack mt-[11px]">{story?.name.eng || story?.name.kaz || story?.name.rus}</h2>
//             <div className="absolute top-[5px] right-[6px] z-10">
//               <button
//                 onClick={() => openDeleteModal(story?._id)}
//                 className="bg-white border border-orange rounded-[34px] flex items-center gap-[5px] py-2 px-4 text-orange"
//               >
//                 <DeleteIcon stroke="var(--tw-bg-orange)" />Remove
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Delete Confirmation Modal */}
//       <DeleteConfirmationModal
//         isOpen={isDeleteModalOpen}
//         onClose={closeDeleteModal}
//         onConfirm={handleDelete}
//         isDeleting={isDeleting}
//         title="Delete Story?"
//         message="Are you sure you really want to delete this story?"
//       />
//     </div>
//   );
// };

// export default Page;





"use client";
import Button from "@/app/components/Button";
import DeleteConfirmationModal from "@/app/admin/components/DeleteConfirmationModal";
import { deleteSingleStory, getAllStories } from "@/services/admin-services";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { DeleteIcon } from "@/utils/svgicons";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";

const Page = () => {
  const router = useRouter();
  const { data, mutate } = useSWR(`/admin/stories`, getAllStories);
  const stories = data?.data?.data;
  const [, startTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const addStory = () => {
    router.push("/admin/stories/add-new-story");
  };

  const openSingleStory = (id: string) => {
    router.push(`/admin/stories/single-story/${id}`);
  };

  const openDeleteModal = (id: string) => {
    setStoryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setStoryToDelete(null);
  };

  const handleDelete = async () => {
    if (!storyToDelete) return;

    setIsDeleting(true);
    try {
      startTransition(async () => {
        const response = await deleteSingleStory(`/admin/stories/${storyToDelete}`);
        if (response.status === 200) {
          toast.success("Deleted successfully");
          mutate();
        } else {
          toast.error("Failed To Delete Story");
        }
        setIsDeleting(false);
        closeDeleteModal();
      });
    } catch (error) {
      toast.error("An Error Occurred While Deleting The Story");
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-5">
        <Button text="Add A New Story" onClick={addStory} />
      </div>

      {stories?.length === 0 && (
        <p className="text-center text-gray-500">No data found.</p>
      )}

      <div className="grid grid-cols-4 gap-6">
        {stories?.map((story: any) => {
          const files = story?.file ? Object.entries(story.file) : [];

          // Step 1: Find the first image file
          const imageEntry = files.find(([_, fileData]: [string, any]) => fileData?.type === "image");
          // Step 2: If no image, fall back to the first video
          const videoEntry = !imageEntry
            ? files.find(([_, fileData]: [string, any]) => fileData?.type === "video")
            : null;

          let previewUrl: string | null = null;
          let previewType: "image" | "video" | null = null;

          if (imageEntry) {
            const [key] = imageEntry;
            previewUrl = getImageClientS3URL(key);
            previewType = "image";
          } else if (videoEntry) {
            const [key] = videoEntry;
            previewUrl = getImageClientS3URL(key);
            previewType = "video";
          }

          return (
            <div key={story?._id} className="relative">
              {previewUrl && (
                <div
                  onClick={() => openSingleStory(story?._id)}
                  className="cursor-pointer"
                >
                  {previewType === "image" ? (
                    <Image
                      unoptimized
                      src={previewUrl}
                      width={264}
                      height={260}
                      alt="story"
                      className="rounded-[10px] aspect-square object-cover w-full"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      width={264}
                      height={260}
                      className="rounded-[10px] aspect-square object-cover w-full"
                      controls={false}
                      muted
                    />
                  )}
                </div>
              )}

              <h2 className="font-aeonikBold text-lg capitalize text-darkBlack mt-[11px]">
                {story?.name?.eng || story?.name?.kaz || story?.name?.rus}
              </h2>

              <div className="absolute top-[5px] right-[6px] z-10">
                <button
                  onClick={() => openDeleteModal(story?._id)}
                  className="bg-white border border-orange rounded-[34px] flex items-center gap-[5px] py-2 px-4 text-orange"
                >
                  <DeleteIcon stroke="var(--tw-bg-orange)" />
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete Story?"
        message="Are you sure you really want to delete this story?"
      />
    </div>
  );
};

export default Page;
