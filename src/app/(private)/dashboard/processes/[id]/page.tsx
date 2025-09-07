interface PageProps {
	params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
	const { id } = await params

	return (
		<div>
			<h1>Show {id}</h1>
		</div>
	)
}
