import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAllScheduledCalendarEvents } from "@/lib/dal/seminar";
import KalenderClientView from "./kalender-client-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kalender Seminar & Pendadaran | SIMTA Pendikom",
    description: "Jadwal dan status pelaksanaan Seminar Proposal, Seminar Hasil, dan Pendadaran mahasiswa Tugas Akhir Pendidikan Komputer."
};

export default async function KalenderPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const events = await getAllScheduledCalendarEvents(session?.user);

    return (
        <KalenderClientView 
            events={events} 
            currentUser={session?.user} 
        />
    );
}
