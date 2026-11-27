import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAllStudentsWithDetails } from "@/lib/dal/student";
import { getGenerations } from "@/lib/dal/thesis";
import MahasiswaListView from "./mahasiswa-list-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daftar Mahasiswa | SIMTA Pendikom",
    description: "Direktori dan status tugas akhir seluruh mahasiswa Pendidikan Komputer."
};

export default async function MahasiswaPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const [students, generations] = await Promise.all([
        getAllStudentsWithDetails(),
        getGenerations()
    ]);

    return (
        <MahasiswaListView 
            students={students} 
            generations={generations}
            currentUsername={session?.user?.username} 
        />
    );
}
