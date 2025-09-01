'use client'
import DashboardCard from '@/app/admin/components/DashboardCard';
import TableRowImage from '@/app/components/TableRowImage';
import { getPublisherDashboard } from '@/services/publisher/publisher-service';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import { DashboardIcon1, DashboardIcon2, DashboardIcon3, StarIcon } from '@/utils/svgicons';
import React, { useState } from 'react';
import ReactLoading from 'react-loading';
import useSWR from 'swr';
import profile from '@/assets/images/preview.png';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SalesChart from '../components/SalesChart';
import { getProfileImageUrl } from '@/utils/getImageUrl';


const Page = () => {
  const router = useRouter(); 
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data, error, isLoading, mutate } = useSWR(`/publisher/dashboard?year=${selectedYear}`, getPublisherDashboard);
  const stats = data?.data;
  const allBooks = data?.data?.Books; 

  const OverviewData = [
    { id: "1", title: "Total Books", value: stats?.TotalBooksCount, icon: <DashboardIcon1 /> },
    { id: "2", title: "New Books", value: stats?.NewBooks, icon: <DashboardIcon2 /> },
    { id: "3", title: "Overall Rating", value: (Math.round((stats?.averageRating || 0) * 10) / 10).toFixed(1), icon: <DashboardIcon3 /> },
  ];
  const bookProfile = (id: string) => {
    router.push(`/publisher/all-books/${id}`);
  }
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
          <SalesChart data={stats?.analytics}  selectedYear={selectedYear} onYearChange={handleYearChange} />
        </div>
        <div className='bg-[#F2EAE5] rounded-[14px] py-[18px] px-4 '>
       <h2 className='text-base text-darkBlack font-aeonikBold mb-5 '>Most Sold Book</h2>
        <div className='space-y-[10px] '>
        {stats?.topBooks?.map((book) => (
          <div key={book?._id} className='flex gap-[15px] items-center'>
            <div>
              <Image src={getProfileImageUrl(book?.image)} unoptimized alt='img' width={62} height={62} className='rounded-[5px] aspect-square' />
            </div>
            <div className='space-y=[6px] '>
              <h3 className='text-sm font-aeonikBold capitalize text-darkBlack'>{book?.name?.eng}</h3>
              <p className='text-sm text-darkBlack'>{book?.authorId[0]?.name?.eng}</p>
              <div className='flex gap-[5px] items-center '><StarIcon/><span className='font-[11px]'>{book?.averageRating}</span></div>
            </div>
            </div>
          ))}
        </div>
        </div>
      </div>
      <h2 className='text-base text-darkBlack font-aeonikBold '>All Books</h2>
      
      <div className='table-normal overflo-custom'>
        <table className="">
          <thead className="">
            <tr>
              <th>Thumbnail</th>
              <th>Book Name</th>
              <th>Author</th>
              <th>Rating</th>
              <th>Genre</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className=''>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center text-red-500 ">Error loading data.</td>
              </tr>
            ) : allBooks?.length > 0 ? (
              allBooks?.map((row: any) => (
                <tr key={row?._id}>
                  <td><TableRowImage image={row?.image ? getProfileImageUrl(row?.image) : profile} /></td>
                  <td> {row?.name?.eng} </td>
                  <td>{row?.authorId[0]?.name?.eng}</td>
                  <td>{row?.averageRating}</td>
                  <td> <div className="flex flex-wrap gap-2">
                 {(row?.genre).slice(0, 3).map((categoryName, index) => (
                      <span key={index} className="bg-[#EDEDED] px-2.5 text-[10px] py-1 rounded-full capitalize" >
                        {categoryName}
                      </span>
                    ))}
                </div></td>
                  <td><button onClick={() => bookProfile(row?._id)} className='text-[#F96915] bg-[#eac8b8] text-xs inline-block rounded-[20px] py-1 px-[6px]  '>View</button></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} >{isLoading ? <ReactLoading type={'spin'} color={'#26395e'} height={'20px'} width={'20px'} /> : <p>No data found</p>}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Page;
