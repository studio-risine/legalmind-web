import { Card, CardContent, CardFooter, CardHeader } from '@components/ui/card'
import type { ReactNode } from 'react'

export function AuthBox({ children }: { children: ReactNode }) {
	return <Card className="flex flex-col gap-6 lg:gap-10">{children}</Card>
}

export function AuthBoxFooter({ children }: { children: ReactNode }) {
	return <CardFooter className="space-y-4">{children}</CardFooter>
}

export function AuthBoxContent({ children }: { children: ReactNode }) {
	return <CardContent className="space-y-4">{children}</CardContent>
}

export interface AuthFormHeaderProps {
	title: string
	description?: string
}

export function AuthBoxHeader({ title, description }: AuthFormHeaderProps) {
	return (
		<CardHeader className="flex flex-col gap-1">
			<h1 className="font-bold text-3xl text-foreground">{title}</h1>
			{description && (
				<p className="text-balance text-foreground/80 text-sm">{description}</p>
			)}
		</CardHeader>
	)
}
