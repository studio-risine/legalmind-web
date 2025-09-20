import Link from 'next/link'

export default async function HomePage() {
	return (
		<div>
			<h1>Home</h1>
			<Link href="/account/login">Login</Link>
			<Link href="/account/register">Register</Link>
		</div>
	)
}
