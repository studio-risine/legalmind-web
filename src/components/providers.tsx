'use client'

import { AuthProvider } from '@contexts/auth-context'
import { queryClient } from '@libs/query-client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type * as React from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
			enableColorScheme
		>
			<AuthProvider>
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			</AuthProvider>
		</NextThemesProvider>
	)
}
