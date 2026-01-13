import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigateBackButton } from "./components/navigate-back-button";
import { ThemeToggleButton } from "@/components/common/button/theme-toggle-button";
import Image from "next/image";
import { LoginForm } from "./components/login-form";
import { FormStateProvider } from "./providers/form-state-provider";

export function LoginFormSection() {
   return (
      <section>
         <FormStateProvider>
            <Card className="w-full max-w-md">
            <CardHeader className="space-y-4">
               <div className="flex items-center justify-between">
                  <NavigateBackButton />
                  <ThemeToggleButton />
               </div>

               <div className="flex flex-col items-center space-y-4">
                  <Image
                     src="/unmul-small.png"
                     alt="Universitas Mulawarman Logo"
                     width={80}
                     height={80}
                     className="object-contain"
                  />
                  <div className="text-center space-y-1">
                     <CardTitle>Login</CardTitle>
                     <CardDescription>
                        Masuk ke sistem sebagai mahasiswa atau dosen
                     </CardDescription>
                  </div>
               </div>
            </CardHeader>
            <CardContent>
               <LoginForm />
            </CardContent>
         </Card>
         </FormStateProvider>
      </section>
   )
}