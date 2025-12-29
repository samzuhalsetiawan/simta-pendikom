import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer";

export default async function LayoutWithNavbar({
   children
}: Readonly<{
   children: React.ReactNode
}>) {
   return (
      <>
         <Navbar />
         {children}
         <Footer />
      </>
   )
}