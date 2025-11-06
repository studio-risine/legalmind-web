import { memo, type ReactNode } from 'react'

export const TableCellName = memo(({ children }: { children: ReactNode }) => {
	return (
		<span className="font-semibold text-base text-foreground">{children}</span>
	)
})

TableCellName.displayName = 'TableCellText'
