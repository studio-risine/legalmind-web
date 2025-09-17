import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const PUBLIC_ROUTES = [
	{ path: '/', exact: true },
	{ path: '/auth', exact: false },
	{ path: '/about', exact: true },
	{ path: '/contact', exact: true },
	{ path: '/pricing', exact: true },
]

export async function updateSession(request: NextRequest) {
	const pathname = request.nextUrl.pathname

	const isPublic = PUBLIC_ROUTES.some((route) => {
		if (route.exact) {
			return pathname === route.path
		}
		return pathname.startsWith(route.path)
	})

	const isError = request.nextUrl.pathname.startsWith('/error')

	let supabaseResponse = NextResponse.next({
		request,
	})

	const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
		cookies: {
			getAll() {
				return request.cookies.getAll()
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) =>
					request.cookies.set(name, value),
				)
				supabaseResponse = NextResponse.next({
					request,
				})
				cookiesToSet.forEach(({ name, value, options }) =>
					supabaseResponse.cookies.set(name, value, options),
				)
			},
		},
	})

	const {
		data: { user },
	} = await supabase.auth.getUser()

	const hasAuthenticated = user?.aud === 'authenticated'

	if (!hasAuthenticated && !isPublic && !isError) {
		const url = request.nextUrl.clone()
		url.pathname = '/auth/login'

		const redirectRes = NextResponse.redirect(url)

		// Copy Set-Cookie headers from supabaseResponse to preserve auth cookies
		supabaseResponse.headers.getSetCookie().forEach((cookie) => {
			redirectRes.headers.append('set-cookie', cookie)
		})

		return redirectRes
	}

	return supabaseResponse
}
