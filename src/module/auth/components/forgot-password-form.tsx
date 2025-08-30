export function ForgotPasswordForm() {
	return (
		<form className="flex flex-col gap-4">
			<input type="email" placeholder="Email" />
			<button type="submit">Send Reset Link</button>
		</form>
	)
}
