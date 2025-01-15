"use client";
import { useState } from "react";
import { usePathname } from 'next/navigation'; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardIcon } from "@/utils/svgicons";

const MobileHeader = () => {
  const router = useRouter();
  const pathname = usePathname(); 
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('https://blacktherapy.vercel.app/');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path: string) => pathname === path ? 'active' : '';

  const handleLinkClick = (path: string) => {
    setIsCollapsed(false); // Collapse sidebar after clicking a link
  };

  return ( 
    <>
      <div className="header min-h-[46px] justify-between gap-[10px] py-[10px] px-[15px] bg-white">
        <div className="logoContainer">
          <Link href="/admin/dashboard" onClick={() => handleLinkClick("/")}>
            Logo
          </Link>
        </div>
        <button onClick={toggleSidebar} className="hamburgerButton">
        |||
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
            <Link href="/">
            {/* <LogOut /> */}
               <span className="text-[#283C63] text-[600]">Log Out</span>
            </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default MobileHeader;
