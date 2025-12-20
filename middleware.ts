import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
   function middleware(req) {
      const isAuth = !!req.nextauth.token;
      const isLoginPage = req.nextUrl.pathname === "/login";

      if (isLoginPage && isAuth) {
         return NextResponse.redirect(new URL("/", req.url));
      }
      return null;
   },
   {
      callbacks: {
         authorized: ({ token, req }) => {
            const { pathname } = req.nextUrl;
            // Paths that don't need authentication
            const publicPaths = ["/", "/login"];
            const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith("/api/auth");

            if (isPublicPath) return true;

            return !!token;
         },
      },
   }
);

export const config = {
   matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       * - unmul-small.png (logo)
       * - carousel-dummy.png (images)
       */
      "/((?!api|_next/static|_next/image|favicon.ico|unmul-small.png|carousel-dummy).*)",
   ],
};
