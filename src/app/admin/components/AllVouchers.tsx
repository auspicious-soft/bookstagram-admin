import React, { useState } from 'react';
import { deleteVoucher } from '@/services/admin-services';
import { toast } from 'sonner';
import { ViewIcon, DeleteIcon } from '@/utils/svgicons';
import CouponCode from './CouponCode';
import ReactLoading from 'react-loading';
import TablePagination from './TablePagination';

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

const AllVouchers = ({ vouchers, isLoading, error, mutate, total, page, itemsPerPage, handlePageChange }: Props) => {
  const [couponModal, setCouponModal] = useState(false);
  const [coupon, setCoupon] = useState();
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);

  const openCouponModal = (code: any) => {
    setCouponModal(true);
    setCoupon(code);
  };

  const openDeleteModal = (id: string) => {
    setSelectedVoucherId(id);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedVoucherId) return;
    try {
      const response = await deleteVoucher(`/admin/vouchers/${selectedVoucherId}`);
      if (response.status === 200) {
        toast.success("Deleted successfully");
        mutate();
      } else {
        toast.error("Failed To Delete voucher");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the voucher");
    } finally {
      setDeleteModal(false);
      setSelectedVoucherId(null);
    }
  };

  return (
    <div>
      <div className='table-common overflo-custom'>
        <h3>All Vouchers</h3>
        <table className="">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount Percentage</th>
              <th>Created On</th>
              <th>No of Activations</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center text-red-500">Error loading data.</td>
              </tr>
            ) : vouchers?.length > 0 ? (
              vouchers.map((row: any) => (
                <tr key={row?.voucher?._id}>
                  <td>{row?.voucher?.couponCode}</td>
                  <td>{row?.voucher?.percentage}%</td>
                  <td>{new Date(row?.voucher?.createdAt).toLocaleDateString()}</td>
                  <td>{row?.voucher?.activationCount}</td>
                  <td>
                    <div>
                      <button onClick={() => openCouponModal(row?.voucher?.couponCode)} className='p-2.5'><ViewIcon /></button>
                      <button onClick={() => openDeleteModal(row?.voucher?._id)} className='p-2.5'><DeleteIcon /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  {isLoading ? (
                    <ReactLoading type={"spin"} color={"#26395e"} height={"20px"} width={"20px"} />
                  ) : (
                    <p>No data found</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 grid place-items-center">
          <div className="bg-white rounded-[20px] p-6 w-[400px] max-w-[90%] shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-[#151d48]">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this voucher?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded-[28px] border border-darkBlack text-sm"
                onClick={() => setDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-[28px] bg-red-600 text-white text-sm"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <CouponCode
        couponCode={coupon}
        open={couponModal}
        onClose={() => setCouponModal(false)}
      />
    </div>
  );
};

export default AllVouchers;
