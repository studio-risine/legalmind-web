'use client'

import { getSpacesAction } from '@modules/space/actions/get-spaces-action'
import { useQuery } from '@tanstack/react-query'

export const useSpaces = () => {
	return useQuery({
		queryKey: ['spaces'],
		queryFn: async () => getSpacesAction(),
	})
}
