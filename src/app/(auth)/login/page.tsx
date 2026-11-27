"use client"

import * as React from "react"
import { Suspense } from "react"
import Image from "next/image"
import { Eye, EyeOff, Lock, User, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/base/button"
import { Input } from "@/components/base/input"
import { Label } from "@/components/base/label"
import { Checkbox } from "@/components/base/checkbox"
import { Separator } from "@/components/base/separator"
import { GoogleIcon, LinkedInIcon } from "@/components/base/brand-icons"
import { GradientCard } from "@/components/shared/gradient-card"
import { ForgotPasswordModal } from "@/components/Modal"
import { authClient } from "@/lib/auth-client"
import { motion } from "framer-motion"

function LoginPageContent() {
   const router = useRouter()
   const searchParams = useSearchParams()
   const callbackUrl = searchParams.get("callbackUrl") || "/"
   const [showPassword, setShowPassword] = React.useState(false)
   const [isLoading, setIsLoading] = React.useState(false)
   const [error, setError] = React.useState<string | null>(null)

   const [formData, setFormData] = React.useState({
      username: "",
      password: "",
      remember: false,
   })

   // Forgot password modal state
   const [showForgotPw, setShowForgotPw] = React.useState(false)

   // Fitur OAuth / Social Login (sementara dinonaktifkan di tampilan hingga konfigurasi provider selesai)
   const showOAuth = false

   async function onSubmit(event: React.SyntheticEvent) {
      event.preventDefault()
      setIsLoading(true)
      setError(null)

      try {
         const { error } = await authClient.signIn.username({
            username: formData.username,
            password: formData.password,
         })

         if (error) {
            setError(error.message || "Username atau password salah")
            return
         }

         router.push(callbackUrl)
         router.refresh()
      } catch (err) {
         setError("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.")
         console.error(err)
      } finally {
         setIsLoading(false)
      }
   }

   const handleSocialSignIn = async (provider: "google" | "linkedin") => {
      setIsLoading(true)
      setError(null)
      try {
         const { error } = await authClient.signIn.social({
            provider,
            callbackURL: "/",
         })
         if (error) {
            setError(error.message || `Gagal masuk dengan ${provider}`)
         }
      } catch (err) {
         setError(`Terjadi kesalahan saat masuk dengan ${provider}`)
         console.error(err)
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <div className="relative flex w-full min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-8">
         <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="z-10 w-full max-w-md"
         >
            <GradientCard variant="primary" rounded="bottom" className="w-full shadow-none border-0">
               <div className="pt-8 pb-3 px-6 sm:px-8 text-center space-y-3">
                  <div className="flex justify-center items-center gap-3">
                     <Image
                        src="/unmul-small.png"
                        alt="UNMUL Logo"
                        width={48}
                        height={48}
                        className="h-11 w-11 object-contain"
                     />
                     <Image
                        src="/pendikom_logo.png"
                        alt="Pendikom Logo"
                        width={48}
                        height={48}
                        className="h-11 w-11 object-contain"
                     />
                  </div>
                  <div className="space-y-1">
                     <h1 className="text-xl font-heading font-extrabold tracking-tight text-foreground">
                        SIMTA Pendikom
                     </h1>
                  </div>
               </div>

               <div className="px-6 pb-6 sm:px-8 space-y-5">
                  <form onSubmit={onSubmit} className="space-y-4">
                     {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl font-medium animate-in fade-in slide-in-from-top-1">
                           {error}
                        </div>
                     )}

                     {/* Username input (Modal style: underline with subtle background) */}
                     <div className="space-y-1.5">
                        <Label htmlFor="username" className="text-xs font-semibold text-muted-foreground">
                           NIM atau NIP
                        </Label>
                        <div className="relative">
                           <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                           <Input
                              id="username"
                              placeholder="Masukkan NIM atau NIP Anda"
                              type="text"
                              autoCapitalize="none"
                              autoComplete="username"
                              autoCorrect="off"
                              disabled={isLoading}
                              className="pl-9 pr-3 h-10 rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted shadow-none focus-visible:ring-0 focus:ring-0 focus:border-primary focus-visible:border-primary transition-colors text-xs"
                              value={formData.username}
                              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                              required
                           />
                        </div>
                     </div>

                     {/* Password input (Modal style: underline with subtle background) */}
                     <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                           <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                              Password
                           </Label>
                           <button
                              type="button"
                              onClick={() => setShowForgotPw(true)}
                              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
                           >
                              Lupa password?
                           </button>
                        </div>
                        <div className="relative">
                           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                           <Input
                              id="password"
                              placeholder="••••••••"
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              disabled={isLoading}
                              className="pl-9 pr-9 h-10 rounded-none border-0 border-b border-border bg-muted/80 hover:bg-muted focus:bg-muted shadow-none focus-visible:ring-0 focus:ring-0 focus:border-primary focus-visible:border-primary transition-colors text-xs"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              required
                           />
                           <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-1"
                              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                           >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                        </div>
                     </div>

                     <div className="flex items-center space-x-2 pt-0.5">
                        <Checkbox
                           id="remember"
                           checked={formData.remember}
                           onCheckedChange={(checked) => setFormData({ ...formData, remember: !!checked })}
                           className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <label
                           htmlFor="remember"
                           className="text-xs font-medium leading-none text-muted-foreground cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                           Ingat saya
                        </label>
                     </div>

                     <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-10 text-xs font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-1"
                     >
                        {isLoading ? (
                           <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Sedang masuk...</span>
                           </div>
                        ) : (
                           "Masuk"
                        )}
                     </Button>
                  </form>

                  {showOAuth && (
                     <>
                        <div className="relative my-2">
                           <div className="absolute inset-0 flex items-center">
                              <Separator className="bg-border/60" />
                           </div>
                           <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                              <span className="bg-card px-2.5 text-muted-foreground">
                                 Atau lanjutkan dengan
                              </span>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pb-2">
                           <Button
                              type="button"
                              variant="outline"
                              className="h-10 text-xs font-semibold rounded-xl border-border/60 bg-muted/30 hover:bg-muted/70 hover:border-primary/30 transition-colors cursor-pointer"
                              disabled={isLoading}
                              onClick={() => handleSocialSignIn("google")}
                           >
                              <GoogleIcon className="mr-2 h-4 w-4" />
                              Google
                           </Button>
                           <Button
                              type="button"
                              variant="outline"
                              className="h-10 text-xs font-semibold rounded-xl border-border/60 bg-muted/30 hover:bg-muted/70 hover:border-primary/30 transition-colors cursor-pointer"
                              disabled={isLoading}
                              onClick={() => handleSocialSignIn("linkedin")}
                           >
                              <LinkedInIcon className="mr-2 h-4 w-4" />
                              LinkedIn
                           </Button>
                        </div>
                     </>
                  )}
               </div>
            </GradientCard>
         </motion.div>

         {/* Forgot Password Modal */}
         <ForgotPasswordModal open={showForgotPw} onOpenChange={setShowForgotPw} />

         {/* Footer text */}
         <p className="mt-8 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Simta Pendikom. Hak cipta dilindungi.
         </p>
      </div>
   )
}

export default function LoginPage() {
   return (
      <Suspense>
         <LoginPageContent />
      </Suspense>
   )
}