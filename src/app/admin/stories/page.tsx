"use client";
import Button from "@/app/components/Button";
import { deleteSingleStory, getAllStories } from "@/services/admin-services";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import { DeleteIcon } from "@/utils/svgicons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";

const Page = () => {
  const router = useRouter();
  const { data, mutate } = useSWR(`/admin/stories`, getAllStories);
  const stories= data?.data?.data;
  const [isPending , startTransition]= useTransition();
 


  const addStory = () => {
   router.push('/admin/stories/add-new-story');
  };
  const openSingleStory = (id: string) => {
    router.push(`/admin/stories/single-story/${id}`);
  };
  const handleDelete = async (id: string) => {
    try {
      startTransition(async()=>{
      const response = await deleteSingleStory(`/admin/stories/${id}`);
      if (response.status === 200) {
        toast.success("deleted successfully");
        mutate()
      } else {
      toast.error("Failed To Delete Story");
      }
    });
    } catch (error) {
    toast.error("an Error Occurred While Deleting The Story");
    }
  }
  return (
    <div>
      <div className="flex justify-end">
        <Button text="Add A New Story" onClick={addStory} />
        </div>
        <div className="grid grid-cols-4 gap-6">
            {stories?.map((story): any =>(
            <div key={story?._id} onClick={()=>openSingleStory(story?._id)} className="relative ">
               {story?.file && Object.entries(story?.file).slice(0, 1).map(([key, value]: [string, string], index) => (
                 <div key={index}>
                  <Image unoptimized src={getImageClientS3URL(key)} width={264} height={260} alt="story"
                className="rounded-[10px] aspect-square w-full "/>
              </div>
            ))}
                <h2 className="font-aeonikBold text-lg capitalize text-darkBlack mt-[11px] ">{story.name}</h2>
              <div className="absolute top-[5px] right-[6px]  ">
              <button onClick={()=>handleDelete(story?._id)} className="bg-white border border-orange rounded-[34px] flex items-center gap-[5px] py-2 px-4 text-orange ">
              <DeleteIcon stroke="var(--tw-bg-orange)"/>Remove</button>
              </div>
            </div>
            ))}
        </div>
    </div>
  );
};

export default Page;
