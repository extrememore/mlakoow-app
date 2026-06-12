import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { isAdmin, isOwner } from '@/lib/roles'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const role = (session?.user as any)?.role ?? ''

  // Admin panel — accessible by admin & superadmin
  if (pathname.startsWith('/admin')) {
    if (!session?.user) return NextResponse.redirect(new URL('/login', req.url))
    if (!isAdmin(role)) return NextResponse.redirect(new URL('/', req.url))
  }

  // Owner portal — accessible only by owner
  if (pathname.startsWith('/owner')) {
    if (!session?.user) return NextResponse.redirect(new URL('/login', req.url))
    if (!isOwner(role)) return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/owner/:path*'],
}
