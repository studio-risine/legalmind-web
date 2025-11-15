'use client'

import { useEffect } from 'react'

interface ErrorBoundaryProps {
	error: Error & { digest?: string }
	reset: () => void
}

/**
 * Error boundary for process module routes
 * Catches and displays errors in a user-friendly way
 */
export default function ProcessError({ error, reset }: ErrorBoundaryProps) {
	useEffect(() => {
		// Log error to monitoring service
		console.error('Process module error:', error)
	}, [error])

	return (
		<div className="container mx-auto py-8">
			<div className="rounded-lg border border-destructive bg-destructive/10 p-6">
				<h2 className="mb-2 font-semibold text-destructive text-lg">Something went wrong</h2>
				<p className="mb-4 text-muted-foreground text-sm">
					An error occurred while processing your request. Please try again.
				</p>
				{error.digest && (
					<p className="mb-4 font-mono text-muted-foreground text-xs">Error ID: {error.digest}</p>
				)}
				<button
					className="rounded-md bg-destructive px-4 py-2 font-medium text-destructive-foreground text-sm hover:bg-destructive/90"
					onClick={reset}
					type="button"
				>
					Try again
				</button>
			</div>
		</div>
	)
}
