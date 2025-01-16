import React from 'react';
import DashboardCard from '../../components/DashboardCard';
import { DashboardIcon2 } from '@/utils/svgicons';
import SingleBookProfile from '../../components/(book-hub-tabs)/SingleBookProfile';

const Page = () => {
    return (
        <div>
            <div className='grid grid-cols-4 gap-3 mb-[59px]  '>
                <DashboardCard 
                title='No of Book Sold'
                value={20}
                icon={<DashboardIcon2/>}
                />
            </div>
           <SingleBookProfile/>
        </div>
    );
}

export default Page;
