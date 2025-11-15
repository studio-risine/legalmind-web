import { dataTableConfig } from '@config/data-table'
import { createParser } from 'nuqs/server'
import { z } from 'zod'
import type {
	ExtendedColumnFilter,
	ExtendedColumnSort,
} from '../types/data-table'

const sortingItemSchema = z.object({
	desc: z.boolean(),
	id: z.string(),
})

export const getSortingStateParser = <TData>(
	columnIds?: string[] | Set<string>,
) => {
	const validKeys = columnIds
		? columnIds instanceof Set
			? columnIds
			: new Set(columnIds)
		: null

	return createParser({
		eq: (a, b) =>
			a.length === b.length &&
			a.every(
				(item, index) =>
					item.id === b[index]?.id && item.desc === b[index]?.desc,
			),
		parse: (value) => {
			try {
				const parsed = JSON.parse(value)
				const result = z.array(sortingItemSchema).safeParse(parsed)

				if (!result.success) return null

				if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
					return null
				}

				return result.data as ExtendedColumnSort<TData>[]
			} catch {
				return null
			}
		},
		serialize: (value) => JSON.stringify(value),
	})
}

const filterItemSchema = z.object({
	filterId: z.string(),
	id: z.string(),
	operator: z.enum(dataTableConfig.operators),
	value: z.union([z.string(), z.array(z.string())]),
	variant: z.enum(dataTableConfig.filterVariants),
})

export type FilterItemSchema = z.infer<typeof filterItemSchema>

export const getFiltersStateParser = <TData>(
	columnIds?: string[] | Set<string>,
) => {
	const validKeys = columnIds
		? columnIds instanceof Set
			? columnIds
			: new Set(columnIds)
		: null

	return createParser({
		eq: (a, b) =>
			a.length === b.length &&
			a.every(
				(filter, index) =>
					filter.id === b[index]?.id &&
					filter.value === b[index]?.value &&
					filter.variant === b[index]?.variant &&
					filter.operator === b[index]?.operator,
			),
		parse: (value) => {
			try {
				const parsed = JSON.parse(value)
				const result = z.array(filterItemSchema).safeParse(parsed)

				if (!result.success) return null

				if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
					return null
				}

				return result.data as ExtendedColumnFilter<TData>[]
			} catch {
				return null
			}
		},
		serialize: (value) => JSON.stringify(value),
	})
}
