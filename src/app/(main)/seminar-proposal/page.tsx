import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getSeminarProposalsWithDetails } from "@/lib/dal/seminar";
import SeminarProposalListView from "./seminar-proposal-list-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daftar Seminar Proposal | SIMTA Pendikom",
    description: "Jadwal dan status pelaksanaan seminar proposal mahasiswa Tugas Akhir Pendidikan Komputer."
};

export default async function SeminarProposalPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const proposals = await getSeminarProposalsWithDetails();

    return (
        <SeminarProposalListView 
            proposals={proposals} 
            currentUsername={session?.user?.username} 
        />
    );
}
