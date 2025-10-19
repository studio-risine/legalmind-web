import { memo, type ReactNode } from 'react'

export const TableCellTextEmpty = memo(() => {
	return (
		<span className="font-medium text-muted-foreground/80 text-sm">
			Não preenchido
		</span>
	)
})

TableCellTextEmpty.displayName = 'TableCellTextEmpty'

export const TableCellText = memo(({ children }: { children: ReactNode }) => {
	return (
		<span className="font-medium text-base text-foreground/80">{children}</span>
	)
})

TableCellText.displayName = 'TableCellText'
