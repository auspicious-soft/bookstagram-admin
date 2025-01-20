import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "./components/ProgressBarProvider";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const AeonikBold = localFont({
  src: "../assets/fonts/AeonikProBold.otf",
  display: "swap",
  variable: "--font-AeoniK-Bold",
});
const AeonikRegular = localFont({
  src: "../assets/fonts/AeonikProRegular.otf",
  display: "swap",
  variable: "--font-AeoniK-Regular",
});
const AeonikLight = localFont({
  src: "../assets/fonts/AeonikProLight.otf",
  display: "swap",
  variable: "--font-AeoniK-Light",
});
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body
        className={`${AeonikBold.variable} ${AeonikRegular.variable} ${AeonikLight.variable} `}>

        <SessionProvider session={session}>
          <Providers>
            {children}
          <Toaster richColors />
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
    