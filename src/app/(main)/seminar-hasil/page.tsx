import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getSeminarHasilsWithDetails } from "@/lib/dal/seminar";
import SeminarHasilListView from "./seminar-hasil-list-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daftar Seminar Hasil | SIMTA Pendikom",
    description: "Jadwal dan status pelaksanaan seminar hasil mahasiswa Tugas Akhir Pendidikan Komputer."
};

export default async function SeminarHasilPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const proposals = await getSeminarHasilsWithDetails();

    return (
        <SeminarHasilListView 
            proposals={proposals} 
            currentUsername={session?.user?.username} 
        />
    );
}
