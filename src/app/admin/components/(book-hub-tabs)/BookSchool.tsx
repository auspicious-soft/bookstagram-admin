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
import DeleteConfirmationModal from '../DeleteConfirmationModal';

const BookSchool = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [query, setQuery] = useState(`page=${page}&limit=${itemsPerPage}`);
  const [searchParams, setsearchParams] = useState('');
  const { data, error, isLoading, mutate } = useSWR(searchParams !== "" ? `/admin/book-schools?description=${searchParams}` : `/admin/book-schools?${query}`, getAllSchools, {
    revalidateOnFocus: false,
  })
  const schoolData = data?.data?.data;
  const [isopen, setIsOpen] = useState(false);
  const [couponModal, setCouponModal] = useState(false);
  const [coupon, setCoupon] = useState();

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setQuery(`page=${newPage}&limit=${itemsPerPage}`);
  };

  const openCouponModal = (code: any) => {
    setCouponModal(true)
    setCoupon(code);
  };

  const openDeleteModal = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      startTransition(async () => {
        const response = await deleteBookSchool(`/admin/book-schools/${itemToDelete.id}`);
        if (response.status === 200) {
          toast.success("Deleted successfully");
          mutate();
        } else {
          toast.error("Failed To Delete");
        }
        setIsDeleting(false);
        closeDeleteModal();
      });
    } catch (error) {
      toast.error("An error occurred while deleting");
      setIsDeleting(false);
      closeDeleteModal();
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
              <th>Total Allowed Activations</th>
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
              schoolData?.map((row: any) => {
                return (
                  <tr key={row?._id}>
                    <td>{row?.name?.eng}</td>
                    <td>{row?.couponCode}</td>
                    <td>{new Date(row?.createdAt).toLocaleDateString()}</td>
                    <td>{row?.codeActivated}</td>
                    <td>{row?.allowedActivation}</td>
                    <td>
                      <div>
                        <button onClick={() => openCouponModal(row?.couponCode)} className='p-2.5'><ViewIcon /></button>
                        <button
                          onClick={() => openDeleteModal(row?._id, row?.name?.eng || 'this school')}
                          className='p-2.5'
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              }
              )
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete School?"
        message={itemToDelete ? `Are you sure you really want to delete "${itemToDelete.name}"?` : "Are you sure you want to delete this school?"}
      />
    </div>
  );
};

export default BookSchool;
