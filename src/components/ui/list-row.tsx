import type { ReactNode } from 'react'

interface ItemRowProps {
	title: string
	description?: string
	children?: ReactNode
}

export function ItemRow({ title, description, children }: ItemRowProps) {
	return (
		<div className="flex items-center justify-between px-0 py-3">
			<div className="flex flex-col">
				<ItemRowTitle>{title}</ItemRowTitle>
				{description && <ItemRowDescription>{description}</ItemRowDescription>}
			</div>

			<div className="min-w-[180px] max-w-[320px] text-right">{children}</div>
		</div>
	)
}

function ItemRowTitle({ children }: { children: ReactNode }) {
	return <span className="font-semibold">{children}</span>
}

function ItemRowDescription({ children }: { children: ReactNode }) {
	return <span className="text-muted-foreground text-sm/snug">{children}</span>
}
