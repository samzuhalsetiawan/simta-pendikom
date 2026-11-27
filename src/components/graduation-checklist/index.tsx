"use client";

import { ChecklistItem } from "./checklist-item";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/base/card";
import { toggleChecklistAction } from "@/lib/actions/graduation";
import { toast } from "sonner";

interface GraduationChecklistProps {
    checklists: { item_id: string, is_checked: boolean }[];
}

const REQUIREMENTS = [
    { id: "transkrip_nilai", title: "1. Transkrip nilai sementara" },
    { id: "surat_persetujuan_ta", title: "2. Surat Persetujuan Ujian Tugas Akhir" },
    { id: "slip_ukt", title: "3. Slip UKT semester 1 s/d akhir" },
    { id: "ktm", title: "4. Kartu Tanda Mahasiswa" },
    { id: "sumbangan_buku", title: "5. Bukti sumbangan buku dari Perpustakaan" },
    { id: "bebas_perpus", title: "6. Bukti bebas pinjam buku dari Perpustakaan Universitas dan Pusat" },
    { id: "krs", title: "7. Kartu Rencana Studi semester akhir" },
    { id: "skl", title: "8. Surat Keterangan Lulus" },
    { id: "toefl", title: "9. Test TOEFL/MUEPT" },
];

export function GraduationChecklist({ checklists }: GraduationChecklistProps) {
    const handleToggle = async (itemId: string, newCheckedState: boolean) => {
        try {
            await toggleChecklistAction(itemId, newCheckedState);
            toast.success("Status checklist berhasil diperbarui");
        } catch (error: any) {
            toast.error(error.message || "Gagal memperbarui status checklist");
            throw error; // Re-throw to inform ChecklistItem that it failed
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Checklist Persyaratan Kelulusan</CardTitle>
                <CardDescription>
                    Tandai persyaratan yang telah disiapkan.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {REQUIREMENTS.map((req) => {
                    const isChecked = checklists.find(c => c.item_id === req.id)?.is_checked || false;
                    return (
                        <ChecklistItem 
                            key={req.id}
                            itemId={req.id}
                            title={req.title}
                            isChecked={isChecked}
                            onToggle={handleToggle}
                        />
                    );
                })}
            </CardContent>
        </Card>
    );
}
