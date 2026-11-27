import { HeroSection } from "@/components/section/home-hero-section/section"
import { Metadata } from "next"

import type { Viewport } from "next"

export const metadata: Metadata = {
  title: "SIMTA Pendikom - Universitas Mulawarman",
  description: "Sistem Informasi Manajemen Tugas Akhir (SIMTA) Pendidikan Komputer, Fakultas Keguruan dan Ilmu Pendidikan, Universitas Mulawarman. Platform terintegrasi untuk manajemen tugas akhir.",
  keywords: [
    "universitas mulawarman",
    "fakultas keguruan dan ilmu pendidikan",
    "pendidikan komputer",
    "SIMTA",
    "sistem informasi manajemen tugas akhir",
    "FKIP UNMUL",
    "tugas akhir",
    "skripsi",
  ],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function Home() {
  return (
    <>
            <main className="flex-1 w-full">
        <HeroSection />
      </main>
    </>
  )
}