import type { ReactNode } from 'react'

export function AuthBox({ children }: { children: ReactNode }) {
	return <div className="flex flex-col gap-6 lg:gap-10">{children}</div>
}

export function AuthBoxFooter({ children }: { children: ReactNode }) {
	return <div className="space-y-4">{children}</div>
}

export function AuthBoxContent({ children }: { children: ReactNode }) {
	return <div className="space-y-4">{children}</div>
}

export interface AuthFormHeaderProps {
	title: string
	description?: string
}

export function AuthBoxHeader({ title, description }: AuthFormHeaderProps) {
	return (
		<div className="flex flex-col gap-1">
			<h1 className="font-bold text-3xl text-foreground">{title}</h1>
			{description && (
				<p className="text-balance text-foreground/80 text-sm">{description}</p>
			)}
		</div>
	)
}
