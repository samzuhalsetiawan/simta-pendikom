import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginFormSection } from "./_sections/login-form/login-form-section";


export default async function LoginPage() {
   const session = await getServerSession(authOptions);

   if (session?.user) {
      redirect("/");
   }

   return (
      <main className="min-h-screen flex items-center justify-center p-4 relative bg-gray-50 dark:bg-zinc-950/50">
         <LoginFormSection />
      </main>
   );
}
