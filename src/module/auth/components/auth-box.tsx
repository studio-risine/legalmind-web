import type { ReactNode } from 'react'

export function AuthBox({ children }: { children: ReactNode }) {
	return <div className="flex flex-col gap-6 lg:gap-10">{children}</div>
}

export function AuthBoxFooter({ children }: { children: ReactNode }) {
	return <div className="space-y-4">{children}</div>
}

export interface AuthFormHeaderProps {
	title: string
	description: string
}

export function AuthBoxHeader({ title, description }: AuthFormHeaderProps) {
	return (
		<div className="flex flex-col gap-2">
			<h1 className="font-bold text-3xl">{title}</h1>
			<p className="text-balance text-base text-muted-foreground">
				{description}
			</p>
		</div>
	)
}
