import { getAllVouchers } from '@/services/admin-services';
import React, { useState } from 'react';
import useSWR from 'swr';
import TablePagination from './TablePagination';
import ReactLoading from 'react-loading';

const AllVouchers = () => {
  const [page, setPage] = useState(1); 
  const itemsPerPage = 10;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const {data, error, isLoading} = useSWR(`/admin/vouchers`, getAllVouchers)
  console.log('data:', data?.data?.data);
  const vouchers = data?.data?.data

const handlePageChange = (newPage: number) => {
  setPage(newPage);
  setQuery(`page=${newPage}&limit=${itemsPerPage}`);
};

  return (
    <div>
      <div className='table-common overflo-custom'>
        <h3>All Users</h3>
            <table className="">
          <thead className="">
            <tr>
              <th>User Id</th>
              <th>Name</th>
              <th>Level</th>
              <th>Phone Number</th>
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
            ) : vouchers?.length > 0 ? (
              vouchers?.map((row: any) => (
              <tr key={row?._id}>
                <td>{row?._id}</td>
                <td> {row?.fullName} 
                  </td>
                <td>Level 3</td>
                <td>{row?.phoneNumber}</td>
                <td>
                <button  className='text-[#F96915] bg-[#eac8b8] text-xs inline-block rounded-[20px] py-1 px-[6px]  '>View</button>
                </td>
                
              </tr>
            ))
         ) : (
             <tr>
               <td colSpan={6}>{isLoading ? (<ReactLoading type={"spin"} color={"#26395e"} height={"20px"} width={"20px"} />
                 ) : (
                   <p>No data found</p>
                 )}
               </td>
             </tr>
            )}
          </tbody>
        </table>
      </div>
        <div className="mt-10 flex justify-end">
        <TablePagination
          setPage={handlePageChange}
          page={page}
          totalData={data?.data?.total}
          itemsPerPage={itemsPerPage}
          />
        </div>
    </div>
  );
}

export default AllVouchers;
