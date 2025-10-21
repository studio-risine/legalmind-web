import { ThemeScript } from '@components/ui/theme-script'
import { fontFamily } from '@config/font-family'
import './globals.css'

import { Providers } from '@components/providers'
import { Toaster } from '@components/ui/sonner'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Legal Mind',
	description:
		'Modern legal process and deadline management for law firms and solo practitioners',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<head>
				<ThemeScript />
			</head>
			<body className={`${fontFamily.className} antialiased`}>
				<Providers>{children}</Providers>
				<Toaster position="top-right" />
			</body>
		</html>
	)
}
