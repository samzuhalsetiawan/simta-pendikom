import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
   return (
      <footer className="bg-black text-white pt-16 pb-8 text-sm">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
               {/* Brand & Contact */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     {/* Using a placeholder logo or text if image not available, but user has logo in header */}
                     <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                        <span className="font-bold text-white">P</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="font-bold leading-tight text-lg">Pendidikan Komputer</span>
                     </div>
                  </div>

                  <div className="space-y-4 text-zinc-400">
                     <h3 className="font-semibold text-white">Contact Us</h3>
                     <div className="flex gap-3 items-start">
                        <span className="mt-1">📍</span>
                        <p>Gedung Dekanat FKIP Lt. 2,<br />Sayap Barat, Jl. Pendidikan No. 15</p>
                     </div>
                     <div className="flex gap-3 items-center">
                        <span>✉️</span>
                        <p>prodipenkom@universitas.ac.id</p>
                     </div>
                     <div className="flex gap-3 items-center">
                        <span>📞</span>
                        <p>+62 812-3456-7890</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <Link href="#" className="p-2 bg-white rounded-full text-black hover:bg-zinc-200 transition">
                        <Facebook className="w-4 h-4" />
                     </Link>
                     <Link href="#" className="p-2 bg-white rounded-full text-black hover:bg-zinc-200 transition">
                        <Twitter className="w-4 h-4" />
                     </Link>
                     <Link href="#" className="p-2 bg-white rounded-full text-black hover:bg-zinc-200 transition">
                        <Instagram className="w-4 h-4" />
                     </Link>
                  </div>
               </div>

               {/* Links Column 1 */}
               <div className="space-y-6">
                  <h3 className="font-semibold text-lg">Tentang Kampus</h3>
                  <ul className="space-y-3 text-zinc-400">
                     <li><Link href="#" className="hover:text-white transition">Sejarah & Visi Misi</Link></li>
                     <li><Link href="#" className="hover:text-white transition">Struktur Organisasi</Link></li>
                     <li><Link href="#" className="hover:text-white transition">Akreditasi & Sertifikasi</Link></li>
                     <li><Link href="#" className="hover:text-white transition">Lokasi & Fasilitas</Link></li>
                     <li><Link href="#" className="hover:text-white transition">Galeri</Link></li>
                  </ul>
                  <h3 className="font-semibold text-lg pt-4">Kehidupan Kampus</h3>
                  <ul className="space-y-3 text-zinc-400">
                     <li><Link href="#" className="hover:text-white transition">Organisasi Mahasiswa (BEM)</Link></li>
                     <li><Link href="#" className="hover:text-white transition">Unit Kegiatan Mahasiswa (UKM)</Link></li>
                     <li><Link href="#" className="hover:text-white transition">Pusat Karir & Alumni</Link></li>
                     <li><Link href="#" className="hover:text-white transition">Layanan Kesehatan & Konseling</Link></li>
                  </ul>
               </div>

               {/* Links Column 2 */}
               <div className="space-y-6">
                  <h3 className="font-semibold text-lg">Akademik</h3>
                  <ul className="space-y-3 text-zinc-400">
                     <li><Link href="#" className="hover:text-white transition">Program Sarjana (S1)</Link></li>
                     <li><Link href="#" className="hover:text-white transition">Program Pascasarjana (S2/S3)</Link></li>
                     <li><Link href="#" className="hover:text-white transition">Kalender Akademik</Link></li>
                     <li><Link href="#" className="hover:text-white transition">Perpustakaan Digital</Link></li>
                  </ul>
               </div>

               {/* Links Column 3 */}
               <div className="space-y-6">
                  <h3 className="font-semibold text-lg">Penerimaan (PMB)</h3>
                  <ul className="space-y-3 text-zinc-400">
                     <li><Link href="#" className="hover:text-white transition">Jalur Seleksi Masuk</Link></li>
                     <li><Link href="#" className="hover:text-white transition">Biaya Perkuliahan</Link></li>
                     <li><Link href="#" className="hover:text-white transition">Beasiswa Mahasiswa</Link></li>
                     <li><Link href="#" className="hover:text-white transition">Prosedur Pendaftaran</Link></li>
                  </ul>
               </div>
            </div>
         </div>
      </footer>
   );
}
