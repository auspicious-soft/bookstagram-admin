'use client'
import React, { useState } from 'react';
import SearchBar from './SearchBar';
import Button from '@/app/components/Button';
import TablePagination from './TablePagination';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { getAllUsers } from '@/services/admin-services';
import AddNewUser from './AddNewUser';
import ReactLoading from 'react-loading';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import TableRowImage from '@/app/components/TableRowImage';
import profile from '@/assets/images/preview.png';

const AllUsersTable = () => {
  const router = useRouter();
  const [page, setPage] = useState(1); 
  const itemsPerPage = 10;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState('');
  const {data, error, isLoading, mutate} = useSWR(searchParams!=="" ? `/admin/users?description=${searchParams}`: `/admin/users?${query}`, getAllUsers)
  const userData = data?.data?.data;    
  const [addUserModal, setAddUserModal] = useState(false);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

const userProfile = (id: string) => {
  router.push(`/admin/users/profile/${id}`);
}

    return (
        <div>
        <div className="flex gap-2.5 justify-end mb-5 "> 
        <SearchBar setQuery={setsearchParams}  query={searchParams}/>
        <div>
        <Button text='Add A New User' onClick={()=>setAddUserModal(true)}  />
        </div>
      </div>

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
            ) : userData?.length > 0 ? (
            userData?.map((row: any) => (
              <tr key={row?._id}>
                <td>{row?._id}</td>
                <td><div className="flex items-center gap-[5px] capitalize"><TableRowImage image={row?.profilePic ? getImageClientS3URL(row?.profilePic) : profile}/>
                 {row?.fullName?.eng}  </div>
                  </td>
                <td>Level 3</td>
                <td>{row?.phoneNumber}</td>
                <td>
                <button onClick={()=>userProfile(row?._id)} className='text-[#F96915] bg-[#eac8b8] text-xs inline-block rounded-[20px] py-1 px-[6px]  '>View</button>
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

        <AddNewUser open={addUserModal} onClose={()=>setAddUserModal(false)} mutate={mutate} />
      </div>
    );
}

export default AllUsersTable;
