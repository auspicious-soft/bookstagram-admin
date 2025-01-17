
// import { redirect } from "next/navigation";
// import Link from "next/link";
import SideNav from "./components/SideNav";
import MobileHeader from "./components/MobileHeader";
import Header from "./components/Header";
import localFont from "next/font/local";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
// import { auth } from "@/auth";

const AeonikBold = localFont({
  src: "../../assets/fonts/AeonikProBold.otf",
  display: "swap",
  variable: "--font-AeoniK-Bold",
});
const AeonikRegular = localFont({
  src: "../../assets/fonts/AeonikProRegular.otf",
  display: "swap",
  variable: "--font-AeoniK-Regular",
});
const AeonikLight = localFont({
  src: "../../assets/fonts/AeonikProLight.otf",
  display: "swap",
  variable: "--font-AeoniK-Light",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth(); 

  if (!session) {
    redirect("/");
  }

  const userRole = (session as any)?.user?.role;
  const restrictedRoles = ['user']; 
  
  // Check if user has restricted role
  if (restrictedRoles.includes(userRole)) 
    {
    return (
      <html lang="en">
        <body>
          <div className="p-3 bg-black min-h-screen text-white">
            <span>You are not authorized to view this page click{" "}</span>
            <Link href="/" className="p-3 text-black bg-white">
              Login
            </Link>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${AeonikBold.variable} ${AeonikRegular.variable} ${AeonikLight.variable} `}>
        <div className="flex h-screen flex-col lg:flex-row lg:overflow-hidden">
          <div className="flex-none hidden h-screen lg:block ">
            <SideNav />
          </div>
          <div className="w-full lg:hidden">
            <MobileHeader />
          </div>
          
          <div className="flex-grow md:overflow-y-auto">
            <Header />
            <div className="p-4 lg:h-[calc(100vh-96px)] overflow-y-auto overflo-custom  lg:pb-9 lg:pt-6 lg:px-[30px]">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
