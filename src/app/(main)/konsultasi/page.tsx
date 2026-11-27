import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
    getPaginatedConsultations,
} from "@/lib/dal/consultation";
import {
    getStudentByNim,
    getLecturerByNip,
    UserPickerItem,
} from "@/lib/actions/user-picker";
import KonsultasiListView from "./konsultasi-list-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Bimbingan & Konsultasi | SIMTA Pendikom",
    description:
        "Daftar bimbingan dan konsultasi tugas akhir mahasiswa bersama dosen pembimbing.",
};

interface KonsultasiPageProps {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        q?: string;
        status?: string;
        date?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        student?: string;
        lecturer?: string;
    }>;
}

export default async function KonsultasiPage({ searchParams }: KonsultasiPageProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const params = await searchParams;
    const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(params.limit || "12", 10) || 12));
    const search = params.q || "";
    const status = params.status || "semua";
    const dateFilter = params.date || "semua";
    const startDate = params.startDate || "";
    const endDate = params.endDate || "";
    const sortBy = params.sortBy || "terbaru";
    const studentNim = params.student || "";
    const lecturerNip = params.lecturer || "";

    // Fetch details for active entity filters if present in URL
    const [selectedStudent, selectedLecturer] = await Promise.all([
        studentNim ? getStudentByNim(studentNim) : Promise.resolve(null),
        lecturerNip ? getLecturerByNip(lecturerNip) : Promise.resolve(null),
    ]);

    const { data: consultations, meta } = await getPaginatedConsultations({
        page,
        limit,
        search,
        status,
        dateFilter,
        startDate,
        endDate,
        sortBy,
        studentNim: studentNim || undefined,
        lecturerNip: lecturerNip || undefined,
    });

    return (
        <KonsultasiListView
            consultations={consultations}
            paginationMeta={meta}
            currentUsername={session?.user?.username}
            currentUserRole={session?.user?.role}
            initialFilters={{
                search,
                status,
                dateFilter,
                startDate,
                endDate,
                sortBy,
                studentNim,
                lecturerNip,
            }}
            initialSelectedStudent={selectedStudent}
            initialSelectedLecturer={selectedLecturer}
        />
    );
}
