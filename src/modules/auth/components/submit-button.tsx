'use client'

import { Button } from '@components/ui/button'
import { RiLoader4Fill } from '@remixicon/react'
import { type ComponentProps, memo } from 'react'

interface SubmitButtonProps extends ComponentProps<'button'> {
	isLoading: boolean
	text: string
	textLoading: string
}

export const SubmitButton = memo(function SubmitButton({
	isLoading,
	text,
	textLoading,
	...props
}: SubmitButtonProps) {
	return (
		<Button type="submit" {...props}>
			{isLoading && <RiLoader4Fill className="size-5 animate-spin" />}
			{isLoading ? textLoading : text}
		</Button>
	)
})

SubmitButton.displayName = 'SubmitButton'
