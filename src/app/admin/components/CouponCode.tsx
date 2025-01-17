import Modal from "@mui/material/Modal";
import Image from "next/image";
import React, { useState } from "react";
import coupon from "@/assets/images/coupon.png";
import { CopyIcon } from "@/utils/svgicons";

interface ModalProp {
  open: any;
  onClose: any;
}

const CouponCode: React.FC<ModalProp> = ({ open, onClose }) => {
    const [copied, setCopied] = useState(false);
    const couponCode = "SAVE20";

    const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(couponCode);
          setCopied(true);
    
          // Reset the copied state after a short delay
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          console.error("Failed to copy text: ", error);
        }
      };
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="child-modal-title"
      className="grid place-items-center "
    >
      <div className="modal bg-white p-[30px] max-w-[600px] mx-auto rounded-[20px] w-full h-auto ">
        <div className="max-h-[80vh] overflow-auto overflo-custom">
          <Image
            src={coupon}
            alt=""
            width={244}
            height={194}
            className="mx-auto"
          />
          <h2 className="text-[32px] text-darkBlack mb-5  ">Coupon Code</h2>
          <div className="main-form">
            <label>
              Generated Coupon Code
            </label>
          <p className="bg-[#F5F5F5] mt-[5px] rounded-[10px] py-3 text-[#6E6E6E] px-4 text-sm  ">{couponCode}</p>
          </div>
          <div className="mt-5 flex gap-2.5 justify-end   ">
            <button onClick={handleCopy}
              className="flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px] "
            ><CopyIcon/>  {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={onClose}
              className="rounded-[28px] border border-darkBlack py-2 px-5 text-sm "
            >Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CouponCode;
