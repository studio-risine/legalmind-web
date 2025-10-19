'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'
import { queryClient } from '@/libs/react-query-client'

export function Providers({ children }: { children: ReactNode }) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
			enableColorScheme
		>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</NextThemesProvider>
	)
}
