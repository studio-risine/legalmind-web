'use client'

import { Button } from '@components/ui/button'
import { RiExpandDiagonalLine } from '@remixicon/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo, type ReactNode, useCallback } from 'react'

interface TableCellPrimaryProps {
	title: string
	link: string
}

export const TableCellPrimary = memo(
	({ link, title }: TableCellPrimaryProps) => {
		const router = useRouter()

		const handleRowClick = useCallback(
			(link: string) => {
				router.push(link)
			},
			[link],
		)

		return (
			<div className="group relative">
				{link ? (
					<Link href={link}>
						<TableCellLabel>{title}</TableCellLabel>
					</Link>
				) : (
					<TableCellLabel>{title}</TableCellLabel>
				)}

				<div className="-top-1 invisible absolute right-0 z-10 rounded duration-100 ease-in-out group-hover:visible">
					<Button
						onClick={() => handleRowClick(link)}
						size="sm"
						variant="secondary"
					>
						<RiExpandDiagonalLine />
						Open
					</Button>
				</div>
			</div>
		)
	},
)

TableCellPrimary.displayName = 'TableCellPrimary'

function TableCellLabel({ children }: { children: ReactNode }) {
	return (
		<div className="max-w-[320px] truncate">
			<span className="truncate font-semibold text-base text-foreground">
				{children}
			</span>
		</div>
	)
}

TableCellLabel.displayName = 'TableCellLabel'
