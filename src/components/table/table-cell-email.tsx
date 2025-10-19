import Link from 'next/link'
import { memo } from 'react'
import { TableCellText } from './table-cell-text'

export const TableCellEmail = memo(({ email }: { email: string }) => {
	return (
		<TableCellText>
			<Link href={`mailto:${email}`} title={`Enviar um e-mail para ${email}`}>
				{email}
			</Link>
		</TableCellText>
	)
})

TableCellEmail.displayName = 'TableCellEmail'
