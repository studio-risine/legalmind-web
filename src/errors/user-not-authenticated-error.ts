export class UserNotAuthenticatedError extends Error {
	constructor(message = 'User not authenticated') {
		super(message)
		this.name = 'UserNotAuthenticatedError'
	}
}
