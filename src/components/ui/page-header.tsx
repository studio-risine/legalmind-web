function PageHeader({ children }: { children: React.ReactNode }) {
	return <div className="flex items-center justify-between">{children}</div>
}

function PageHeaderTitle({ children }: { children: React.ReactNode }) {
	return <h1 className="font-bold text-2xl">{children}</h1>
}

export { PageHeader, PageHeaderTitle }
