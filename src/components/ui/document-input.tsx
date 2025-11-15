import { Input } from '@components/ui/input'
import { applyDocumentMask, unformatDocument } from '@utils/document-mask'
import { forwardRef } from 'react'

interface DocumentInputProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		'onChange' | 'value'
	> {
	value?: string
	onChange?: (value: string) => void
	/**
	 * If true, the value returned in onChange will be unformatted (numbers only)
	 * If false, the returned value will have the mask applied
	 * @default false
	 */
	returnUnformatted?: boolean
}

export const DocumentInput = forwardRef<HTMLInputElement, DocumentInputProps>(
	({ value = '', onChange, returnUnformatted = false, ...props }, ref) => {
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const inputValue = e.target.value
			const maskedValue = applyDocumentMask(inputValue)

			if (onChange) {
				const valueToReturn = returnUnformatted
					? unformatDocument(maskedValue)
					: maskedValue
				onChange(valueToReturn)
			}
		}

		return (
			<Input
				{...props}
				onChange={handleChange}
				placeholder={props.placeholder || ''}
				ref={ref}
				type="text"
				value={applyDocumentMask(value)}
			/>
		)
	},
)

DocumentInput.displayName = 'DocumentInput'
