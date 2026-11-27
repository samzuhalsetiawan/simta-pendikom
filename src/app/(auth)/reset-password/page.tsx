"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/base/button"
import Image from "next/image"
import { GradientCard } from "@/components/shared/gradient-card"
import { Input } from "@/components/base/input"
import { Label } from "@/components/base/label"
import { authClient } from "@/lib/auth-client"
import { motion } from "framer-motion"

function ResetPasswordForm() {
   const router = useRouter()
   const searchParams = useSearchParams()
   const token = searchParams.get("token") || ""

   const [newPassword, setNewPassword] = React.useState("")
   const [confirmPassword, setConfirmPassword] = React.useState("")
   const [showPassword, setShowPassword] = React.useState(false)
   const [isLoading, setIsLoading] = React.useState(false)
   const [error, setError] = React.useState<string | null>(null)
   const [success, setSuccess] = React.useState(false)

   const handleReset = async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      if (newPassword.length < 8) {
         return setError("Password minimal 8 karakter.")
      }
      if (newPassword !== confirmPassword) {
         return setError("Password dan konfirmasi tidak cocok.")
      }
      if (!token) {
         return setError("Token reset tidak valid. Silakan minta link reset baru.")
      }

      setIsLoading(true)
      try {
         const { error } = await authClient.resetPassword({
            newPassword,
            token,
         })
         if (error) {
            setError(error.message || "Gagal mereset password.")
         } else {
            setSuccess(true)
         }
      } catch {
         setError("Terjadi kesalahan.")
      }
      setIsLoading(false)
   }

   if (success) {
      return (
         <div className="relative flex w-full min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-8">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="z-10 w-full max-w-md"
            >
               <GradientCard variant="lulus" rounded="bottom" className="w-full shadow-none border-0">
                  <div className="p-8 text-center space-y-4">
                     <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                     </div>
                     <h2 className="text-xl font-heading font-extrabold text-foreground">Password Berhasil Direset!</h2>
                     <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Password Anda telah berhasil diperbarui. Silakan login kembali dengan password baru.
                     </p>
                     <Button 
                        onClick={() => router.push("/login")}
                        className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                     >
                        Kembali ke Login
                     </Button>
                  </div>
               </GradientCard>
            </motion.div>
         </div>
      )
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
                        Reset Password
                     </h1>
                     <p className="text-xs text-muted-foreground leading-relaxed">
                        Masukkan password baru untuk akun Anda
                     </p>
                  </div>
               </div>

               <div className="px-6 pb-6 sm:px-8 space-y-5">
                  <form onSubmit={handleReset} className="space-y-4">
                     {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl font-medium animate-in fade-in slide-in-from-top-1">
                           {error}
                        </div>
                     )}

                     <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Password Baru</Label>
                        <div className="relative">
                           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                           <Input
                              type={showPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Minimal 8 karakter"
                              className="pl-10 pr-10 h-11 rounded-xl"
                              required
                           />
                           <button type="button" onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Konfirmasi Password</Label>
                        <div className="relative">
                           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                           <Input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Masukkan ulang password"
                              className="pl-10 h-11 rounded-xl"
                              required
                           />
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                           <p className="text-xs text-destructive">Password tidak cocok.</p>
                        )}
                     </div>

                     <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                     >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
                     </Button>
                  </form>
               </div>
            </GradientCard>
         </motion.div>
      </div>
   )
}

export default function ResetPasswordPage() {
   return (
      <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
         <ResetPasswordForm />
      </React.Suspense>
   )
}
