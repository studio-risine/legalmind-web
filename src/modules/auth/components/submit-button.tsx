'use client'

import { Button } from '@components/ui/button'
import { RiLoader4Fill } from '@remixicon/react'
import { memo } from 'react'

interface SubmitButtonProps {
	isDisabled: boolean
	isLoading: boolean
	text: string
}

export const SubmitButton = memo(function SubmitButton({
	isDisabled,
	isLoading,
	text,
}: SubmitButtonProps) {
	return (
		<Button type="submit" className="w-full" disabled={isDisabled}>
			{isLoading ? <RiLoader4Fill className="size-5 animate-spin" /> : text}
		</Button>
	)
})
