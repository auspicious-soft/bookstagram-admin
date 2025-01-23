import React, { useState } from "react";
import SearchBar from "../SearchBar";
import { PlusIcon } from "@/utils/svgicons";
import TablePagination from "../TablePagination";
import GenerateCouponModal from "../GenerateCouponModal";

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
const BookSchool = () => {
  const [isopen, setIsOpen] = useState(false)

  return (
    <div>
      <div className="flex gap-2.5 justify-end mb-5 "> 
        {/* <SearchBar /> */}
        <div>
          <button onClick={()=> setIsOpen(true)}
            className="flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px] ">
            <PlusIcon /> Generate A Coupon
          </button>
        </div>
      </div>
      <div className='table-common overflo-custom'>
        <h3>All Schools</h3>
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
            </tr>
          </thead>
          <tbody className=''>
            {initialData.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.status} </td>
                <td>{row.clientName}</td>
                <td>{row.contact}</td>
                <td>{row.memberSince}</td>
                <td>{row.assignments}</td>
                <td>{row.accountStatus}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        <div className="mt-10 flex justify-end">
        {/* <TablePagination/> */}
        </div>

      <GenerateCouponModal
      open={isopen}
      onClose={()=>setIsOpen(false)}
        />
    </div>
  );
};

export default BookSchool;
