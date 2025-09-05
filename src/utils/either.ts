export type Either<L, R> = Left<L> | Right<R>

export interface Left<L> {
	readonly _tag: 'Left'
	readonly left: L
}

export interface Right<R> {
	readonly _tag: 'Right'
	readonly right: R
}

export const left = <L>(value: L): Left<L> => ({ _tag: 'Left', left: value })
export const right = <R>(value: R): Right<R> => ({
	_tag: 'Right',
	right: value,
})

export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> =>
	either._tag === 'Left'

export const isRight = <L, R>(either: Either<L, R>): either is Right<R> =>
	either._tag === 'Right'
