import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let pendingConsultationsCount = 0;
  if (session?.user && session.user.role?.includes('lecturer')) {
    const { getLecturerConsultations } = await import("@/lib/dal/consultation");
    const consultations = await getLecturerConsultations(session.user.username);
    pendingConsultationsCount = consultations.filter(c => c.status === 'requested' || c.status === 'reschedule_requested').length;
  }

  let activeRole: string | null = null;
  let staffTitle: string | null = null;

  if (session?.user) {
    const { getActiveRoleCookie } = await import("@/lib/actions/cookies");
    activeRole = await getActiveRoleCookie();
    if (session.user.role?.includes('staff')) {
      const { getStaffRole } = await import("@/lib/dal/staff");
      staffTitle = await getStaffRole(session.user.username);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar 
          pendingConsultationsCount={pendingConsultationsCount}
          activeRole={activeRole}
          staffTitle={staffTitle}
          user={session?.user ? {
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              username: session.user.username,
              role: session.user.role
          } : undefined} 
      />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
