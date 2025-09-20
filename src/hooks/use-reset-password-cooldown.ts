'use client'

import { useEffect, useState } from 'react'

const COOLDOWN_DURATION = 60 * 1000 // 1 min
const STORAGE_KEY = 'reset-password-last-request'

interface UseResetPasswordCooldownReturn {
	isOnCooldown: boolean
	remainingTime: number
	canSubmit: boolean
	startCooldown: () => void
}

export function useResetPasswordCooldown(): UseResetPasswordCooldownReturn {
	const [remainingTime, setRemainingTime] = useState(0)
	const [isOnCooldown, setIsOnCooldown] = useState(false)

	useEffect(() => {
		const checkCooldown = () => {
			const lastRequestTime = localStorage.getItem(STORAGE_KEY)

			if (!lastRequestTime) {
				setIsOnCooldown(false)
				setRemainingTime(0)
				return
			}

			const lastRequest = Number.parseInt(lastRequestTime, 10)
			const now = Date.now()
			const timeElapsed = now - lastRequest
			const timeRemaining = COOLDOWN_DURATION - timeElapsed

			if (timeRemaining > 0) {
				setIsOnCooldown(true)
				setRemainingTime(timeRemaining)
			} else {
				setIsOnCooldown(false)
				setRemainingTime(0)
				localStorage.removeItem(STORAGE_KEY)
			}
		}

		checkCooldown()

		const interval = setInterval(() => {
			checkCooldown()
		}, 1000)

		return () => clearInterval(interval)
	}, [])

	const startCooldown = () => {
		const now = Date.now()
		localStorage.setItem(STORAGE_KEY, now.toString())
		setIsOnCooldown(true)
		setRemainingTime(COOLDOWN_DURATION)
	}

	const canSubmit = !isOnCooldown

	return {
		isOnCooldown,
		remainingTime,
		canSubmit,
		startCooldown,
	}
}
