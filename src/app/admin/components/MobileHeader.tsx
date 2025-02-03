"use client";
import { useState } from "react";
import { usePathname } from 'next/navigation'; 
import Link from "next/link";
import { AuthorsIcon, BookEventsIcon, BookHubIcon, BookLifeIcon, CategoryIcon, CollectionIcon, DashboardIcon, DiscountIcon, HamburgerIcon, NotificationsIcon, PromotionsIcon, PublishersIcon, StoriesIcon, SummaryIcon, UsersIcon } from "@/utils/svgicons";
import Image from "next/image";
import logo from '@/assets/images/logo.png';
import { signOut } from "@/auth";

const MobileHeader = () => {
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
            <li className={isActive('/admin/dashboard')}>
              <Link href="/admin/dashboard" onClick={() => handleLinkClick("/admin/dashboard")}>
                <DashboardIcon />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={isActive('/admin/book-hub')}>
              <Link href="/admin/book-hub" onClick={() => handleLinkClick("/admin/book-hub")}>
                <BookHubIcon />
                <span>Book Hub</span>
              </Link>
            </li>
            <li className={isActive('/admin/categories')}>
              <Link href="/admin/categories" onClick={() => handleLinkClick("/admin/categories")}>
                <CategoryIcon />
                <span>Categories</span>
              </Link>
            </li>
            <li className={isActive('/admin/collection')}>
              <Link href="/admin/collection" onClick={() => handleLinkClick("/admin/collection")}>
                <CollectionIcon />
                <span>Collection</span>
              </Link>
            </li>
            <li className={isActive('/admin/summary')}>
              <Link href="/admin/summary" onClick={() => handleLinkClick("/admin/summary")}>
                <SummaryIcon />
                <span>Summary</span>
              </Link>
            </li>
            <li className={isActive('/admin/discounts')}>
              <Link href="/admin/discounts" onClick={() => handleLinkClick("/admin/discounts")}>
                <DiscountIcon />
                <span>Discounts</span>
              </Link>
            </li>
            <li className={isActive('/admin/book-life')}>
              <Link href="/admin/book-life" onClick={() => handleLinkClick("/admin/book-life")}>
                <BookLifeIcon />
                <span>Book Life</span>
              </Link>
            </li>
            <li className={isActive('/admin/book-events')}>
              <Link href="/admin/book-events" onClick={() => handleLinkClick("/admin/book-events")}>
                <BookEventsIcon />
                <span>Book Events</span>
              </Link>
            </li>
            <li className={isActive('/admin/authors')}>
              <Link href="/admin/authors" onClick={() => handleLinkClick("/admin/authors")}>
                <AuthorsIcon />
                <span>Authors</span>
              </Link>
            </li>
            <li className={isActive('/admin/publishers')}>
              <Link href="/admin/publishers" onClick={() => handleLinkClick("/admin/publishers")}>
                <PublishersIcon />
                <span>Publishers</span>
              </Link>
            </li>
            <li className={isActive('/admin/stories')}>
              <Link href="/admin/stories" onClick={() => handleLinkClick("/admin/summary")}>
                <StoriesIcon />
                <span>Stories</span>
              </Link>
            </li>
            <li className={isActive('/admin/promotions')}>
              <Link href="/admin/promotions" onClick={() => handleLinkClick("/admin/promotions")}>
                <PromotionsIcon />
                <span>Promotions</span>
              </Link>
            </li>
            <li className={isActive('/admin/users')}>
              <Link href="/admin/users" onClick={() => handleLinkClick("/admin/users")}>
                <UsersIcon />
                <span>Users</span>
              </Link>
            </li>
            <li className={isActive('/admin/notifications')}>
              <Link href="/admin/notifications" onClick={() => handleLinkClick("/admin/notifications")}>
                <NotificationsIcon />
                <span>Notifications</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="">
          <ul className="navList">
            <li className="!m-0">
            <button onClick={() => signOut({ redirectTo: '/' })} 
              className="w-full bg-orange text-white py-2 px-4 rounded-[28px] text-sm">
               {/* <span className="text-[#283C63] text-[600]"> */}
                Log Out
                {/* </span> */}
            </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default MobileHeader;
