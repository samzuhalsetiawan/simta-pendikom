import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

async function getSystemStatus() {
   // Simulating a fetch for system announcement or status
   await new Promise(resolve => setTimeout(resolve, 800));
   return { online: true, message: "Sistem Informasi Manajemen Tugas Akhir Online" };
}

async function StatusBanner({ promise }: { promise: Promise<{ online: boolean, message: string }> }) {
   const status = await promise;
   return (
      <div className="absolute top-4 left-0 right-0 flex justify-center fade-in slide-in-from-top-4 duration-500">
         <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.online ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
            ● {status.message}
         </span>
      </div>
   );
}

export default async function LoginPage() {
   const session = await getServerSession(authOptions);

   switch (session?.user?.role) {
      case "student":
         redirect("/dashboard/student")
         break;
      case "lecturer":
         redirect("/dashboard/lecturer")
         break;
      default:
         break;
   }

   const statusPromise = getSystemStatus();

   return (
      <div className="min-h-screen flex items-center justify-center p-4 relative bg-gray-50 dark:bg-zinc-950/50">
         <Suspense fallback={<div className="absolute top-4 h-6 w-48 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse" />}>
            <StatusBanner promise={statusPromise} />
         </Suspense>

         <Suspense fallback={
            <div className="w-full max-w-md h-[400px] bg-white dark:bg-zinc-900 rounded-xl border shadow-sm animate-pulse" />
         }>
            <LoginForm />
         </Suspense>
      </div>
   );
}
