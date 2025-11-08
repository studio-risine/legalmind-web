'use client'

import { RiMoonFill, RiSunFill } from '@remixicon/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from './button'

export function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return (
			<Button disabled size="icon" variant="outline">
				<RiSunFill className="h-4 w-4" />
				<span className="sr-only">Toggle theme</span>
			</Button>
		)
	}

	return (
		<Button
			onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
			size="icon"
			variant="outline"
		>
			{theme === 'light' ? <RiMoonFill className="h-4 w-4" /> : <RiSunFill className="h-4 w-4" />}
			<span className="sr-only">Toggle theme</span>
		</Button>
	)
}
