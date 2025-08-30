export function SignInForm() {
	return (
		<form className="flex flex-col gap-4">
			<input type="email" placeholder="Email" />
			<input type="password" placeholder="Password" />
			<button type="submit">Sign In</button>
		</form>
	)
}
