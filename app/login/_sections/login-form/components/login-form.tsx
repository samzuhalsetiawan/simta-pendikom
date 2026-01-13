"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User } from "next-auth"
import { useFormState } from "../providers/form-state-hook"

type UserRole = User["role"]

export function LoginForm() {
   const router = useRouter()
   const [role, setRole] = useState<UserRole>("student")
   const [idNumber, setIdNumber] = useState("")
   const [password, setPassword] = useState("")
   const { isLoading, setIsLoading } = useFormState();
   const [error, setError] = useState("")

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      setIsLoading(true)

      try {
         const result = await signIn("credentials", {
            role,
            idNumber,
            password,
            redirect: false,
         })

         if (result?.error) {
            setError("NIM/NIP atau password salah")
            setIsLoading(false)
         } else if (result?.ok) {
            router.replace("/")
            router.refresh()
         }
      } catch (err) {
         console.error("Login error:", err)
         setError("Terjadi kesalahan saat login")
         setIsLoading(false)
      }
   }

   return (
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
               onValueChange={(value: UserRole) => setRole(value)}
               disabled={isLoading}
            >
               <SelectTrigger id="role">
                  <SelectValue placeholder="Pilih role" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value={"student" satisfies UserRole}>Mahasiswa</SelectItem>
                  <SelectItem value={"lecturer" satisfies UserRole}>Dosen</SelectItem>
               </SelectContent>
            </Select>
         </div>

         <div className="space-y-2">
            <Label htmlFor="idNumber">
               {role === "student" ? "NIM" : "NIP"}
            </Label>
            <Input
               id="idNumber"
               type="text"
               placeholder={role === "student" ? "Masukkan NIM" : "Masukkan NIP"}
               value={idNumber}
               onChange={(e) => setIdNumber(e.target.value)}
               required
               disabled={isLoading}
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
               disabled={isLoading}
            />
         </div>

         <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : "Login"}
         </Button>
      </form>
   )
}
