"use client";
import Button from "@/app/components/Button";
import { deleteSingleStory, getAllStories } from "@/services/admin-services";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import { DeleteIcon } from "@/utils/svgicons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";

const Page = () => {
  const router = useRouter();
  const { data, mutate } = useSWR(`/admin/stories`, getAllStories);
  const stories = data?.data?.data;
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);

  const addStory = () => {
    router.push('/admin/stories/add-new-story');
  };

  const openSingleStory = (id: string) => {
    router.push(`/admin/stories/single-story/${id}`);
  };

  const openDeleteModal = (id: string) => {
    setStoryToDelete(id);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setStoryToDelete(null);
  };

  const handleDelete = async () => {
    if (!storyToDelete) return;
    try {
      startTransition(async () => {
        const response = await deleteSingleStory(`/admin/stories/${storyToDelete}`);
        if (response.status === 200) {
          toast.success("Deleted successfully");
          mutate();
          closeDeleteModal();
        } else {
          toast.error("Failed To Delete Story");
        }
      });
    } catch (error) {
      toast.error("An Error Occurred While Deleting The Story");
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-5">
        <Button text="Add A New Story" onClick={addStory} />
      </div>
      {stories?.length === 0 && <p className="text-center text-gray-500">No data found.</p> }
      <div className="grid grid-cols-4 gap-6">
        {stories?.map((story: any) => (
          <div key={story?._id} className="relative">
            {story?.file && Object.entries(story?.file).slice(0, 1).map(([key, value]: [string, string], index) => (
              <div key={index} onClick={() => openSingleStory(story?._id)} className="cursor-pointer">
                <Image
                  unoptimized
                  src={getImageClientS3URL(key)}
                  width={264}
                  height={260}
                  alt="story"
                  className="rounded-[10px] aspect-square object-cover w-full"
                />
              </div>
            ))}
            <h2 className="font-aeonikBold text-lg capitalize text-darkBlack mt-[11px]">{story?.name.eng}</h2>
            <div className="absolute top-[5px] right-[6px] z-10">
              <button
                onClick={() => openDeleteModal(story?._id)}
                className="bg-white border border-orange rounded-[34px] flex items-center gap-[5px] py-2 px-4 text-orange"
              >
                <DeleteIcon stroke="var(--tw-bg-orange)" />Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-6 w-[400px] shadow-lg">
            <h2 className="text-xl font-aeonikBold text-darkBlack mb-4">Confirm Deletion</h2>
            <p className="text-darkBlack mb-6">Are you sure you want to delete this story?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeDeleteModal}
                className="w-[30%] bg-gray-200 text-darkBlack px-4 py-2 rounded-[10px] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className={`w-[30%] bg-orange text-white px-8 py-2 rounded-[10px] text-sm flex items-center text-center gap-2 ${
                  isPending ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isPending ? (
                  "Deleting..."
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;