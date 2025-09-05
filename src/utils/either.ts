export type Either<L, R> = Left<L> | Right<R>

export interface Left<L> {
	readonly tag: 'left'
	readonly left: L
}

export interface Right<R> {
	readonly tag: 'right'
	readonly right: R
}

export const left = <L>(value: L): Left<L> => ({ tag: 'left', left: value })
export const right = <R>(value: R): Right<R> => ({
	tag: 'right',
	right: value,
})

export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> =>
	either.tag === 'left'

export const isRight = <L, R>(either: Either<L, R>): either is Right<R> =>
	either.tag === 'right'
