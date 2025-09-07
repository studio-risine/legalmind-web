export function Container({ children }: { children: React.ReactNode }) {
	return (
		<div className="container mx-auto max-w-[1200px] px-4 md:px-0">
			{children}
		</div>
	)
}
