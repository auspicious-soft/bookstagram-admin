"use client";
import { useState } from "react";
import { usePathname } from 'next/navigation';
import logo from '@/assets/images/logo.png';
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { BookEventsIcon, BookHubIcon, CategoryIcon, CollectionIcon, DashboardIcon, NewBookIcon, SideBarIcon } from "@/utils/svgicons";
import Image from "next/image";
// import { signOut } from "next-auth/react";

const SideNav = () => {
  // const router = useRouter();

  // const handleLogout = () => {
  //   localStorage.removeItem('authToken');
  //   router.push('https://blacktherapy.vercel.app/');
  // };

  const [isCollapsed, setIsCollapsed] = useState(false);


  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  const isActive = (path: string) => pathname === path ? 'active' : '';
  // const handleLogout = async () => {
  //    await signOut({ redirect: false })
  //   router.push('/login');
  // }
  return (
    <div className="relative h-full">
      <button onClick={toggleSidebar} className="hide-content absolute top-[30px] -right-2.5 z-10 ">
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
           {!isCollapsed && (
          <div className="mb-[60px] ">
           <Link href="/admin/new-book" className="flex gap-2.5 p-[7px] items-center bg-white text-darkBlack w-full rounded-[24px] text-sm ">
            <NewBookIcon/>Add a new book </Link> 
          </div>
           )}
        <ul className="navList">
          <li className={isActive('/admin/dashboard')}>
            <Link href="/admin/dashboard">
              <DashboardIcon />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </li>
          <li className={isActive('/admin/book-hub')}>
            <Link href="/admin/book-hub">
              <BookHubIcon />
              {!isCollapsed && <span>Book Hub</span>}
            </Link>
          </li>
          <li className={isActive('/admin/categories')}>
            <Link href="/admin/categories">
              <CategoryIcon />
               {!isCollapsed && <span>Categories</span>}               
            </Link>
          </li>
          <li className={isActive('/admin/collection')}>
            <Link href="/admin/collection">
              <CollectionIcon />
              {!isCollapsed &&  <span>Collection</span>}
            </Link>
          </li>
          <li className={isActive('/admin/book-events')}>
            <Link href="/admin/book-events">
              <BookEventsIcon />
              {!isCollapsed &&  <span>Book Events</span>}
            </Link>
          </li>
         
        </ul>
      </div>
    </div>
    </div>
  );
};

export default SideNav;
