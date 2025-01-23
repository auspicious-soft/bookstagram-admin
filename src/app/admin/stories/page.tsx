"use client";
import Button from "@/app/components/Button";
import { getAllStories } from "@/services/admin-services";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import Image from "next/image";
import React from "react";
import useSWR from "swr";

const Page = () => {
  const { data } = useSWR(`/admin/stories`, getAllStories);
  const stories= data?.data?.data;
  console.log('stories:', stories);
  const addStory = () => {
    console.log("Add story clicked");
  };
  return (
    <div>
      <div className="flex justify-end">
        <Button text="Add A New Story" onClick={addStory} />
        </div>
        <div className="grid grid-cols-4 gap-6">
            {stories?.map((story): any =>(
            <div key={story?._id}>
                <Image unoptimized src={getImageClientS3URL(story?.file.image)} width={264} height={260} alt="story"
                className="rounded-[10px] aspect-square w-full "/>
                <h2 className="font-aeonikBold text-lg capitalize text-darkBlack mt-[11px] ">{story.name}</h2>
            </div>
            ))}
        </div>
    </div>
  );
};

export default Page;
