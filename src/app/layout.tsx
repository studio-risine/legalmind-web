import { ThemeScript } from '@/components/ui/theme-script'
import { fontFamily } from '@/config/font-family'
import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
	title: 'legaltrack',
	description: 'legaltrack',
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
			</body>
		</html>
	)
}
