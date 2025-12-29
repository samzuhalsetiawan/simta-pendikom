import { getServerSession } from "next-auth";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { authOptions } from "./lib/auth";

export default withAuth(
   /*async*/ function middleware(req) {
      // const { pathname } = req.nextUrl

      // if (pathname === '/dashboard') {
      //    const session = await getServerSession(authOptions);

      //    if (!session) {
      //       return NextResponse.redirect(new URL('/login', req.url))
      //    }

      //    let target;
      //    switch (session.user.role) {
      //       case 'lecturer':
      //          target = '/dashboard/lecturer';
      //          break;
      //       case 'student':
      //          target = '/dashboard/student';
      //          break;
      //       default:
      //          throw new Error('Invalid role');
      //    }
      //    return NextResponse.redirect(new URL(target, req.url))
      // }
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
