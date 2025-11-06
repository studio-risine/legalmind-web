export class ResourceNotFoundError extends Error {
	constructor(message = 'Resource not found') {
		super(message)
	}
}
