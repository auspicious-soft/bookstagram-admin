"use client";
import { useState } from "react";
import { usePathname } from 'next/navigation'; 
import Link from "next/link";
import { AuthorsIcon, BookEventsIcon, BookHubIcon, BookLifeIcon, CategoryIcon, CollectionIcon, DashboardIcon, DiscountIcon, HamburgerIcon, NotificationsIcon, PromotionsIcon, PublishersIcon, StoriesIcon, SummaryIcon, UsersIcon } from "@/utils/svgicons";
import Image from "next/image";
import logo from '@/assets/images/logo.png';
import { signOut } from "@/auth";

const MobileHeaderPublisher = () => {
  const pathname = usePathname(); 
  const [isCollapsed, setIsCollapsed] = useState(false);


  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path: string) => pathname === path ? 'active' : '';

  const handleLinkClick = (path: string) => {
    setIsCollapsed(false);
  };

  return ( 
    <>
      <div className="header flex justify-between gap-[10px] py-3 p-5 bg-darkBlack">
        <div className="logoContainer">
          <Link href="/admin/dashboard" onClick={() => handleLinkClick("/")}>
           <Image src={logo} alt="logo" width={150} height={30} />
          </Link>
        </div>
        <button onClick={toggleSidebar} className="hamburgerButton">
       <HamburgerIcon/>
      </button>
      </div>

      <div className={`sideNav ${isCollapsed ? 'collapsed' : ''} h-[100%] overflo-custom`}>
        <div className="">
          <ul className="navList">
            <li className={isActive('/publisher/dashboard')}>
              <Link href="/publisher/dashboard" onClick={() => handleLinkClick("/publisher/dashboard")}>
                <DashboardIcon />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={isActive('/publisher/all-books')}>
              <Link href="/publisher/all-books" onClick={() => handleLinkClick("/publisher/all-books")}>
                <BookHubIcon />
                <span>Book Hub</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="">
          <ul className="navList">
            <li className="!m-0">
            <button onClick={() => signOut({ redirectTo: '/' })} 
              className="w-full bg-orange text-white py-2 px-4 rounded-[28px] text-sm"> 
                Log Out 
            </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default MobileHeaderPublisher;
