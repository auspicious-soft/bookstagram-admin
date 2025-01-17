import { auth } from '@/auth';
import { getDashboardStats } from '@/services/admin-services';
import React from 'react';
import Dashboard from '../components/Dashboard';



const Page = async() => {
  // const session = await auth()
  // const response = await getDashboardStats(`/admin/dashboard`)
  // const data = await response.data
  // console.log('data:', data);

    return (
        <div>
         <Dashboard/>
        </div>
    );
}

export default Page;
