import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, verifySessionToken } from '@/lib/adminSession';

const PUBLIC_ADMIN_PATHS = new Set(['/admin/login', '/api/admin/login', '/api/admin/logout']);

function isPublicOrdersRequest(pathname: string, method: string): boolean {
  // Customers create orders during checkout without being logged in as admin.
  return pathname === '/api/orders' && method === 'POST';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ADMIN_PATHS.has(pathname) || isPublicOrdersRequest(pathname, request.method)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = token ? await verifySessionToken(token) : false;

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/orders')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*', '/api/orders', '/api/orders/:path*'],
};
