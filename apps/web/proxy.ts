import { NextRequest, NextResponse } from 'next/server'

// Sprint 1: client-side auth via useAuth hook — proxy does nothing
export function proxy(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|icons|.*\\.png$).*)'],
}
