import { cn } from '@libs/utils'
import { cva } from 'class-variance-authority'

const MainContentVariants = cva(
	'flex flex-col px-6 py-6 md:py-10 lg:py-14 w-full mx-auto gap-4 lg:gap-10',
	{
		variants: {
			size: {
				default: 'max-w-3xl',
				sm: 'max-w-2xl',
				lg: 'max-w-4xl',
				xl: 'max-w-6xl',
				'2xl': 'max-w-7xl',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
)

export function MainContent({
	children,
	size,
	className,
}: {
	children: React.ReactNode
	size?: 'default' | 'sm' | 'lg' | 'xl' | '2xl'
	className?: string
}) {
	return (
		<main className={cn(MainContentVariants({ size }), className)}>
			{children}
		</main>
	)
}
