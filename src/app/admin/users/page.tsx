import { getAllUsers } from '@/services/admin-services';
import React from 'react'; 
import AllUsersTable from '../components/AllUsersTable';

const Page = async() => {
// const query = new URLSearchParams({
//     page: "1",
//     limit: "10",
//   }).toString();

//   const response = await getAllUsers(`/admin/users?${query}`);
//   const data = await response.data;
//   console.log('dataaaa:', data);

    return (
        <div>    
        <AllUsersTable />
        </div>
    );
}

export default Page;
