import { createLoader, parseAsString } from 'nuqs/server'

export const onboardingSearchParams = {
	accountId: parseAsString.withDefault(''),
}

export const loadSearchParams = createLoader(onboardingSearchParams)
