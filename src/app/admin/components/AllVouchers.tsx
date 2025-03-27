import { deleteVoucher, getAllVouchers } from '@/services/admin-services';
import React, { useState } from 'react';
import useSWR from 'swr';
import TablePagination from './TablePagination';
import ReactLoading from 'react-loading';
import { ViewIcon, DeleteIcon } from '@/utils/svgicons'; 
import CouponCode from './CouponCode';
import { toast } from 'sonner';

interface Props {
  vouchers: any;
  isLoading: any;
  error: any;
  mutate: any;
  total: any;
  page: any;
  itemsPerPage: any;
  handlePageChange: any;
}
const AllVouchers = ({vouchers, isLoading, error, mutate, total, page, itemsPerPage, handlePageChange}: Props) => {
  // const [page, setPage] = useState(1); 
  // const itemsPerPage = 10;
  // const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  // const {data, error, isLoading, mutate} = useSWR(`/admin/vouchers`, getAllVouchers)
  // const vouchers = data?.data?.data;
  const [couponModal, setCouponModal] = useState(false);
  const [coupon, setCoupon] = useState();



  // const handlePageChange = (newPage: number) => {
  // setPage(newPage);
  // setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  // };
  const openCouponModal = (code: any) => {
    setCouponModal(true)
    setCoupon(code);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteVoucher(`/admin/vouchers/${id}`);
      if (response.status === 200) {
        toast.success("Deleted successfully");
        mutate()
      } else {
      toast.error("Failed To Delete voucher");
      }
    } catch (error) {
    toast.error("an Error Occurred While Deleting The voucher");
    }
  }


  return (
    <div>
      <div className='table-common overflo-custom'>
        <h3>All Vouchers</h3>
          <table className="">
          <thead className="">
            <tr>
              <th>Coupon Code</th>
              <th>Discount Percentage</th>
              <th>Created On</th>
              <th>No of Activations</th>
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
            ) : vouchers?.length > 0 ? (
              vouchers?.map((row: any) => (
              <tr key={row?.voucher?._id}>
                <td>{row?.voucher?.couponCode}</td>
                <td>{row?.voucher?.percentage}%</td>
                <td>{row?.voucher?.createdAt}</td>
                <td>{row?.voucher?.activationCount}</td>
                <td>
                <div>
                <button onClick={()=> openCouponModal(row?.voucher?.couponCode)} className='p-2.5'><ViewIcon/></button>
                <button onClick={()=>handleDelete(row?.voucher?._id)} className='p-2.5'><DeleteIcon/> </button>
                </div>
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
        {/* <div className="mt-10 flex justify-end">
        <TablePagination
          setPage={handlePageChange}
          page={page}
          totalData={total}
          itemsPerPage={itemsPerPage}
          />
        </div> */}
        <CouponCode 
          couponCode={coupon} 
          open={couponModal} 
          onClose={() => setCouponModal(false)}
        /> 

    </div>
  );
}

export default AllVouchers;
