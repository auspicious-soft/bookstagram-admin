"use client";

import React, { useState, useTransition } from "react";  
import Image from "next/image";
import Logo from "@/assets/images/logo.png";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import InputField from "../components/InputField";
import LoginImage from "../components/LoginImage";
import { sendOtpService } from "@/services/admin-services";

export default function Page() { 
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const handleOtpChange = (index: number, value: string) => {
      const sanitizedValue = value.slice(-1);
  
      if (sanitizedValue && !/^\d$/.test(sanitizedValue)) {
        return;
      }
      const newOtpValues = [...otpValues];
      newOtpValues[index] = sanitizedValue;
      setOtpValues(newOtpValues);
  
      if (sanitizedValue && index < 5) {
        const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    };
  
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text');
      const pastedNumbers = pastedData.replace(/\D/g, '').slice(0, 6).split('');
      
  
      const newOtpValues = [...otpValues];
      pastedNumbers.forEach((num, index) => {
        if (index < 6) newOtpValues[index] = num;
      });
      setOtpValues(newOtpValues);
  
      const nextEmptyIndex = newOtpValues.findIndex(value => !value);
      const targetIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      const nextInput = document.querySelector(`input[name="otp-${targetIndex}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    };
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const completeOtp = otpValues.join('');
      startTransition(async () => {
        try {
          const response = await sendOtpService({ otp: completeOtp })
          if (response.status === 200) {
            toast.success("OTP verified successfully")
            router.push(`/change-password?otp=${completeOtp}`)
          }
          else {
            toast.error("Something went wrong")
          }
        }
        catch (err: any) {
          if (err.status == 404 || err.status == 400) {
           alert("Invalid OTP ")
          }
          else toast.error("Something went wrong")
        }
      })
    };
  return (
    <div className="bg-[#ebdfd7] rounded-[30px]  pt-5 md:pt-0">
      <div className="grid md:grid-cols-2 gap-8 md:gap-3 lg:gap-0 items-center md:min-h-screen ">
        <div className="bg-white h-full rounded-[15px] md:rounded-[30px] m-5 md:m-0  ">
          <div className="flex flex-col justify-center h-full max-w-[465px] p-5 mx-auto ">
            <div className="mb-5 md:mb-10 text-center">
              <Image
                src={Logo}
                alt="animate"
                className="mx-auto max-w-[184px]"
              />
            </div>
            <h2 className="text-orange text-center font-aeonikBold text-2xl md:text-[30px] mb-5 md:mb-[72px] ">
            Enter OTP
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-5 md:mb-[50px] otp-inputs justify-center flex gap-[11px] items-center">
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    name={`otp-${index}`}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onPaste={handlePaste}
                    maxLength={1}
                    required
                    className="w-12 h-12 text-center bg-[#F4F5F7] border border-[#C4C4C4] rounded-full focus-visible:border-orange focus-visible:outline-none focus-visible:outline-1  "
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !value && index > 0) {
                        const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`) as HTMLInputElement;
                        if (prevInput) prevInput.focus();
                      }
                    }}
                  />
                ))}
              </div>
              <button type="submit" className="login-button  w-full">
                  Confirm
                  </button>
            </form>
          </div>
        </div>
        <LoginImage />
      </div>
    </div>
  );
};

