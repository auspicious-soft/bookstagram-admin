'use client'
import React, { useState, useTransition } from 'react';
import Button from '@/app/components/Button';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { deleteBookSchool, getAllSchools } from '@/services/admin-services';
import ReactLoading from 'react-loading';
import { getImageClientS3URL } from '@/utils/get-image-ClientS3URL';
import TableRowImage from '@/app/components/TableRowImage';
import profile from '@/assets/images/preview.png';
import GenerateCouponModal from '../GenerateCouponModal';
import SearchBar from '../SearchBar';
import TablePagination from '../TablePagination';
import { DeleteIcon, ViewIcon } from '@/utils/svgicons';
import { toast } from 'sonner';
import CouponCode from '../CouponCode';

const BookSchool = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState('');
  const { data, error, isLoading, mutate } = useSWR(searchParams !== "" ? `/admin/book-schools?description=${searchParams}` : `/admin/book-schools?${query}`, getAllSchools, {
    revalidateOnFocus: false,
  })
  const schoolData = data?.data?.data;
  const [isopen, setIsOpen] = useState(false);
  const [couponModal, setCouponModal] = useState(false);
  const [coupon, setCoupon] = useState();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const openCouponModal = (code: any) => {
    setCouponModal(true)
    setCoupon(code);
  };

  const handleDelete = async (id: string) => {
    try {
      startTransition(async () => {
        const response = await deleteBookSchool(`/admin/book-schools/${id}`);
        if (response.status === 200) {
          toast.success("deleted successfully");
          mutate()
        } else {
          toast.error("Failed To Delete");
        }
      });
    } catch (error) {
      toast.error("an Error Occurred While Deleting");
    }
  }

  return (
    <div>
      <div className="flex gap-2.5 justify-end mb-5 ">
        <SearchBar setQuery={setsearchParams} query={searchParams} />
        <div>
          <Button text='Generate A Coupon' onClick={() => setIsOpen(true)} />
        </div>
      </div>

      <div className='table-common overflo-custom'>
        <h3>All Schools</h3>
        <table className="">
          <thead className="">
            <tr>
              <th>Name of School</th>
              <th>Coupon Code</th>
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
            ) : schoolData?.length > 0 ? (
              schoolData?.map((row: any) => (
                <tr key={row?._id}>
                  <td>{row?.name?.eng}</td>
                  <td>{row?.couponCode}</td>
                  <td>{row?.createdAt}</td>
                  <td>{row?.codeActivated}</td>
                  <td>
                    <div>
                      <button onClick={() => openCouponModal(row?.couponCode)} className='p-2.5'><ViewIcon /></button>
                      <button onClick={() => handleDelete(row?._id)} className='p-2.5'><DeleteIcon /> </button>
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
      <div className="mt-10 flex justify-end">
        <TablePagination
          setPage={handlePageChange}
          page={page}
          totalData={data?.data?.total}
          itemsPerPage={itemsPerPage}
        />
      </div>
      {coupon && <CouponCode
        couponCode={coupon}
        open={couponModal}
        onClose={() => setCouponModal(false)}
      />}
      {isopen && <GenerateCouponModal
        open={isopen}
        onClose={() => setIsOpen(false)}
        mutateCoupons={mutate}
      />}
    </div>
  );
};

export default BookSchool;
