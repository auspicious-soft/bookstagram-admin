"use client";
import { useState } from "react";
import { usePathname } from 'next/navigation';
import logo from '@/assets/images/logo.png';
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { AuthorsIcon, BookEventsIcon, BookHubIcon, BookLifeIcon, CategoryIcon, CollectionIcon, DashboardIcon, DiscountIcon, NewBookIcon, NotificationsIcon, PromotionsIcon, PublishersIcon, SideBarIcon, StoriesIcon, SummaryIcon, UsersIcon } from "@/utils/svgicons";
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
           <Link href="/admin/add-new" className="flex gap-2.5 p-[7px] items-center bg-white text-darkBlack w-full rounded-[24px] text-sm ">
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
          <li className={`${isActive('/admin/book-hub')} ${pathname.startsWith('/admin/book-hub') ? 'active' : ''}`}>
            <Link href="/admin/book-hub">
              <BookHubIcon />
              {!isCollapsed && <span>Book Hub</span>}
            </Link>
          </li>
          <li className={`${isActive('/admin/categories')} ${pathname.startsWith('/admin/categories') ? 'active' : ''}`}>
            <Link href="/admin/categories">
              <CategoryIcon />
               {!isCollapsed && <span>Categories</span>}               
            </Link>
          </li>
          <li className={`${isActive('/admin/collection')} ${pathname.startsWith('/admin/collection') ? 'active' : ''}`}>
            <Link href="/admin/collection">
              <CollectionIcon />
              {!isCollapsed &&  <span>Collection</span>}
            </Link>
          </li>
          <li className={`${isActive('/admin/summary')} ${pathname.startsWith('/admin/summary') ? 'active' : ''}`}>
            <Link href="/admin/summary">
              <SummaryIcon />
              {!isCollapsed &&  <span>Summary</span>}
            </Link>
          </li>
          <li className={isActive('/admin/discounts')}>
            <Link href="/admin/discounts">
              <DiscountIcon />
              {!isCollapsed &&  <span>Discounts</span>}
            </Link>
          </li>
          <li className={`${isActive('/admin/book-life')} ${pathname.startsWith('/admin/book-life') ? 'active' : ''}`}>
            <Link href="/admin/book-life">
              <BookLifeIcon />
              {!isCollapsed &&  <span>Book Life</span>}
            </Link>
          </li>
          <li className={`${isActive('/admin/book-events')} ${pathname.startsWith('/admin/book-events') ? 'active' : ''}`}>
            <Link href="/admin/book-events">
              <BookEventsIcon />
              {!isCollapsed &&  <span>Book Events</span>}
            </Link>
          </li>
          <li className={`${isActive('/admin/authors')} ${pathname.startsWith('/admin/authors') ? 'active' : ''}`}>
            <Link href="/admin/authors">
              <AuthorsIcon />
              {!isCollapsed &&  <span>Authors</span>}
            </Link>
          </li>
          <li className={`${isActive('/admin/publishers')} ${pathname.startsWith('/admin/publishers') ? 'active' : ''}`}>
            <Link href="/admin/publishers">
              <PublishersIcon />
              {!isCollapsed &&  <span>Publishers</span>}
            </Link>
          </li>
          <li className={isActive('/admin/stories')}>
            <Link href="/admin/stories">
              <StoriesIcon />
              {!isCollapsed &&  <span>Stories</span>}
            </Link>
          </li>
          <li className={isActive('/admin/promotions')}>
            <Link href="/admin/promotions">
              <PromotionsIcon />
              {!isCollapsed &&  <span>Promotions</span>}
            </Link>
          </li>
          <li className={`${isActive('/admin/users')} ${pathname.startsWith('/admin/users') ? 'active' : ''}`}>
            <Link href="/admin/users">
              <UsersIcon />
              {!isCollapsed &&  <span>Users</span>}
            </Link>
          </li>
          <li className={isActive('/admin/notifications')}>
            <Link href="/admin/notifications">
              <NotificationsIcon />
              {!isCollapsed &&  <span>Notifications</span>}
            </Link>
          </li>
        </ul>
      </div>
    </div>
    </div>
  );
};

export default SideNav;
