export const ACTIVITY_MAPPINGS = {
    KONSULTASI: [
        "Menjadwalkan konsultasi",
        "Menghadiri konsultasi",
        "Mengajukan permohonan bimbingan",
        "Menghadiri bimbingan"
    ],
    PROPOSAL: [
        "Merubah judul proposal",
        "Merubah jenis penelitian proposal",
        "Merubah metode penelitian proposal",
        "Upload file proposal",
        "Meminta persetujuan proposal"
    ],
    SEMINAR_PROPOSAL: [
        "Meminta permohonan seminar proposal",
        "Melaksanakan seminar proposal",
        "Menghadiri seminar proposal"
    ],
    SKRIPSI: [
        "Merubah judul skripsi",
        "Merubah jenis penelitian skripsi",
        "Merubah metode penelitian skripsi",
        "Upload file skripsi"
    ],
    SEMINAR_HASIL: [
        "Meminta permohonan seminar hasil",
        "Melaksanakan seminar hasil",
        "Menghadiri seminar hasil"
    ],
    SIDANG_SKRIPSI: [
        "Meminta permohonan sidang skripsi",
        "Mengupload surat permohonan ujian akhir",
        "Melaksanakan sidang skripsi"
    ]
} as const;

export type ActivityCategory = keyof typeof ACTIVITY_MAPPINGS;

// Utility type to extract the allowed descriptions for a given category
export type ActivityDescription<T extends ActivityCategory> = typeof ACTIVITY_MAPPINGS[T][number];
