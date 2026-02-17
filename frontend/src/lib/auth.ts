const USER_KEY = 'ht_user'

export function removeUserToken(): void {
	if (typeof window === 'undefined') return
	localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
	return !!getUser()
}

export function getUser() {
	if (typeof window === 'undefined') return null
	const raw = localStorage.getItem(USER_KEY)

	if (!raw || raw === 'undefined' || raw === 'null') {
		return null
	}

	try {
		return JSON.parse(raw)
	} catch (e) {
		console.error('Failed to parse user from local storage', e)
		localStorage.removeItem(USER_KEY)
		return null
	}
}

export function setUser(user: any) {
	if (typeof window === 'undefined') return

	if (!user) {
		localStorage.removeItem(USER_KEY)
		return
	}

	localStorage.setItem(USER_KEY, JSON.stringify(user))
}
