"use client";
import Button from "@/app/components/Button";
import DeleteConfirmationModal from "@/app/admin/components/DeleteConfirmationModal";
import { getAllBanners, deleteSingleBanner } from "@/services/admin-services";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import { DeleteIcon } from "@/utils/svgicons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { getProfileImageUrl } from "@/utils/getImageUrl";

const Page = () => {
  const router = useRouter();
  const { data, mutate } = useSWR(`/admin/banners`, getAllBanners);
  const banners = data?.data?.data;
  const [, startTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const addBanner = () => {
    router.push('/admin/promotions/add-new-banner');
  };

  const openDeleteModal = (id: string) => {
    setBannerToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setBannerToDelete(null);
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;

    setIsDeleting(true);
    try {
      startTransition(async () => {
        const response = await deleteSingleBanner(`/admin/banners/${bannerToDelete}`);
        if (response.status === 200) {
          toast.success("Deleted successfully");
          mutate();
        } else {
          toast.error("Failed To Delete Banner");
        }
        setIsDeleting(false);
        closeDeleteModal();
      });
    } catch (error) {
      toast.error("An Error Occurred While Deleting The Banner");
      setIsDeleting(false);
      closeDeleteModal();
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
              src={getProfileImageUrl(banner?.image)}
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
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete Promotion?"
        message="Are you sure you really want to delete this promotion?"
      />
    </div>
  );
};

export default Page;