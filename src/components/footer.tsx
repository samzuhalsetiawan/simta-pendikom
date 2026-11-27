"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone, Globe, BookOpen, GraduationCap } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Sembunyikan footer saat berada di halaman kalender agar tampilan full-screen kalender maksimal
  if (pathname?.startsWith("/kalender")) {
    return null;
  }

  return (
    <footer className="border-t bg-muted/40 text-muted-foreground transition-colors">
      <div className="container mx-auto px-4 py-12 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand & Description */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85 w-fit">
              <div className="flex items-center gap-1.5">
                <Image
                  src="/unmul-small.png"
                  alt="UNMUL Logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain drop-shadow-sm grayscale hover:grayscale-0 transition-all"
                />
                <Image
                  src="/pendikom_logo.png"
                  alt="Pendikom Logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain drop-shadow-sm grayscale hover:grayscale-0 transition-all"
                />
              </div>
              <h2 className="font-heading font-bold text-lg sm:text-xl tracking-tight text-foreground">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">SIMTA</span> Pendikom
              </h2>
            </Link>
            <p className="text-sm leading-relaxed max-w-md">
              Sistem Informasi Manajemen Tugas Akhir untuk mahasiswa Program Studi Pendidikan Komputer, Fakultas Keguruan dan Ilmu Pendidikan, Universitas Mulawarman.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="h-8 w-8 flex items-center justify-center rounded-full bg-background border shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-muted-foreground" title="Website Resmi">
                <Globe className="h-4 w-4" />
                <span className="sr-only">Website</span>
              </a>
              <a href="#" className="h-8 w-8 flex items-center justify-center rounded-full bg-background border shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-muted-foreground" title="Perpustakaan">
                <BookOpen className="h-4 w-4" />
                <span className="sr-only">Perpustakaan</span>
              </a>
              <a href="#" className="h-8 w-8 flex items-center justify-center rounded-full bg-background border shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-muted-foreground" title="Sistem Akademik">
                <GraduationCap className="h-4 w-4" />
                <span className="sr-only">Sistem Akademik</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-foreground">Tautan Akademik</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/skripsi" className="hover:text-primary transition-colors">Skripsi</Link></li>
              <li><Link href="/kalender" className="hover:text-primary transition-colors">Kalender</Link></li>
              <li><Link href="/mahasiswa" className="hover:text-primary transition-colors">Mahasiswa</Link></li>
              <li><Link href="/dosen" className="hover:text-primary transition-colors">Dosen</Link></li>
              <li><Link href="/tentang" className="hover:text-primary transition-colors">Tentang</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-foreground">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="leading-tight">Gedung FKIP, Kampus Gunung Kelua, Universitas Mulawarman, Samarinda.</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:admin.simta@pendikom.unmul.ac.id" className="hover:text-primary transition-colors">admin.simta@pendikom.unmul.ac.id</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+62 811 2233 4455</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground/80">
          <p>
            &copy; {new Date().getFullYear()} Program Studi Pendidikan Komputer, Universitas Mulawarman. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/kebijakan-privasi" className="hover:text-foreground transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
