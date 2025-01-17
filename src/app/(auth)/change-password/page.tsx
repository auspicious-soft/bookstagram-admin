"use client";

import React, { Suspense, useEffect, useState, useTransition } from "react";
import Link from "next/link"; 
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { loginAction } from "@/actions";
import Logo from "@/assets/images/logo.png";
import InputField from "../components/InputField";
import LoginImage from "../components/LoginImage";
import { resetUserPassword } from "@/services/admin-services";

export default function Page() { 
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
  
    useEffect(() => {
      const otp = searchParams.get('otp');
      if (!otp) {
        router.push('/forgot-password');
        toast.error('Please complete the forgot password process first');
      }
    }, [router, searchParams]);
  
    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
      const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;
      const otp = searchParams.get('otp');
      
      if (newPassword === confirmPassword) {
        startTransition(async () => {
          try {
            const response = await resetUserPassword({ password: newPassword as string, otp: otp as string });
            if (response.status === 200) {
              toast.success("Password Updated successfully");
              router.push('/');
            } else {
              toast.error("Something went wrong");
            }
          } catch (error: any) {
            if (error.status === 404) {
              toast.error("Invalid OTP");
            } else {
              toast.error("new-password-otp-verified");
            }
          }
        });
      } else {
        toast.warning("Password must match");
      }
    };
  
  
  return (
     <Suspense fallback={<div>Loading...</div>}>
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
            <h2 className="text-orange text-center font-aeonikBold text-2xl md:text-[30px] mb-5 md:mb-9 ">
            Change Password
            </h2>
            <div className="login rounded-[20px] bg-white">
              <div className="">
                <form onSubmit={handleSubmit}>
                  <InputField
                    type="password"
                    label="Enter New Password"
                    name="newPassword" 
                    id="newPassword"
                    placeholder="******" 
                  />
                  <InputField
                    type="password"
                    label="Confirm Password"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Your Password" 
                  />
                   {/* <button type="submit" className="login-button  w-full">
                   Change Password
                  </button> */}
                  <button type="submit" disabled={isPending} className="login-button  w-full">
                  {!isPending ? "Change Password" : "Changing"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <LoginImage />
      </div>
    </div>
    </Suspense>
  );
};

