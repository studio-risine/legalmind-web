'use client'

import { Alert, AlertDescription } from '@components/ui/alert'
import { RiTimeLine } from '@remixicon/react'
import { formatTime } from '@/utils/formatters'

export function CooldownTimer({ remainingTime }: { remainingTime: number }) {
	const timer = formatTime(remainingTime)

	return (
		<Alert>
			<RiTimeLine className="h-4 w-4" />
			<AlertDescription>
				Aguarde {timer} antes de solicitar um novo email de recuperação.
			</AlertDescription>
		</Alert>
	)
}
