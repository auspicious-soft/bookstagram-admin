"use client";
import { useState } from "react";
import { usePathname } from 'next/navigation'; 
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { DashboardIcon, HamburgerIcon } from "@/utils/svgicons";
import Image from "next/image";
import logo from '@/assets/images/logo.png';

const MobileHeader = () => {
  // const router = useRouter();
  const pathname = usePathname(); 
  const [isCollapsed, setIsCollapsed] = useState(false);

  // const handleLogout = () => {
    // localStorage.removeItem('authToken');
    // router.push('https://blacktherapy.vercel.app/');
  // };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path: string) => pathname === path ? 'active' : '';

  const handleLinkClick = (path: string) => {
    setIsCollapsed(false); // Collapse sidebar after clicking a link
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
              <Link href="/admin/dashboard" onClick={() => handleLinkClick("/")}>
                <DashboardIcon />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={isActive('/admin/assignments')}>
              <Link href="/admin/assignments" onClick={() => handleLinkClick("/admin/assignments")}>
                <DashboardIcon />
                <span>Assignments</span>
              </Link>
            </li>
            <li className={isActive('/admin/clinician')}>
              <Link href="/admin/clinician" onClick={() => handleLinkClick("/admin/clinician")}>
                <DashboardIcon />
                <span>Clinician</span>
              </Link>
            </li>
           
          </ul>
        </div>

        <div className="">
          <ul className="navList">
            <li className="!m-0">
            {/* <button onClick={() => signOut({ redirectTo: '/' })}>
           
               <span className="text-[#283C63] text-[600]">Log Out</span>
            </button> */}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default MobileHeader;
