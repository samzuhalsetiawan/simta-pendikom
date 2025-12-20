"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggleButton } from "@/components/main-navbar/theme-toggle-button"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

type UserRole = "mahasiswa" | "dosen"

export function LoginForm() {
   const router = useRouter()
   const [role, setRole] = useState<UserRole>("mahasiswa")
   const [idNumber, setIdNumber] = useState("")
   const [password, setPassword] = useState("")
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState("")

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      setLoading(true)

      try {
         const result = await signIn("credentials", {
            role,
            idNumber,
            password,
            redirect: false,
         })

         if (result?.error) {
            setError("NIM/NIP atau password salah")
            setLoading(false)
         } else if (result?.ok) {
            router.push("/")
            router.refresh()
         }
      } catch (err) {
         console.error("Login error:", err)
         setError("Terjadi kesalahan saat login")
         setLoading(false)
      }
   }

   const handleBack = () => {
      router.back()
   }

   return (
      <Card className="w-full max-w-md">
         <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-9 w-9"
                  disabled={loading}
               >
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
                  <span className="sr-only">Back to home</span>
               </Button>
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
            <form onSubmit={handleSubmit} className="space-y-4">
               {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                     {error}
                  </div>
               )}

               <div className="space-y-2">
                  <Label htmlFor="role">Login sebagai</Label>
                  <Select
                     value={role}
                     onValueChange={(value) => setRole(value as UserRole)}
                     disabled={loading}
                  >
                     <SelectTrigger id="role">
                        <SelectValue placeholder="Pilih role" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                        <SelectItem value="dosen">Dosen</SelectItem>
                     </SelectContent>
                  </Select>
               </div>

               <div className="space-y-2">
                  <Label htmlFor="idNumber">
                     {role === "mahasiswa" ? "NIM" : "NIP"}
                  </Label>
                  <Input
                     id="idNumber"
                     type="text"
                     placeholder={role === "mahasiswa" ? "Masukkan NIM" : "Masukkan NIP"}
                     value={idNumber}
                     onChange={(e) => setIdNumber(e.target.value)}
                     required
                     disabled={loading}
                  />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                     id="password"
                     type="password"
                     placeholder="Masukkan password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     disabled={loading}
                  />
               </div>

               <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loading..." : "Login"}
               </Button>
            </form>
         </CardContent>
      </Card>
   )
}
