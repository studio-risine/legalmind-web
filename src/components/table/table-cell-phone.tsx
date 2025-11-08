import { formatPhoneWithMask, unformatPhone } from '@utils/phone-mask'
import Link from 'next/link'
import { memo } from 'react'
import { TableCellText } from './table-cell-text'

interface TableCellPhoneProps {
	phone: string
}

export const TableCellPhone = memo(({ phone }: TableCellPhoneProps) => {
	const formattedPhone = formatPhoneWithMask(phone)

	const cleanPhoneForHref = unformatPhone(phone)
	return (
		<TableCellText>
			<Link
				className="hover:underline"
				href={`tel:+55${cleanPhoneForHref}`}
				title={`Ligar para ${formattedPhone}`}
			>
				{formattedPhone}
			</Link>
		</TableCellText>
	)
})

TableCellPhone.displayName = 'TableCellPhone'
