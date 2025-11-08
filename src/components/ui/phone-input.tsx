import { Input } from '@components/ui/input'
import { applyPhoneMask, unformatPhone } from '@utils/phone-mask'
import { forwardRef } from 'react'

interface PhoneInputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
	value?: string
	onChange?: (value: string) => void
	/**
	 * If true, the value returned in onChange will be unformatted (numbers only)
	 * If false, the returned value will have the mask applied
	 * @default false
	 */
	returnUnformatted?: boolean
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
	({ value = '', onChange, returnUnformatted = false, ...props }, ref) => {
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const inputValue = e.target.value
			const maskedValue = applyPhoneMask(inputValue)

			if (onChange) {
				const valueToReturn = returnUnformatted ? unformatPhone(maskedValue) : maskedValue
				onChange(valueToReturn)
			}
		}

		return (
			<Input
				{...props}
				onChange={handleChange}
				placeholder={props.placeholder || ''}
				ref={ref}
				type="tel"
				value={applyPhoneMask(value)}
			/>
		)
	},
)

PhoneInput.displayName = 'PhoneInput'
