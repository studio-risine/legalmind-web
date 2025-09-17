import { createClient } from '@/libs/supabase/server'

export default async function HomePage() {
	const supabase = await createClient()
	const {
		data: { session },
	} = await supabase.auth.getSession()

	return (
		<div>
			<h1>Home</h1>
			<pre>{JSON.stringify(session, null, 2)}</pre>
		</div>
	)
}
