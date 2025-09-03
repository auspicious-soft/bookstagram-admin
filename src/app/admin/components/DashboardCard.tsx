// import React from 'react';


// interface OverviewProps {
//     title: string;
//     value: number | string | React.ReactNode;
//     icon: React.ReactNode;
//     backgroundColor?: string;
//   };
// const DashboardCard: React.FC<OverviewProps> = ({title, value, icon, backgroundColor} ) => {
//     return (
//         <div className='rounded-[14px] px-[18px] pt-[18px] pb-[24px]'  style={{ backgroundColor: backgroundColor || '#F2EAE5' }}>
//             <div>{icon}</div>
//             <p className='text-[#797979] mb-2.5 text-sm mt-5  '>{title} </p>
//             <h3 className='text-darkBlack text-[28px] tracking-[0.28px] ' >{value}</h3>
//         </div>
//     );
// }

// export default DashboardCard;


// import React from 'react';

// interface OverviewProps {
//   title: string;
//   value: number | string | React.ReactNode | undefined; // Allow undefined for loading state
//   icon: React.ReactNode;
//   backgroundColor?: string;
// }

// const DashboardCard: React.FC<OverviewProps> = ({ title, value, icon, backgroundColor }) => {
//   return (
//     <div
//       className="rounded-[14px] px-[18px] pt-[18px] pb-[24px]"
//       style={{ backgroundColor: backgroundColor || '#F2EAE5' }}
//     >
//       <div>{icon}</div>
//       <p className="text-[#797979] mb-2.5 text-sm mt-5">{title}</p>
//       {value !== undefined ? (
//         <h3 className="text-darkBlack text-[28px] tracking-[0.28px]">{value}</h3>
//       ) : (
//         <div className="h-7 w-3/4 bg-gray-300 rounded animate-pulse" /> // Skeleton placeholder
//       )}
//     </div>
//   );
// };

// export default DashboardCard;



import React from 'react';

interface OverviewProps {
  title: string;
  value: number | string | React.ReactNode | undefined; // Allow undefined for loading state
  icon: React.ReactNode;
  backgroundColor?: string;
}

const DashboardCard: React.FC<OverviewProps> = ({ title, value, icon, backgroundColor }) => {
    console.log('value: ', value);
  return (
    <div
      className="rounded-[14px] px-[18px] pt-[18px] pb-[24px]"
      style={{ backgroundColor: backgroundColor || '#F2EAE5' }}
    >
      <div>{icon}</div>
      <p className="text-[#797979] mb-2.5 text-sm mt-5">{title}</p>
      {value !== undefined ? (
        <h3 className="text-darkBlack text-[28px] tracking-[0.28px]">{title === "Total revenue" ? `$${value}` : value}</h3>
      ) : (
        <div className="h-7 w-3/4 bg-gray-300 rounded animate-pulse" /> // Skeleton placeholder
      )}
    </div>
  );
};

export default DashboardCard;