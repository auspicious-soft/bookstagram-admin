"use client";
import Button from "@/app/components/Button";
import { getAllBanners, deleteSingleBanner } from "@/services/admin-services";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import { DeleteIcon } from "@/utils/svgicons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";

const Page = () => {
  const router = useRouter();
  const { data, mutate } = useSWR(`/admin/banners`, getAllBanners);
  const banners = data?.data?.data;
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);

  const addBanner = () => {
    router.push('/admin/promotions/add-new-banner');
  };

  const openDeleteModal = (id: string) => {
    setBannerToDelete(id);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setBannerToDelete(null);
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;
    try {
      startTransition(async () => {
        const response = await deleteSingleBanner(`/admin/banners/${bannerToDelete}`);
        if (response.status === 200) {
          toast.success("Deleted successfully");
          mutate();
          closeDeleteModal();
        } else {
          toast.error("Failed To Delete Banner");
        }
      });
    } catch (error) {
      toast.error("An Error Occurred While Deleting The Banner");
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-5">
        <Button text="Add A New Banner" onClick={addBanner} />
      </div>
      <div className="grid grid-cols-4 gap-6">
        {banners?.length === 0 && <p className="text-center text-gray-500">No data found.</p>}
        {banners?.map((banner: any) => (
          <div key={banner?._id} className="relative">
            <Image
              unoptimized
              src={getImageClientS3URL(banner?.image)}
              width={264}
              height={163}
              alt="banner"
              className="rounded-[10px] aspect-[3/2] object-cover w-full"
            />
            <h2 className="font-aeonikBold text-lg capitalize text-darkBlack mt-[11px]">
              {banner?.name.eng || banner?.name.kaz || banner?.name.rus}
            </h2>
            <div className="absolute top-[5px] right-[6px]">
              <button
                onClick={() => openDeleteModal(banner?._id)}
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
            <p className="text-darkBlack mb-6">Are you sure you want to delete this promotion?</p>
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
                className={`w-[30%] bg-orange text-white px-8 py-2 rounded-[10px] text-sm flex items-center gap-2 ${
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