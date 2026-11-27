import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    // Check if this is a dashboard route
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
        // Check for session cookie (BetterAuth uses "__Secure-" prefix over HTTPS)
        const sessionToken =
            request.cookies.get("better-auth.session_token") ||
            request.cookies.get("__Secure-better-auth.session_token");
        
        if (!sessionToken) {
            // Build the callback URL from the current path + search params
            const callbackPath = request.nextUrl.pathname + request.nextUrl.search;
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("callbackUrl", callbackPath);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
