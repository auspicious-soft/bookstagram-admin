"use client";

import React, { useState, useTransition } from "react";  
import Image from "next/image";
import Logo from "@/assets/images/logo.png";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import InputField from "../components/InputField";
import LoginImage from "../components/LoginImage";
import { forgotPasswordService } from "@/services/admin-services";

export default function Page() { 
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [isPending, startTransition] = useTransition()

  const handleChange = (e: any) => {
    setUsername(e.target.value)
  }
  const handleSubmit = (e: any) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const response = await forgotPasswordService({ username })
        if (response?.status === 200) {
          toast.success("OTP send successfully")
          router.push('/otp')
        }
        else {
          toast.error("Something went wrong")
        }
      }
    catch (err: any) {
        if (err.status == 404) toast.error('Username not found')
        else toast.error("Something went wrong")
      }
    })
  }
  
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
            <h2 className="text-orange text-center font-aeonikBold text-2xl md:text-[30px] mb-5 md:mb-9 ">
            Forgot Password?
            </h2>
            <div className="login rounded-[20px] bg-white">
              <div className="">
                <form>
                  <InputField
                    type="text"
                    label="Email Address"
                    value={username}
                    placeholder="loewmipsaume@dummymail.com"
                    onChange={handleChange}
                  />
   
                  <button disabled={isPending} onClick={handleSubmit} className="login-button  w-full">
                  Confirm
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <LoginImage />
      </div>
    </div>
  );
};

