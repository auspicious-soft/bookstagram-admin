import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { DashboardIcon1, DashboardIcon2, DashboardIcon3, DashboardIcon4 } from '@/utils/svgicons';
import ReactLoading from 'react-loading';

const OverviewData = [
    {
      id: "1",
      title: "Total revenue",
      value: 53000,
      icon: <DashboardIcon1/>,
    },
    {
      id: "2",
      title: "New Books",
      value: 50,
      icon: <DashboardIcon2/>,
    },
    {
        id: "3",
        title: "New Users",
        value: 53000,
        icon: <DashboardIcon3/>,
      },
      {
        id: "4",
        title: "Events",
        value: 50,
        icon: <DashboardIcon4/>,
      },
];
const initialData = [
    {
      id: 'F123',
      status: 'Completed',
      clientName: 'Herry',
      contact: '1234567890',
      memberSince: '01 Jan 2020',
      assignments: 5,
      actionss: "Action",
      accountStatus: true,
      action: true,
    },
    {
      id: 'F545',
      status: 'Completed',
      clientName: 'Genny',
      contact: '1234567890',
      memberSince: '01 Jan 2020',
      assignments: 5,
      actionss: "Action",
      accountStatus: "active",
      action: "true",
    },
    {
      id: 'F55',
      status: 'Completed',
      clientName: 'Genny',
      contact: '1234567890',
      memberSince: '01 Jan 2020',
      assignments: 5,
      actionss: "Action",
      accountStatus: true,
      action: true,
    },
    // Add more data as needed
  ];

const Page = () => {
    return (
        <div>
           <div className='flex justify-between items-center'>
            <h2 className='text-[22px] text-darkBlack '>Overview</h2>
            <div>
                <select name="" className="py-[9px] px-[14px] rounded-[17px] ">
                <option value="">Last 30 days</option>
                <option value="">Last 1 month</option>
                <option value="">Last 3 month</option>
                <option value="">Last 6 month</option>
                </select>
            </div>
           </div>
           <div className='grid grid-cols-4 gap-4 mt-5'>
           {OverviewData.map((card) => (
            <DashboardCard
              key={card.id}
              icon={card.icon}
              title={card.title}
              value={
                card.value ?? (
                  <ReactLoading
                    type={"spin"}
                    color={"#E65F2B"}
                    height={"20px"}
                    width={"20px"}
                  />
                )
              }
            />
          ))}
           </div>
           <div className='bg-[#F2EAE5] rounded-[14px] mt-5 p-[18px] pb-7 '>
           <div className='flex justify-between items-center pb-2'>
            <h2 className='text-base text-darkBlack '>New Users</h2>
            <div>
                <select name="" className="py-[9px] px-[14px] rounded-[17px] ">
                <option value="">Last 30 days</option>
                <option value="">Last 1 month</option>
                <option value="">Last 3 month</option>
                <option value="">Last 6 month</option>
                </select>
            </div>
            </div>
            <div className='table-normal overflo-custom'>
            <table className="">
          <thead className="">
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Client</th>
              <th>Contact</th>
              <th>Member Since</th>
              <th>Assignments</th>
              <th>Actions</th>
              <th>Account Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className=''>
            {initialData.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>
                  <p className='font-gothamMedium rounded-3xl py-[2px] px-[10px] text-[#5E2626] bg-[#FFCCCC] text-[10px] '>{row.status}</p>
                </td>
                <td>{row.clientName}</td>
                <td>{row.contact}</td>
                <td>{row.memberSince}</td>
                <td>{row.assignments}</td>
                <td>{row.accountStatus}</td>
                <td>{row.action} </td>
                <td>{row.actionss} </td>
              </tr>
            ))}
          </tbody>
        </table>
            </div>

           </div>
        </div>
    );
}

export default Page;
