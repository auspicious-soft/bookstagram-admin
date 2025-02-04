import localFont from "next/font/local";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import SideBarPublisher from "./components/SideBarPublisher";
import HeaderPublisher from "./components/HeaderPublisher";
import MobileHeaderPublisher from "./components/MobileHeaderPublisher";
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

  // const session = await auth()
  // if (!session) {
  //   redirect('/')
  // }
  // else if ((session as any)?.user?.role === 'publisher') {
    return (
      <html lang="en">
         <body className={`${AeonikBold.variable} ${AeonikRegular.variable} ${AeonikLight.variable} `}>
         <div className="flex h-screen flex-col lg:flex-row lg:overflow-hidden">
          <div className="flex-none hidden h-screen lg:block ">
            <SideBarPublisher />
          </div>
          <div className="w-full lg:hidden">
            <MobileHeaderPublisher />
          </div>
          
          <div className="flex-grow md:overflow-y-auto">
            <HeaderPublisher />
            <div className="p-4 lg:h-[calc(100vh-96px)] overflow-y-auto overflo-custom  lg:pb-9 lg:pt-6 lg:px-[30px]">
            {children}
            </div>
          </div>
        </div>
        </body>
      </html>
    );
  }
//   else {
//     return (
//       <div className="p-3 bg-black h-screen text-white">
//       You are not authorized to view this page go to login -<Link href={'/login'} className="p-3 text-black bg-white">
//           Login
//         </Link>
//     </div>
//     )
//   }
// }
