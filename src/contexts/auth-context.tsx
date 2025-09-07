'use client'

import { createClient } from '@libs/supabase/client'
import type { Session, User } from '@supabase/supabase-js'
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'

interface AuthContextType {
	user: User | null
	session: Session | null
	loading: boolean
	error: string | null
	signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>({
	user: null,
	session: null,
	loading: false,
	error: null,
	signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [session, setSession] = useState<Session | null>(null)
	const [error, setError] = useState<string | null>(null)

	const supabase = createClient()

	useEffect(() => {
		setLoading(true)

		supabase.auth.getSession().then(({ data: { session }, error }) => {
			if (error) {
				setError(error.message)
			} else {
				setSession(session)
				setUser(session?.user ?? null)
				setLoading(false)
			}
		})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_OUT') {
				setUser(null)
				setSession(null)
			} else {
				setSession(session)
				setUser(session?.user ?? null)
			}
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [supabase.auth.getSession, supabase.auth.onAuthStateChange])

	async function signOut() {
		await supabase.auth.signOut()
		setUser(null)
		setSession(null)
	}

	const initialValue = {
		user,
		session,
		loading,
		error,
		signOut,
	}

	return (
		<AuthContext.Provider value={initialValue}>{children}</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)

	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}

	return context
}
