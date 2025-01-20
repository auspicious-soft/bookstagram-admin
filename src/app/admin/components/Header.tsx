"use client";
import React, { useState } from "react";
import Image from "next/image";
import avatar from '@/assets/images/avatar.png';
import { usePathname } from "next/navigation";
import { DropIcon } from "@/utils/svgicons";
import { signOut } from "next-auth/react";



const Header: React.FC = () => {
  const [showData, setShowData] = useState(false);
  const pathname = usePathname(); 
  const pageNames: { [key: string]: string } = {
    "/admin/dashboard": "dashboard",
    "/admin/book-hub": "Book Hub",
    "/admin/categories": "Sub-Categories",
    "/admin/collection": "Collection",  
    "/admin/summary": "Summary",
    "/admin/discounts": "Discounts",
    "/admin/book-life": "Book Life",
    "/admin/book-events":  "Book Events",
    "/admin/book-events/add":  "Add New Event",
    "/admin/authors": "Authors",
    "/admin/publishers": "Publishers",
    "/admin/stories": "Stories",
    "/admin/promotions": "Promotions",
    "/admin/users": "Users",
    "/admin/notifications": "Notifications"
    // `/admin/book-events/${id}`:  `${id}`,
    
  };
  const getPageName = (path: string): string => {
    if (path.startsWith("/admin/book-hub/profile/")) {
      return "Single Book";
    }
    if (path.startsWith("/admin/users/profile/")) {
      return "Single User";
    }
    return pageNames[path] || "Bookstagram";
  };
  const currentPageName = getPageName(pathname);
  // const currentPageName = pageNames[pathname] || t("projects");

  return (
    <header className="flex justify-between items-center p-[15px] lg:px-[30px] lg:py-[23px] border-b border-[#D9CEC6] ">
     
      <div className="flex items-center justify-between w-full">
        <h1 className="text-[32px] text-darkBlack font-aeonikRegular tracking-[0.16px] capitalize">{currentPageName}</h1>  
        <div className="hidden lg:block relative">
          <div onClick={() => setShowData(!showData)}
          className="flex gap-2.5 items-center bg-white p-[5px] pr-5 rounded-[24px] cursor-pointer ">
          <Image
              src={avatar}
              alt="User Profile"
              width={38}
              height={38}
              className="rounded-full w-[38px] h-[38px]"
            />
            <div className="pr-1">
              <p className="text-darkBlack text-sm  ">Alex meian</p>
              <p className="text-[#A1A3A5] text-xs ">Administrator</p>
            </div>
            <DropIcon/>
          </div>
          {showData && (
           <div className=" absolute z-[2] top-[55px] right-0 w-full h-auto bg-white p-5 rounded-lg shadow-[0_4px_4px_0_rgba(0,0,0,0.08)]">
            <button onClick={() => signOut({ redirectTo: '/' })} className="text-darkBlack w-full hover:underline text-left ">Log Out</button>
          </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
