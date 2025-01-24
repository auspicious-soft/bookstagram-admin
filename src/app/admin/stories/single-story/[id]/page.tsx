'use client';
import { getSingleStory } from '@/services/admin-services';
import { useParams } from 'next/navigation';
import React from 'react';
import useSWR from 'swr';

const Page = () => {
  const { id } = useParams();
  const { data } = useSWR(`/admin/stories/${id}`, getSingleStory);

  const storyData = data?.data?.data;
  console.log('storyData:', storyData);

  return (
    <div className="p-5 bg-white rounded-[20px] ">
      <h2 className="text-2xl text-[#10375C] mb-10 capitalize ">{storyData?.name}</h2>

      {storyData?.file && Object.entries(storyData?.file).map(([key, value]: [string, string], index) => (
     <div key={index}>

    <p>
      <strong>Key:</strong> {key}
      <br />
      <strong>Value:</strong> {value}
    </p>
  </div>
))}
    </div>
  );
};

export default Page;
