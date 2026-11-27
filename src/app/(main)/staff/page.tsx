import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAllStaffMembers } from "@/lib/dal/staff";
import StaffListView from "./staff-list-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daftar Staff & Pengelola | SIMTA Pendikom",
    description: "Direktori staf administrasi, pengelola program studi, dan jurusan Pendidikan Komputer."
};

export default async function StaffPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const staffMembers = await getAllStaffMembers();

    return (
        <StaffListView 
            staffMembers={staffMembers} 
            currentUsername={session?.user?.username} 
        />
    );
}
