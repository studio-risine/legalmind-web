import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

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

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll()
				},
				setAll(cookiesToSet) {
					// biome-ignore lint/suspicious/useIterableCallbackReturn: <explanation>
					cookiesToSet.forEach(({ name, value, options }) =>
						request.cookies.set(name, value),
					)
					supabaseResponse = NextResponse.next({
						request,
					})
					// biome-ignore lint/suspicious/useIterableCallbackReturn: <explanation>
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options),
					)
				},
			},
		},
	)

	const {
		data: { user },
	} = await supabase.auth.getUser()

	const hasAuthenticated = user?.aud === 'authenticated'
	if (!hasAuthenticated && !isPublic && !isError) {
		const url = request.nextUrl.clone()
		url.pathname = '/auth/login'

		return NextResponse.redirect(url)
	}

	// if (user && request.nextUrl.pathname.startsWith('/auth')) {
	// 	const url = request.nextUrl.clone()
	// 	url.pathname = '/dashboard'

	// 	return NextResponse.redirect(url)
	// }

	// if (user && !isPublic) {
	// 	const url = request.nextUrl.clone()
	// 	url.pathname = '/dashboard'

	// 	return NextResponse.redirect(url)
	// }

	// if (!user && !isPublic && !request.nextUrl.pathname.startsWith('/error')) {
	// 	// no user, potentially respond by redirecting the user to the login page
	// 	const url = request.nextUrl.clone()
	// 	url.pathname = '/auth/login'
	// 	return NextResponse.redirect(url)
	// }

	// IMPORTANT: You *must* return the supabaseResponse object as it is.
	// If you're creating a new response object with NextResponse.next() make sure to:
	// 1. Pass the request in it, like so:
	//    const myNewResponse = NextResponse.next({ request })
	// 2. Copy over the cookies, like so:
	//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
	// 3. Change the myNewResponse object to fit your needs, but avoid changing
	//    the cookies!
	// 4. Finally:
	//    return myNewResponse
	// If this is not done, you may be causing the browser and server to go out
	// of sync and terminate the user's session prematurely!

	return supabaseResponse
}
