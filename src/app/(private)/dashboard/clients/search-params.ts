import { createLoader, parseAsFloat, parseAsString } from 'nuqs/server'

export const searchParams = {
	name: parseAsString.withDefault(''),
	page: parseAsFloat.withDefault(1),
	perPage: parseAsFloat.withDefault(10),
}

export const loadSearchParams = createLoader(searchParams)
