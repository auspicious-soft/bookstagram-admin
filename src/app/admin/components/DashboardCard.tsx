import React from 'react';


interface OverviewProps {
    title: string;
    value: number | string | React.ReactNode;
    icon: React.ReactNode
  };
const DashboardCard: React.FC<OverviewProps> = ({title, value, icon} ) => {
    return (
        <div className='bg-[#F2EAE5] rounded-[14px] px-[18px] pt-[18px] pb-[24px]  '>
            <div>{icon}</div>
            <p className='text-[#797979] mb-2.5 text-sm mt-5  '>{title} </p>
            <h3 className='text-darkBlack text-[28px] tracking-[0.28px] ' >{value}</h3>
        </div>
    );
}

export default DashboardCard;
