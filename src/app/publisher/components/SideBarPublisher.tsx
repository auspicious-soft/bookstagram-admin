"use client";
import { useState } from "react";
import { usePathname } from 'next/navigation';
import logo from '@/assets/images/logo.png';
import Link from "next/link";
import { ALlBookIcon, AuthorsIcon, BookEventsIcon, BookHubIcon, BookLifeIcon, CategoryIcon, CollectionIcon, DashboardIcon, DiscountIcon, NewBookIcon, NotificationsIcon, PromotionsIcon, PublishersIcon, SideBarIcon, StoriesIcon, SummaryIcon, UsersIcon } from "@/utils/svgicons";
import Image from "next/image";

const SideBarPublisher = () => {

  const [isCollapsed, setIsCollapsed] = useState(false);


  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  const isActive = (path: string) => pathname === path ? 'active' : ''; 
  return (
    <div className="relative h-full">
      <button onClick={toggleSidebar} className="hide-content absolute top-[30px] right-[-15px] z-10 ">
        <SideBarIcon/>
      </button>
    <div className={`sideNav ${isCollapsed ? 'collapsed' : ''} h-[100%] overflo-custom relative`}>
      <div className="">
          {!isCollapsed && (
        <div className="mb-[71px] ">
              <Link href="/admin/dashboard">
                <Image src={logo} alt="logo" width={185} height={35} className="mx-auto" />
              </Link>
            </div> 
          )}
        <ul className="navList">
          <li className={isActive('/publisher/dashboard')}>
            <Link href="/publisher/dashboard">
              <DashboardIcon />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </li>
          <li className={`${isActive('/publisher/all-books')}`}>
            <Link href="/publisher/all-books">
              <ALlBookIcon />
              {!isCollapsed && <span>All Books</span>}
            </Link>
          </li>
         
        </ul>
      </div>
    </div>
    </div>
  );
}

export default SideBarPublisher;
