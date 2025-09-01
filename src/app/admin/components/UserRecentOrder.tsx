import { getSingleUserOrders } from '@/services/admin-services';
import React from 'react';
import ReactLoading from 'react-loading';
import useSWR from 'swr';

interface Props {
    id: string;
}
const UserRecentOrder = ({id}:Props) => {
const {data, isLoading, mutate, error} = useSWR(`/admin/user/${id}`, getSingleUserOrders) 
const orders = data?.data?.data?.userOrders 

return (
    <div className='mt-[30px] '>
      <h2 className='text-[22px] text-darkBlack mb-5 '>Recent Orders</h2>  
     <div className='table-common overflo-custom'>  
            <table className="!min-w-full">
          <thead className="">
            <tr>
              <th>Order ID</th>
              <th>Name of Book</th>
              <th>Name of Author</th> 
              <th className='!text-right'>Amount Paid</th>
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
            ) : orders?.length > 0 ? (
                orders?.map((row: any) => (
              <tr key={row?._id}>
                <td>#{row?.identifier}</td>
                <td className='capitalize'>{row?.productIds[0]?.name.eng ?? row?.productIds[0]?.name.kaz ?? row?.productIds[0]?.name.rus}</td>
                <td>{row?.productIds[0]?.authorId[0]?.name.eng} </td>
                <td className='text-right'>${row?.totalAmount}</td> 
                
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
            
    </div>
    );
}

export default UserRecentOrder;
