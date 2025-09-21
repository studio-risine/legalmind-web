import Link, { type LinkProps } from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/libs/utils'

interface AnchorProps extends LinkProps {
	children: ReactNode
	className?: string
}

export function Anchor({ children, className, ...props }: AnchorProps) {
	return (
		<Link
			{...props}
			className={cn('font-medium text-primary hover:underline', className)}
		>
			{children}
		</Link>
	)
}
