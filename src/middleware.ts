import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// หน้าที่ต้อง login ก่อน
const protectedRoutes = ['/dashboard', '/checklist', '/smoking', '/reports', '/profile']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // ตรวจสอบว่าเป็น protected route หรือไม่
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute) {
    // ตรวจสอบว่ามี userId ใน URL parameters หรือไม่ (สำหรับ LINE login callback)
    const userId = request.nextUrl.searchParams.get('userId')
    
    if (userId) {
      // ถ้ามี userId ใน URL แสดงว่าเป็น LINE login callback
      // ให้ redirect ไปยัง dashboard โดยไม่ต้องตรวจสอบ localStorage
      return NextResponse.next()
    }
    
    // สำหรับการเข้าถึงปกติ ต้องตรวจสอบ localStorage
    // แต่เนื่องจาก middleware ทำงานใน server-side
    // เราจะให้ client-side ตรวจสอบแทน
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
