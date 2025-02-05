'use client';
import { getSingleStory, updateStory } from '@/services/admin-services';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import { DeleteIcon } from '@/utils/svgicons';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState, useTransition } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import EditStoryModal from '@/app/admin/components/EditStoryModal';

const Page = () => {
  const { id } = useParams();
  const { data, mutate } = useSWR(`/admin/stories/${id}`, getSingleStory);
  const [isPending, startTransition] = useTransition();
  const [files, setFiles] = useState<Record<string, string>>({});
  const [storyModal, setStoryModal] = useState(false);

  const storyData = data?.data?.data; 
   
  React.useEffect(() => {
    if (storyData?.file) {
      setFiles(storyData.file);
    }
  }, [storyData?.file]);

  const handleDelete = (fileKey: string) => {
    const updatedFiles = { ...files };
    delete updatedFiles[fileKey];
    setFiles(updatedFiles);
  };

  const handleSave = async () => {
    startTransition(async () => {
      try {
        const payload = {
          name: storyData.name,
          file: files
        };
        const response = await updateStory(`/admin/stories/${id}`, payload);
        
        if (response.status === 200) {
          toast.success('Story updated successfully'); 
          mutate();
        } else {
          toast.error('Failed to update story');
        }
      } catch (error) {
        console.error('Error updating story:', error);
        toast.error('An error occurred while updating the story');
      }
    });
  };

  return (
    <div className="p-5 bg-white rounded-[20px]">
      <div className='flex items-center justify-between mb-10 '>
        <h2 className="text-2xl text-[#10375C] capitalize">
          {storyData?.name.eng}
        </h2>
        <button onClick={()=>setStoryModal(true)} className='bg-orange text-white text-sm px-5 py-2.5  rounded-[28px]'>Edit Story</button>
      </div>
      <div className='grid grid-cols-3 gap-2.5'>
        {files && Object.entries(files).map(([key, value], index) => (
          <div key={index} className='relative'>
            <Link href={value} target='blank'>
              <Image
                src={getImageClientS3URL(key)}
                alt='story'
                width={200}
                height={100}
                unoptimized
                className='w-full object-cover aspect-[3/2] rounded-[12px]'
              />
            </Link>
            <div className="absolute top-[5px] right-[6px] z-10">
              <button
                onClick={() => handleDelete(key)}
                className="bg-white border border-orange rounded-[34px] flex items-center gap-[5px] py-2 px-4 text-orange"
              >
                <DeleteIcon stroke="var(--tw-bg-orange)" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="bg-orange text-white text-sm px-4 mt-10 py-[14px] text-center rounded-[28px] w-full"
      >
        {isPending ? "Saving..." : "Save"}
      </button>

      <EditStoryModal
      onClose={()=>setStoryModal(false)}
      open={storyModal}
      data={storyData}
      />
    </div>
  );
};

export default Page;