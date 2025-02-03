import { auth } from '@/auth';
import { getDashboardStats } from '@/services/admin-services';
import React from 'react';
import Dashboard from '../components/Dashboard';



const Page = async() => {
    return (
        <div>
         <Dashboard />
        </div>
    );
}

export default Page;
