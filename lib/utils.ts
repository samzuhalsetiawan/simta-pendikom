import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as React from "react"
import { eachWeekOfInterval, endOfISOWeek, format, startOfISOWeek } from "date-fns"
import { User, UserRole } from "@/types/user/user"
import { Student } from "@/types/user/student"
import { Lecturer } from "@/types/user/lecturer"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

/**
 * Mendapatkan rentang Senin-Minggu dari sebuah tanggal
 * Output format: { start: "05-01-2026", end: "11-01-2026" }
 */
export const getISOWeekRange = (date: Date) => {
  return {
    start: format(startOfISOWeek(date), 'dd-MM-yyyy'),
    end: format(endOfISOWeek(date), 'dd-MM-yyyy'),
  };
};

/**
 * Menghasilkan daftar range minggu.
 */
export const getWeeksInRange = (start: Date, end: Date) => {
  
  // Mengambil semua awal minggu (Senin) dalam bulan tersebut
  const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
  
  return weeks.map(weekDate => getISOWeekRange(weekDate));
};