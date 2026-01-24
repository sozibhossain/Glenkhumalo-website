import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Custom middleware logic can go here if needed
        // e.g. checking roles
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAuthPage =
            req.nextUrl.pathname.startsWith('/login') ||
            req.nextUrl.pathname.startsWith('/register') ||
            req.nextUrl.pathname.startsWith('/role-selection') ||
            req.nextUrl.pathname.startsWith('/forgot-password') ||
            req.nextUrl.pathname.startsWith('/reset-password');

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL('/', req.url));
            }
            return null;
        }

        if (!isAuth && req.nextUrl.pathname.startsWith('/profile')) { // Example protected route
            return NextResponse.redirect(new URL('/login', req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                const pathname = req.nextUrl.pathname;
                if (
                    pathname.startsWith('/login') ||
                    pathname.startsWith('/register') ||
                    pathname.startsWith('/role-selection') ||
                    pathname.startsWith('/forgot-password') ||
                    pathname.startsWith('/reset-password')
                ) {
                    return true;
                }
                return !!token;
            },
        },
        pages: {
            signIn: '/login',
        }
    }
);

export const config = {
    matcher: [
        "/profile/:path*",
        "/login",
        "/register",
        "/role-selection",
        "/forgot-password",
        "/reset-password",
        // Add other protected routes here
    ],
};
