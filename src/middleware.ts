import { updateSession } from '@libs/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
	const supabaseResponse = await updateSession(request)

	const pathname = request.nextUrl.pathname
	const spaceMatch = pathname.match(/^\/space\/([^/]+)(?:\/|$)/)

	if (!spaceMatch) {
		return supabaseResponse
	}

	const spaceId = spaceMatch[1]

	const requestHeaders = new Headers(request.headers)
	requestHeaders.set('x-space-id', spaceId)

	const response = NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	})

	// IMPORTANT: Copy all cookies from Supabase response to maintain session
	// This is critical to prevent users from being randomly logged out
	supabaseResponse.cookies.getAll().forEach((cookie) => {
		response.cookies.set(cookie.name, cookie.value, cookie)
	})

	return response
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
		 * Feel free to modify this pattern to include more paths.
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}
