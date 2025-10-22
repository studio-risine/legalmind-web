'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { GetSpacesOutput } from '../actions/get-spaces-action'
import { useSpaces } from '../hooks/use-spaces'

type Space = GetSpacesOutput[number]

interface SpaceContextType {
	spaces: Space[]
	currentSpace: Space | null
	setCurrentSpace: (space: Space) => void
	isLoading: boolean
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined)

export function SpaceProvider({ children }: { children: React.ReactNode }) {
	const { data: spaces = [], isLoading } = useSpaces()
	const [currentSpace, setCurrentSpaceState] = useState<Space | null>(null)

	useEffect(() => {
		const storedSpaceId = localStorage.getItem('currentSpaceId')
		if (storedSpaceId && spaces.length > 0) {
			const space = spaces.find((s) => s.id === storedSpaceId)
			if (space) {
				setCurrentSpaceState(space)
			}
		} else if (spaces.length > 0) {
			setCurrentSpaceState(spaces[0])
		}
	}, [spaces])

	const setCurrentSpace = (space: Space) => {
		localStorage.setItem('currentSpaceId', space.id)
		setCurrentSpaceState(space)
	}

	const value = useMemo(
		() => ({
			spaces,
			currentSpace,
			setCurrentSpace,
			isLoading,
		}),
		[spaces, currentSpace, isLoading],
	)

	return <SpaceContext.Provider value={value}>{children}</SpaceContext.Provider>
}

export function useCurrentSpace() {
	const context = useContext(SpaceContext)
	if (context === undefined) {
		throw new Error('useCurrentSpace must be used within a SpaceProvider')
	}
	return context
}
