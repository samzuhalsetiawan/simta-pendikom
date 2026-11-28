import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeProvider } from "@/components/provider/theme-provider";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        // Middleware sudah handle redirect ini, tapi ini sebagai fallback.
        // headers() berisi request URL sehingga kita bisa buat callbackUrl.
        redirect("/login?callbackUrl=/dashboard");
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            {children}
        </div>
    );
}
