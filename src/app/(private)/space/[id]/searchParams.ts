import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server'

export const searchParams = {
	id: parseAsString,
	search: parseAsString.withDefault(''),
	page: parseAsInteger.withDefault(1),
	pageSize: parseAsInteger.withDefault(20),
}

export const loadSearchParams = createLoader(searchParams)
