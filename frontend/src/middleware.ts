import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for route protection
 * 
 * Rules:
 * 1. Protected routes (/(app)/*) require a refresh_token cookie
 * 2. Public routes (/(auth)/*) redirect to dashboard if refresh_token exists
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session status from cookies
  const hasRefreshToken = request.cookies.has('refresh_token');
  const isLoggedIn = request.cookies.get('is_logged_in')?.value === 'true';

  // 1. Protected Route Logic
  // Protect app group paths - require refresh token
  const protectedPaths = [
    '/dashboard',
    '/income',
    '/expenses',
    '/savings',
    '/budget',
    '/insights',
    '/settings',
    '/profile',
    '/add'
  ];

  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected && !hasRefreshToken) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // 2. Auth Route Logic (Login/Register)
  // Redirect to dashboard if already authenticated (based on session awareness cookie)
  const authPaths = ['/login', '/register', '/forgot-password'];
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  if (isAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons (PWA icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icons).*)',
  ],
};
