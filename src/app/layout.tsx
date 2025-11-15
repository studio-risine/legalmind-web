import { fontFamily } from '@config/font-family'
import './globals.css'

import { Providers } from '@components/providers'
import { Toaster } from '@components/ui/sonner'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	description:
		'Modern legal process and deadline management for law firms and solo practitioners',
	title: 'Legal Mind',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body className={`${fontFamily.className} antialiased`}>
				<Providers>{children}</Providers>
				<Toaster position="top-right" />
			</body>
		</html>
	)
}
