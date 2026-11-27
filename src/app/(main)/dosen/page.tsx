import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAllLecturersWithDetails } from "@/lib/dal/lecturer";
import DosenListView from "./dosen-list-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daftar Dosen | SIMTA Pendikom",
    description: "Direktori dosen pembimbing dan penguji Pendidikan Komputer beserta statistik bimbingan."
};

export default async function DosenPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const lecturers = await getAllLecturersWithDetails();

    return (
        <DosenListView 
            lecturers={lecturers} 
            currentUsername={session?.user?.username} 
        />
    );
}
