import React, { useState, useTransition } from 'react';
import Modal from '@mui/material/Modal';
import Image from 'next/image';
import { toast } from 'sonner';
import CouponCode from './CouponCode';
import { postNewVoucher } from '@/services/admin-services';
import coupon from "@/assets/images/coupon.png";
import { PlusIcon } from '@/utils/svgicons'; 

interface ModalProp {
    open: boolean;
    onClose: () => void;
    mutate: any; 
}

const GenerateVoucher: React.FC<ModalProp> = ({ open, onClose, mutate }) => {
    const [couponModal, setCouponModal] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [percentage, setPercentage] = useState('');
    const [isPending, startTransition] = useTransition();

    const generateCouponCode = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from(
            { length: 15 }, 
            () => characters.charAt(Math.floor(Math.random() * characters.length))
        ).join('');
    };

    const handleGenerateCoupon = () => { 
        const parsedPercentage = parseInt(percentage);
        if (isNaN(parsedPercentage) || parsedPercentage <= 0 || parsedPercentage > 100) {
            toast.error("Please enter a valid percentage between 1 and 100");
            return;
        }
        const generatedCode = generateCouponCode();
        setCouponCode(generatedCode);

        startTransition(async () => {
            try {
                const payload = {
                    couponCode: generatedCode,
                    percentage: parsedPercentage
                };
                const response = await postNewVoucher("/admin/vouchers", payload);
                if (response?.status === 201) {
                    toast.success("Voucher added successfully");
                    // onClose();
                    mutate();
                    setCouponModal(true);
                    setPercentage('')
                } else {
                    toast.error("Failed to add voucher");
                }    
            } catch (error) {
                console.error("Error", error);
                toast.error("An error occurred while adding the voucher");
            }
        });
    };

    const handleClose = () => {
        setPercentage('');
        setCouponCode('');
        setCouponModal(false);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="child-modal-title" 
            className='grid place-items-center'
        >
            <div className='modal bg-white py-[30px] px-5 max-w-[617px] mx-auto rounded-[20px] w-full h-full'>
                <div className='max-h-[80vh] overflow-auto overflo-custom'>
                    <Image src={coupon} alt="" width={244} height={194} className="mx-auto" />
                    <h2 className='text-[32px] text-darkBlack my-5'>Generate Voucher</h2>
                    <div className='main-form'>
                        <label>
                            Discount Percentage
                            <input 
                                type="number" 
                                name='percentage' 
                                value={percentage}
                                onChange={(e) => setPercentage(e.target.value)}
                                placeholder='15%' 
                                required
                                min="1"
                                max="100"
                            />
                        </label>     
                        <div className='mt-[30px] flex gap-2.5 justify-end'>
                            <button 
                                onClick={handleGenerateCoupon} 
                                className="flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px]"
                                disabled={isPending}
                            >
                                <PlusIcon /> Generate Voucher
                            </button>
                            <button 
                                onClick={handleClose} 
                                className='rounded-[28px] border border-darkBlack py-2 px-5 text-sm'
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
                <CouponCode 
                    couponCode={couponCode} 
                    open={couponModal} 
                    onClose={() => setCouponModal(false)}
                    close={onClose}
                /> 
            </div>
        </Modal>
    );
}

export default GenerateVoucher;