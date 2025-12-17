export type NavDropdown = {
   type: "dropdown";
   title: string;
   data: NavigationData[];
}

export type NavAction = {
   type: "action";
   title: string;
   href: string;
   description: string;
}

export type NavigationData = NavDropdown | NavAction;

export const navigationData: NavigationData[] = [
   {
      type: "action",
      title: "Beranda",
      href: "/",
      description: "Halaman Beranda"
   },
   {
      type: "dropdown",
      title: "Profil",
      data: [
         {
            type: "action",
            title: "Sejarah",
            href: "#",
            description: "Sejarah srogram studi Pendidikan Komputer"
         },
         {
            type: "action",
            title: "Struktur Organisasi",
            href: "#",
            description: "Struktur Organisasi Universitas Mulawarman"
         },
         {
            type: "action",
            title: "Visi & Misi",
            href: "#",
            description: "Visi & Misi Universitas Mulawarman"
         },
         {
            type: "action",
            title: "Profil Dosen",
            href: "#",
            description: "Profil Dosen Pendidikan Komputer"
         },
         {
            type: "action",
            title: "Akreditasi",
            href: "#",
            description: "Akreditasi Program studi Pendidikan Komputer"
         },
         {
            type: "action",
            title: "Fasilitas",
            href: "#",
            description: "Fasilitas Program studi Pendidikan Komputer"
         }
      ]
   },
   {
      type: "dropdown",
      title: "Akademik",
      data: [
         {
            type: "dropdown",
            title: "Jadwal Kuliah & RPS",
            data: [
               {
                  type: "action",
                  title: "Mata Kuliah KKNI",
                  href: "#",
                  description: "Mata Kuliah dan RPS KKNI"
               },
               {
                  type: "action",
                  title: "Mata Kuliah OBE",
                  href: "#",
                  description: "Mata Kuliah OBE"
               }
            ]
         },
         {
            type: "dropdown",
            title: "Dokumen Kurikulum",
            data: [
               {
                  type: "action",
                  title: "Kurikulum KKNI",
                  href: "#",
                  description: "Kurikulum berbasis KKNI level 6"
               },
               {
                  type: "action",
                  title: "Kurikulum OBE",
                  href: "#",
                  description: "Kurikulum OBE"
               }
            ]
         },
         {
            type: "action",
            title: "Kalender Akademik",
            href: "#",
            description: "Kalender akademik Universitas Mulawarman"
         },
         {
            type: "action",
            title: "Biaya Kuliah",
            href: "#",
            description: "Biaya perkuliahan"
         },
         {
            type: "action",
            title: "Syarat & Pendaftaran",
            href: "#",
            description: "Syarat dan pendaftaran mahasiswa baru"
         },
         {
            type: "action",
            title: "Laboratorium",
            href: "#",
            description: "Laboratorium program studi Pendidikan Komputer Universitas Mulawarman"
         },
         {
            type: "action",
            title: "Praktik Kerja Lapangan",
            href: "#",
            description: "Praktik Kerja Lapangan"
         },
         {
            type: "action",
            title: "Kuliah Kerja Nyata",
            href: "#",
            description: "Kuliah Kerja Nyata"
         },
         {
            type: "dropdown",
            title: "Program MBKM",
            data: [
               {
                  type: "action",
                  title: "Aktifitas MBKM",
                  href: "#",
                  description: "Informasi pelaksanaan MBKM"
               },
               {
                  type: "action",
                  title: "Pelaksanaan MBKM",
                  href: "#",
                  description: "Pelaksanaan MBKM"
               }
            ]
         },
         {
            type: "action",
            title: "Jadwal Kuliah",
            href: "#",
            description: "Jadwal pelaksanaan kuliah"
         },
         {
            type: "action",
            title: "Jadwal Seminar TA",
            href: "#",
            description: "Jadwal pelaksanaan seminar proposal, hasil, dan Sidang Akhir"
         },
         {
            type: "action",
            title: "Syarat Kelulusan",
            href: "#",
            description: "Syarat kelulusan Sarjana Pendidikan Komputer"
         },
         {
            type: "action",
            title: "Peraturan Akademik",
            href: "#",
            description: "Peraturan akademik Universitas Mulawarman"
         },
         {
            type: "action",
            title: "Capaian Pemb. Lulusan",
            href: "#",
            description: "Capaian pembelajaran lulusan"
         },
         {
            type: "action",
            title: "Panduan & SOP",
            href: "#",
            description: "Panduan dan Standar Operasional Prosedur"
         },
         {
            type: "action",
            title: "Alur Akademik",
            href: "#",
            description: "Alur proses akademik"
         }
      ]
   },
   {
      type: "dropdown",
      title: "Kemahasiswaan",
      data: [
         {
            type: "action",
            title: "Organisasi Mahasiswa",
            href: "#",
            description: "Organisasi Mahasiswa Pendidikan Komputer"
         },
         {
            type: "dropdown",
            title: "Prog. Kreatifitas Mhs.",
            data: [
               {
                  type: "action",
                  title: "Info PKM",
                  href: "#",
                  description: "Informasi Program Kreatifitas Mahasiswa"
               },
               {
                  type: "action",
                  title: "Pelaksanaan PKM",
                  href: "#",
                  description: "Pelaksanaan Program Kreatifitas Mahasiswa"
               }
            ]
         },
         {
            type: "action",
            title: "Prestasi Mahasiswa",
            href: "#",
            description: "Prestasi Mahasiswa Pendidikan Komputer"
         },
         {
            type: "action",
            title: "Beasiswa Mahasiswa",
            href: "#",
            description: "Beasiswa Mahasiswa Pendidikan Komputer"
         },
         {
            type: "action",
            title: "Aktifitas Mahasiswa",
            href: "#",
            description: "Aktifitas Kegiatan Mahasiswa"
         },
         {
            type: "action",
            title: "Satuan Kegiatan Mhs.",
            href: "#",
            description: "Satuan Kegiatan Mahasiswa"
         },
         {
            type: "action",
            title: "Kehidupan Kampus",
            href: "#",
            description: "Iklim akademik dan Kehidupan Kampus"
         },
         {
            type: "dropdown",
            title: "Tracer Study",
            data: [
               {
                  type: "action",
                  title: "Waktu tunggu lulusan",
                  href: "#",
                  description: "Waktu tunggu lulusan pendidikan komputer"
               },
               {
                  type: "action",
                  title: "Kesesuaian Keilmuan",
                  href: "#",
                  description: "Kesesuaian Keilmuan dengan ilmuan dengan pekerjaan"
               },
               {
                  type: "action",
                  title: "Kepuasan Pengguna",
                  href: "#",
                  description: "Kepuasan Penguna Lulusan"
               }
            ]
         },
         {
            type: "action",
            title: "Data Alumni",
            href: "#",
            description: "Data Alumni Pendidikan Komputer"
         },
         {
            type: "action",
            title: "Galeri Wisuda",
            href: "#",
            description: "Galeri Wisuda Pendidikan Komputer"
         },
         {
            type: "action",
            title: "Legalisasi Kelulusan",
            href: "#",
            description: "Legalisasi berkas dan dokumen kelulusan"
         }
      ]
   },
   {
      type: "dropdown",
      title: "Penelitian",
      data: [
         {
            type: "action",
            title: "Publikasi Ilmiah",
            href: "#",
            description: "Publikasi ilmiah Pendidikan Komputer"
         },
         {
            type: "action",
            title: "Roadmap Penelitian",
            href: "#",
            description: "Roadmap Penelitian Pendidikan Komputer"
         },
         {
            type: "action",
            title: "Dokumen Penelitian",
            href: "#",
            description: "Dokumen Penelitian Pendidikan Komputer"
         }
      ]
   }
]