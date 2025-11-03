export function safeLocalStorageGetItem<T>(key: string): T | null {
	try {
		const data = localStorage.getItem(key)

		if (!data) {
			return null
		}

		return JSON.parse(data)
	} catch {
		return null
	}
}

export function safeSessionStorageGetItem<T>(key: string): T | null {
	try {
		const data = sessionStorage.getItem(key)

		if (!data) {
			return null
		}

		return JSON.parse(data)
	} catch {
		return null
	}
}
