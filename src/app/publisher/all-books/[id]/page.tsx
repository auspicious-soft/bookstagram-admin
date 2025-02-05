'use client'
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import useSWR from 'swr';
import { getPublisherSingleBook } from "@/services/publisher/publisher-service";
import SalesChart from '../../components/SalesChart';
import DashboardCard from '@/app/admin/components/DashboardCard';
import { DashboardIcon1, DashboardIcon2 } from '@/utils/svgicons';

const Page = () => {
  const {id} = useParams();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const {data} = useSWR(`/publisher/books/${id}`, getPublisherSingleBook);
  const book= data?.data?.analytics
  const OverviewData = [
    { id: "1", title: "No of Book Sold This Month", value: book?.currentMonthCount, icon: <DashboardIcon2 /> },
    { id: "2", title: "Total No of Book Sold", value: book?.totalCount, icon: <DashboardIcon1 /> },
  ];
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };


  return (
    <div>
     <div className='grid grid-cols-4 gap-4 '>
        {OverviewData.map((card) => (
          <DashboardCard
            key={card.id}
            icon={card.icon}
            title={card.title}
            value={card.value}
          />
        ))}
      </div>
      <div className='grid grid-cols-[7fr_5fr] gap-[14px] my-[30px]'>
        <div className='bg-[#F2EAE5] rounded-[14px] py-[18px] px-4'>
          <SalesChart data={data?.data?.analytics}  selectedYear={selectedYear} onYearChange={handleYearChange} />
        </div>
        </div>
    </div>
  );
}

export default Page;
