function PageContent({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col gap-8 lg:gap-12">{children}</div>
}

export { PageContent }
