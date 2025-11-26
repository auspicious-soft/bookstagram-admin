"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import avatar from '@/assets/images/avatar.png';
import { usePathname, useSearchParams } from "next/navigation";
import { DropIcon } from "@/utils/svgicons";
import { signOut, useSession } from "next-auth/react";
import { getImageClientS3URL } from "@/utils/get-image-ClientS3URL";
import { getProfileImageUrl } from "@/utils/getImageUrl";



const HeaderPublisher: React.FC = () => {
  const [showData, setShowData] = useState(false);
  const pathname = usePathname(); 
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name");
  const [bookName, setBookName] = useState("");
  const {data} = useSession();  
  const publisher = (data as any)?.user; 
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBookName(localStorage.getItem("getbookName") || "");
    }
  }, [pathname]);
  

  const pageNames: { [key: string]: string } = {
    "/publisher/dashboard": "Dashboard",
    "/publisher/all-books": "All Books",
  };
  const getPageName = (path: string): string => {
    if (path.startsWith("/publisher/all-books/")) {
      return bookName;
    }
    return pageNames[path] || "Bookstagram";
  };
  const currentPageName = nameParam || getPageName(pathname);
  // const currentPageName = pageNames[pathname] || t("projects");

  return (
    <header className="flex justify-between items-center p-[15px] lg:px-[30px] lg:py-[23px] border-b border-[#D9CEC6] ">
     
      <div className="flex items-center justify-between w-full">
        <h1 className="text-[32px] text-darkBlack font-aeonikRegular tracking-[0.16px] capitalize">{currentPageName}</h1>  
        <div className="hidden lg:block relative">
          <div onClick={() => setShowData(!showData)}
          className="flex gap-2.5 items-center bg-white p-[5px] pr-5 rounded-[24px] cursor-pointer ">
          <Image
              src={getProfileImageUrl(publisher?.image)}
              unoptimized
              alt="Profile"
              width={38}
              height={38}
              className="rounded-full w-[38px] h-[38px]"
            />
            <div className="pr-1">
              <p className="text-darkBlack text-sm capitalize ">{publisher?.fullName}</p>
              <p className="text-[#A1A3A5] text-xs ">Publisher</p>
            </div>
            <DropIcon/>
          </div>
          {showData && (
           <div className=" absolute z-[2] top-[55px] right-0 w-full h-auto bg-white p-5 rounded-lg shadow-[0_4px_4px_0_rgba(0,0,0,0.08)]">
            <button  onClick={() => signOut({ redirectTo: '/' })} className="text-darkBlack w-full hover:underline text-left ">Log Out</button>
          </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderPublisher;
