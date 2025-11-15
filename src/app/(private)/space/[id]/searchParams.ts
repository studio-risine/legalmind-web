import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server'

export const searchParams = {
	id: parseAsString,
	page: parseAsInteger.withDefault(1),
	pageSize: parseAsInteger.withDefault(20),
	search: parseAsString.withDefault(''),
}

export const loadSearchParams = createLoader(searchParams)
