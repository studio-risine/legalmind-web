/**
 * Return as initials of a name or array of names to use as fallback in avatars
 * @param name - String or array of strings representing the(s) name(s)
 * @returns String with at most 2 characters representing the initials
 */
export function getAvatarInitials(name: string | string[]): string {
	if (!name) return ''

	const nameString = Array.isArray(name) ? name.join(' ') : name

	const words = nameString
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0)

	if (words.length === 0) return ''

	if (words.length === 1) {
		return words[0].charAt(0).toUpperCase()
	}

	return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
}
