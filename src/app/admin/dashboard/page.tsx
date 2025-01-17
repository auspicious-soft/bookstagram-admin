import { auth } from '@/auth';
import { getDashboardStats } from '@/services/admin-services';
import React from 'react';
import Dashboard from '../components/Dashboard';



const Page = async() => {
  // const session = await auth()
  // const handleFilterChange = async (params: { overviewDuration: string; usersDuration?: string }) => {
  //   const queryString = new URLSearchParams(params).toString();
  //   const response = await getDashboardStats(`/admin/dashboard?${queryString}`);
  //   const data = response.data;
  //   console.log('Updated data:', data);
  //};

    return (
        <div>
         <Dashboard />
        </div>
    );
}

export default Page;
