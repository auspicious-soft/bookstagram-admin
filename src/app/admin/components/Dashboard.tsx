'use client'
import React, { useState } from 'react';
import DashboardCard from './DashboardCard';
import ReactLoading from 'react-loading';
import { DashboardIcon1, DashboardIcon2, DashboardIcon3, DashboardIcon4 } from '@/utils/svgicons';
import useSWR from "swr";
import { getDashboardStats } from '@/services/admin-services';
import { useRouter } from 'next/navigation';

const Dashboard = () => {

const [overview, setOverview] = useState<string>("7");
const [user, setUser] = useState<string>("7");
const {data, error, mutate, isLoading} = useSWR(`/admin/dashboard?overviewDuration=${overview}&usersDuration=${user}`, getDashboardStats)
const overviewData= data?.data?.data
console.log('overviewData:', overviewData);
const router = useRouter();

const OverviewData = [
    {
      id: "1",
      title: "Total revenue",
      value: overviewData?.totalRevenue,
      icon: <DashboardIcon1/>,
    },
    {
      id: "2",
      title: "New Books",
      value: overviewData?.newBooks,
      icon: <DashboardIcon2/>,
    },
    {
        id: "3",
        title: "New Users",
        value: overviewData?.newUsersCount,
        icon: <DashboardIcon3/>,
      },
      {
        id: "4",
        title: "Events",
        value: overviewData?.eventsCount,
        icon: <DashboardIcon4/>,
      },
];
const handleOverviewChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setOverview(selectedValue);
};
const handleUsersChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setUser(selectedValue);
};
const userProfile = (id: string) => {
  router.push(`/admin/users/profile/${id}`);
};

    return (
        <div>
            <div className='flex justify-between items-center'>
            <h2 className='text-[22px] text-darkBlack '>Overview</h2>
            <div>
                <select name="overview" 
                value={overview}
                onChange={handleOverviewChange}
                className="py-[9px] px-[14px] rounded-[17px] ">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                </select>
            </div>
           </div>
           <div className='grid grid-cols-4 gap-4 mt-5'>
           {OverviewData.map((card) => (
            <DashboardCard
              key={card.id}
              icon={card.icon}
              title={card.title}
              value={card.value}
            />
          ))}
           </div>
           <div className='bg-[#F2EAE5] rounded-[14px] mt-5 p-[18px] pb-7 '>
           <div className='flex justify-between items-center pb-2'>
            <h2 className='text-base text-darkBlack '>New Users</h2>
            <div>
                <select name="user" 
                value={user} 
                onChange={handleUsersChange} 
                className="py-[9px] px-[14px] rounded-[17px] ">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                </select>
            </div>
            </div>
            <div className='table-normal overflo-custom'>
            <table className="">
          <thead className="">
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Level</th>
              <th>Phone Number</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className=''>
          {isLoading ? (
              <tr>
                <td colSpan={6} className="">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center text-red-500 ">
                  Error loading data.
                </td>
              </tr>
            ) : overviewData?.newestUsers?.length > 0 ? (
            overviewData?.newestUsers?.map((row: any) => (
              <tr key={row?._id}>
                <td>{row?._id}</td>
                <td>{row?.fullName}</td>
                <td>Level 3</td>
                <td>{row?.phoneNumber}</td>
                <td><button onClick={() => userProfile(row?._id)} className='text-[#F96915] bg-[#eac8b8] text-xs inline-block rounded-[20px] py-1 px-[6px]  '>View</button></td>
              </tr>
            ))
          ) : (
            <tr>
              <td  colSpan={6} >{isLoading ? <ReactLoading type={'spin'} color={'#26395e'} height={'20px'} width={'20px'} /> : <p>No data found</p>}</td>
            </tr>
          )}
          </tbody>
        </table>
        </div>
        </div>

        <div className='bg-[#F2EAE5] rounded-[14px] mt-[32px] p-[18px] pb-7 '>
           <div className='flex justify-between items-center pb-2'>
            <h2 className='text-base text-darkBlack '>Upcoming Events</h2>
            </div>
            <div className='table-normal overflo-custom'>
            <table className="">
          <thead className="">
            <tr>
              <th>Thumbnail</th>
              <th>Event Name</th>
              <th>Date/Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className=''>
          {isLoading ? (
              <tr> 
                <td colSpan={6} className=""> Loading... </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center text-red-500 ">
                  Error loading data.
                </td>
              </tr>
            ) : overviewData?.newestEvents?.length > 0 ? (
            overviewData?.newestEvents.map((row: any) => (
              <tr key={row?._id}>
                <td>{row?.image}</td>
                <td>{row?.name}</td>
                <td>{row?.createdAt}</td>
                <td>
                  <p className='text-[#F96915] bg-[#eac8b8] text-xs inline-block rounded-[20px] py-1 px-[6px]  '>View</p></td>
              </tr>
            ))
          ) : (
            <tr>
              <td  colSpan={6} >{isLoading ? <ReactLoading type={'spin'} color={'#26395e'} height={'20px'} width={'20px'} /> : <p>No data found</p>}</td>
            </tr>
          )}
          </tbody>
        </table>
        </div>
        </div>
        </div>
    );
}

export default Dashboard;
