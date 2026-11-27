import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPendadaransWithDetails } from "@/lib/dal/seminar";
import SidangSkripsiListView from "./sidang-skripsi-list-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daftar Sidang Skripsi | SIMTA Pendikom",
    description: "Jadwal dan status pelaksanaan sidang skripsi mahasiswa Tugas Akhir Pendidikan Komputer."
};

export default async function SidangSkripsiPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const proposals = await getPendadaransWithDetails();

    return (
        <SidangSkripsiListView 
            proposals={proposals} 
            currentUsername={session?.user?.username} 
        />
    );
}
