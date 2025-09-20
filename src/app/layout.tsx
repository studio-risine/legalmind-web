import { fontFamily } from '@/config/font-family'
import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

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
		<html lang="pt-BR">
			<body className={`${fontFamily.className} antialiased`}>{children}</body>
		</html>
	)
}
