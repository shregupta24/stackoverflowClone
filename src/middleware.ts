import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import getOrCreateStorage from './models/server/storageSetup'
import createOrGetDb from './models/server/dbSetup'

 
// here we are running it for every route 
export async function middleware(request: NextRequest) {
    await Promise.all([
        createOrGetDb(),
        getOrCreateStorage()
    ])
  return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
