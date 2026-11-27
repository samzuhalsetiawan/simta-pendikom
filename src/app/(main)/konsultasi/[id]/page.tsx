import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getConsultationById } from "@/lib/dal/consultation"
import { ConsultationDetailView } from "./_components/consultation-detail-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Konsultasi Skripsi - SIMTA Pendikom",
    description: "Detail sesi bimbingan skripsi mahasiswa",
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ConsultationDetailPage({ params }: PageProps) {
    const session = await auth.api.getSession({ headers: await headers() })
    const resolvedParams = await params
    const consultation = await getConsultationById(resolvedParams.id)

    if (!consultation) {
        notFound()
    }

    let currentUserRole: 'student' | 'lecturer' | 'guest' = 'guest'
    let isOwnerStudent = false
    let isOwnerLecturer = false

    if (session?.user) {
        const roles = JSON.parse(session.user.role || "[]") as string[]
        const username = session.user.username
        isOwnerStudent = username === consultation.student_nim
        isOwnerLecturer = username === consultation.lecturer_nip
        const isStaff = roles.includes('admin') || roles.includes('coordinator') || roles.includes('staff')

        if (isOwnerLecturer || isStaff) {
            currentUserRole = 'lecturer'
        } else if (isOwnerStudent) {
            currentUserRole = 'student'
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-8">
                <ConsultationDetailView 
                    consultation={consultation} 
                    currentUserRole={currentUserRole}
                    isOwnerStudent={isOwnerStudent}
                    isOwnerLecturer={isOwnerLecturer}
                />
            </main>
        </div>
    )
}
