"use client";
import Button from "@/app/components/Button";
import { getAllBanners, deleteSingleBanner } from "@/services/admin-services";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import { DeleteIcon } from "@/utils/svgicons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";

const Page = () => {
  const router = useRouter();
  const { data, mutate } = useSWR(`/admin/banners`, getAllBanners); 
  const stories= data?.data?.data;
  const [isPending , startTransition]= useTransition();
 


  const addBanner = () => {
   router.push('/admin/stories/add-new-banner');
  };

  const handleDelete = async (id: string) => {
    try {
      startTransition(async()=>{
      const response = await deleteSingleBanner(`/admin/banners/${id}`);
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
        <Button text="Add A New Banner" onClick={addBanner} />
        </div>
        <div className="grid grid-cols-4 gap-6">
            {stories?.map((banner): any =>(
            <div key={banner?._id} className="relative ">
                  <Image unoptimized src={getImageClientS3URL(banner?.image)} width={264} height={163} alt="story"
                className="rounded-[10px]  w-full "/>
                <h2 className="font-aeonikBold text-lg capitalize text-darkBlack mt-[11px] ">{banner?.name}</h2>
              <div className="absolute top-[5px] right-[6px]  ">
              <button onClick={()=>handleDelete(banner?._id)} className="bg-white border border-orange rounded-[34px] flex items-center gap-[5px] py-2 px-4 text-orange ">
              <DeleteIcon stroke="var(--tw-bg-orange)"/>Remove</button>
              </div>
            </div>
            ))}
        </div>
    </div>
  );
};

export default Page;
