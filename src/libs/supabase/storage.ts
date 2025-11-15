/**
 * Supabase Storage configuration and constraints for document uploads
 */

export const STORAGE_CONFIG = {
	allowedMimeTypes: [
		'application/pdf',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
		'image/png',
		'image/jpeg',
	] as const,
	bucket: 'process-documents',
	maxFileSizeBytes: 25 * 1024 * 1024, // 25MB
} as const

export type AllowedMimeType = (typeof STORAGE_CONFIG.allowedMimeTypes)[number]

/**
 * Validates if file meets storage constraints
 * @throws Error with descriptive message if validation fails
 */
export function validateFile(file: File): void {
	if (file.size > STORAGE_CONFIG.maxFileSizeBytes) {
		throw new Error(
			`File size exceeds maximum allowed (${STORAGE_CONFIG.maxFileSizeBytes / 1024 / 1024}MB)`,
		)
	}

	if (!STORAGE_CONFIG.allowedMimeTypes.includes(file.type as AllowedMimeType)) {
		throw new Error(
			`File type not allowed. Accepted: ${STORAGE_CONFIG.allowedMimeTypes.join(', ')}`,
		)
	}
}

/**
 * Generates storage path for process documents
 * @param organizationId - Organization identifier for multi-tenancy isolation
 * @param processId - Process identifier
 * @param filename - Original filename
 */
export function generateStoragePath(
	organizationId: string,
	processId: string,
	filename: string,
): string {
	const timestamp = Date.now()
	const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
	return `${organizationId}/${processId}/${timestamp}-${sanitized}`
}
