import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAllThesesWithDetails, getGenerations } from "@/lib/dal/thesis";
import SkripsiListView from "./skripsi-list-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daftar Skripsi | SIMTA Pendikom",
    description: "Daftar seluruh skripsi dan tugas akhir mahasiswa Pendidikan Komputer."
};

export default async function SkripsiPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const [theses, generations] = await Promise.all([
        getAllThesesWithDetails(),
        getGenerations()
    ]);

    return (
        <SkripsiListView 
            theses={theses} 
            generations={generations}
            currentUsername={session?.user?.username} 
        />
    );
}
