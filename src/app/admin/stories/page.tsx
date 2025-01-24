"use client";
import Button from "@/app/components/Button";
import { getAllStories } from "@/services/admin-services";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import { DeleteIcon } from "@/utils/svgicons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import useSWR from "swr";

const Page = () => {
  const router = useRouter();
  const { data } = useSWR(`/admin/stories`, getAllStories);
  const stories= data?.data?.data;
  console.log('stories:', stories);

  const addStory = () => {
   router.push('/admin/stories/add-new-story');
  };
  const openSingleStory = (id: string) => {
    router.push(`/admin/stories/single-story/${id}`);
  };
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
              <button className="bg-white border border-orange rounded-[34px] flex items-center gap-[5px] py-2 px-4 text-orange ">
              <DeleteIcon stroke="var(--tw-bg-orange)"/>Remove</button>
              </div>
            </div>
            ))}
        </div>
    </div>
  );
};

export default Page;
