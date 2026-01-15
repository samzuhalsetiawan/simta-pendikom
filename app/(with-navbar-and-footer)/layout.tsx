import { Navbar } from "@/components/common/navbar/navbar";
import { Footer } from "@/components/common/footer/footer";

export default async function Layout({
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