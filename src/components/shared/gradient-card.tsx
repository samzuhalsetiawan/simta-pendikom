import { ReactNode } from "react"
import { Card } from "@/components/base/card"
import { cn } from "@/lib/utils/utils"
import { cva, type VariantProps } from "class-variance-authority"

export type GradientCardVariant =
   | "lulus"
   | "pengajuan-proposal"
   | "seminar-proposal"
   | "konsultasi"
   | "penelitian"
   | "seminar-hasil"
   | "sidang-skripsi"
   | "destructive"
   | "primary"

const gradientCardWrapperVariants = cva(
   "bg-gradient-to-b from-transparent flex flex-col",
   {
      variants: {
         variant: {
            lulus: "to-emerald-500 theme-lulus",
            "pengajuan-proposal": "to-pengajuan-proposal theme-pengajuan-proposal",
            "seminar-proposal": "to-seminar-proposal theme-seminar-proposal",
            konsultasi: "to-konsultasi theme-konsultasi",
            penelitian: "to-penelitian theme-penelitian",
            "seminar-hasil": "to-seminar-hasil theme-seminar-hasil",
            "sidang-skripsi": "to-sidang-skripsi theme-sidang-skripsi",
            destructive: "to-rose-500 theme-destructive",
            primary: "to-primary",
         },
         rounded: {
            none: "rounded-none p-0",
            bottom: "rounded-t-none rounded-b-2xl px-[1px] pb-[1px]",
            all: "rounded-2xl p-[1px]",
         },
      },
      defaultVariants: {
         variant: "lulus",
         rounded: "bottom",
      },
   }
)

const gradientCardInnerVariants = cva(
   "w-full border-0 ring-0 bg-gradient-to-b from-transparent from-15% overflow-hidden p-0 gap-0",
   {
      variants: {
         variant: {
            lulus: "to-emerald-500/10",
            "pengajuan-proposal": "to-pengajuan-proposal/10",
            "seminar-proposal": "to-seminar-proposal/10",
            konsultasi: "to-konsultasi/10",
            penelitian: "to-penelitian/10",
            "seminar-hasil": "to-seminar-hasil/10",
            "sidang-skripsi": "to-sidang-skripsi/10",
            destructive: "to-rose-500/10",
            primary: "to-primary/10",
         },
         rounded: {
            none: "rounded-none",
            bottom: "rounded-t-none rounded-b-2xl",
            all: "rounded-2xl",
         },
      },
      defaultVariants: {
         variant: "lulus",
         rounded: "bottom",
      },
   }
)

export interface GradientCardProps
   extends React.HTMLAttributes<HTMLDivElement>,
      VariantProps<typeof gradientCardWrapperVariants> {
   children: ReactNode
}

export function GradientCard({ children, className, variant, rounded = "bottom", ...props }: GradientCardProps) {
   const roundedClass = rounded === "none" ? "rounded-none" : rounded === "all" ? "rounded-2xl" : "rounded-t-none rounded-b-2xl"
   const wrapperRoundedClass = rounded === "all" ? "rounded-2xl" : "rounded-t-none"
   return (
      <div className={cn(gradientCardWrapperVariants({ variant, rounded }), wrapperRoundedClass, className)} {...props}>
         <div className={cn("w-full flex-1 flex flex-col bg-background", roundedClass)}>
            <Card className={cn(gradientCardInnerVariants({ variant, rounded }), "flex-1 flex flex-col", roundedClass)}>
               {children}
            </Card>
         </div>
      </div>
   )
}

const gradientCardHeaderVariants = cva(
   "border-b rounded-t-none bg-gradient-to-r from-transparent from-50% p-5 flex flex-row items-center justify-between",
   {
      variants: {
         variant: {
            lulus: "border-emerald-500/15 to-emerald-500/15",
            "pengajuan-proposal": "border-pengajuan-proposal/15 to-pengajuan-proposal/15",
            "seminar-proposal": "border-seminar-proposal/15 to-seminar-proposal/15",
            konsultasi: "border-konsultasi/15 to-konsultasi/15",
            penelitian: "border-penelitian/15 to-penelitian/15",
            "seminar-hasil": "border-seminar-hasil/15 to-seminar-hasil/15",
            "sidang-skripsi": "border-sidang-skripsi/15 to-sidang-skripsi/15",
            destructive: "border-rose-500/15 to-rose-500/15",
            primary: "border-primary/15 to-primary/15",
         },
         rounded: {
            none: "border-b rounded-t-none",
            top: "border-b rounded-t-none",
         },
      },
      defaultVariants: {
         variant: "lulus",
         rounded: "none",
      },
   }
)

export interface GradientCardHeaderProps
   extends React.HTMLAttributes<HTMLDivElement>,
      VariantProps<typeof gradientCardHeaderVariants> {}

export function GradientCardHeader({ className, variant, rounded = "none", ...props }: GradientCardHeaderProps) {
   return <div className={cn(gradientCardHeaderVariants({ variant, rounded }), "rounded-t-none", className)} {...props} />
}

export function GradientCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
   return <h3 className={cn("text-base font-heading font-bold text-foreground", className)} {...props} />
}

export function GradientCardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
   return <p className={cn("text-xs text-muted-foreground font-medium", className)} {...props} />
}

export const variantIconBadgeStyles: Record<GradientCardVariant, string> = {
   lulus: "text-emerald-600 dark:text-emerald-400",
   "pengajuan-proposal": "text-yellow-600 dark:text-yellow-400",
   "seminar-proposal": "text-amber-600 dark:text-amber-400",
   konsultasi: "text-sky-600 dark:text-sky-400",
   penelitian: "text-orange-600 dark:text-orange-400",
   "seminar-hasil": "text-red-600 dark:text-red-400",
   "sidang-skripsi": "text-purple-600 dark:text-purple-400",
   destructive: "text-rose-600 dark:text-rose-400",
   primary: "text-primary",
}

export const variantIconStyles = variantIconBadgeStyles
