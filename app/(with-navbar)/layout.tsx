"use server"

import { MainNavbar } from "@/components/main-navbar/main-navbar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";


export default async function LayoutWithNavbar({ 
   children
}: Readonly<{ 
   children: React.ReactNode 
}>) {
     const session = await getServerSession(authOptions);
   
   return (
      <>
         <MainNavbar user={session?.user} />
         {children}
      </>
   )
}