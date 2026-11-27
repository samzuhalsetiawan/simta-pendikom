import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getStaffProfile } from "@/lib/dal/profile";
import { Button } from "@/components/base/button";
import {
    ChevronRight,
    ArrowLeft,
    AlertCircle,
    Home
} from "lucide-react";
import ProfileCard from "@/components/profile/profile-card";

export default async function StaffProfilePage({
    params
}: {
    params: Promise<{ nip: string }>
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const { nip } = await params;
    const profile = await getStaffProfile(nip);

    if (!profile) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md bg-card p-8 rounded-2xl border border-border shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold font-heading">Staf Tidak Ditemukan</h2>
                        <p className="text-sm text-muted-foreground">
                            Data staf dengan NIP <span className="font-mono font-bold text-foreground">{nip}</span> tidak terdaftar di sistem.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl mt-2 font-semibold border-border">
                        <Link href="/" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Beranda
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const isOwner = session?.user?.username === nip;
    const sanitizedProfile = {
        ...profile,
        signaturePath: isOwner ? profile.signaturePath : null,
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            <main className="container mx-auto max-w-2xl px-4 py-6 sm:px-6 space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
                        <Home className="h-3.5 w-3.5" />
                        <span>Home</span>
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    <span className="text-muted-foreground">Staf</span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    <span className="text-foreground font-bold truncate max-w-[240px]">{profile.name}</span>
                </div>

                {/* Page Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                    <div>
                        <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Profil Staf</p>
                        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground">
                            {profile.name}
                        </h1>
                    </div>
                </div>

                {/* Single Main Column: ProfileCard with integrated signature */}
                <div>
                    <ProfileCard 
                        profile={sanitizedProfile} 
                        isOwner={isOwner} 
                        roleVariant="staff" 
                        cardVariant="primary"
                        showSignature={isOwner}
                    />
                </div>
            </main>
        </div>
    );
}
