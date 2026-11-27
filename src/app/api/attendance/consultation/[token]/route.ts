import { NextRequest, NextResponse } from "next/server";
import { verifyAndCompleteConsultation } from "@/lib/actions/consultation";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const p = await params;
    const token = p.token;
    
    // Extract ID (first 36 chars) for redirect fallback
    const id = token.length >= 36 ? token.substring(0, 36) : "";
    
    // Attempt verification
    const res = await verifyAndCompleteConsultation(token);
    
    // We'll redirect to the consultation detail page
    const baseUrl = request.nextUrl.origin;
    const redirectUrl = new URL(id ? `/konsultasi/${id}` : "/dashboard", baseUrl);
    
    if (res.error === "unauthorized") {
        // Redirect to login if unauthorized, which might be because they are not logged in
        // In a real app we'd differentiate between 'not logged in' and 'wrong user', but let's just use login page.
        // Or we can just set the error cookie and let the page handle it.
        // Actually, if we just let the page handle it, the page itself will redirect to login if no session!
        // So we can just redirect to the page. 
        // Wait, if we redirect to the page and they aren't logged in, Next.js middleware will redirect them to login.
        // But the middleware might lose the cookie or the cookie won't survive the middleware login loop.
        // Let's redirect to login manually here to preserve the callback!
        const loginUrl = new URL(`/login?callbackUrl=/api/attendance/consultation/${token}`, baseUrl);
        return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.redirect(redirectUrl);
    
    if (res.error) {
        response.cookies.set("simta_attendance_error", res.error, {
            path: "/",
            maxAge: 300, // 5 minutes
            httpOnly: false, // Must be readable by client script
        });
    } else {
        response.cookies.set("simta_attendance_msg", "success", {
            path: "/",
            maxAge: 300, // 5 minutes
            httpOnly: false,
        });
    }

    return response;
}
