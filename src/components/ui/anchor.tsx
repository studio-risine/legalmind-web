import Link, { type LinkProps } from 'next/link'

import type { ReactNode } from 'react'

interface AnchorProps extends LinkProps {
	children: ReactNode
}

export function Anchor({ children, ...props }: AnchorProps) {
	return (
		<Link {...props} className="font-medium text-primary hover:underline">
			{children}
		</Link>
	)
}
