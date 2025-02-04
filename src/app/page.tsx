"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import Logo from "@/assets/images/logo.png"; 
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { loginAction } from "@/actions";
import InputField from "./(auth)/components/InputField";
import LoginImage from "./(auth)/components/LoginImage";

export default function Page() {
  const { data: session } = useSession();
  const [username, serUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  useEffect(() => {
    if (session) {
      if ((session as any)?.user?.role === "publisher") {
        window.location.href = "/publisher/dashboard";
      } else {
        window.location.href = "/admin/dashboard";
      }
    }
  }, [router, session]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // const phoneRegex = /^\+45\s?\d{2}(\s?\d{2}){3}$/;
    const phoneRegex = /^\d{10}$/;
    let loginFieldType = '';
    if (emailRegex.test(username)) {
      loginFieldType = 'username';
    } else if (phoneRegex.test(username)) {
      loginFieldType = 'username';
    } else {
      toast.error('Please enter a valid email');
      return;
    }

    if (!password) {
      toast.error("Password is required.");
      return;
    }
    try {
      startTransition(async () => {
        const response = await loginAction({ [loginFieldType]: username, password });

        if (response?.success) {
          toast.success('Logged in successfully');
          if (response?.data?.user?.role === 'publisher') {
            window.location.href = '/publisher/dashboard';
          } else {
            window.location.href = '/admin/dashboard';
          }
        } else {
          toast.error( 'An error occurred during login.');
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong! Please try again.');
    }
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
            <h2 className="text-orange text-center font-aeonikBold text-2xl md:text-[30px] mb-5 md:mb-9 ">
              Welcome Back
            </h2>
            <div className="login rounded-[20px] bg-white">
              <div className="">
                <form onSubmit={handleSubmit}>
                  <InputField
                    type="text"
                    label="Email Address"
                    value={username}
                    placeholder="Email.."
                    onChange={(e) => serUsername(e.target.value)}
                  />
                  <InputField
                    type="password"
                    label="Your Password"
                    value={password}
                    placeholder="Your Password"
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <div className="justify-end mt-[-10px] mb-7 md:mb-[50px] flex items-center">
                    <Link
                      href="/forgot-password"
                      className="text-[#1657FF] md:text-[20px] font-aeonikBold  "
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <button type="submit" className="login-button  w-full">
                    {!isPending ? "Log In" : "Logging In"}
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
}
