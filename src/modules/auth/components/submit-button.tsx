'use client'

import { Button } from '@components/ui/button'
import { memo } from 'react'

interface SubmitButtonProps {
	isDisabled: boolean
	isLoading: boolean
	text: string
	loadingText: string
}

export const SubmitButton = memo(function SubmitButton({
	isDisabled,
	isLoading,
	text,
	loadingText,
}: SubmitButtonProps) {
	return (
		<Button type="submit" className="w-full" disabled={isDisabled}>
			{isLoading ? loadingText : text}
		</Button>
	)
})
