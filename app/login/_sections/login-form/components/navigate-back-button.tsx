"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter } from "next/navigation"
import { useFormState } from "../providers/form-state-hook"

export function NavigateBackButton() {

   const router = useRouter();
   const { isLoading } = useFormState();

   const handleBack = () => {
      router.back()
   }

   return (
      <Button
         variant="ghost"
         size="icon"
         onClick={handleBack}
         className="h-9 w-9"
         disabled={isLoading}
      >
         <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
         <span className="sr-only">Back to home</span>
      </Button>
   )
}