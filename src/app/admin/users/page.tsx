import { getAllUsers } from '@/services/admin-services';
import React from 'react'; 
import AllUsersTable from '../components/AllUsersTable';

const Page = async() => {

    return (
        <div>    
        <AllUsersTable />
        </div>
    );
}

export default Page;
