/** localStorage key for the JWT token */
const TOKEN_KEY = 'ht_token'
const USER_KEY = 'ht_user'

export function getToken(): string | null {
	if (typeof window === 'undefined') return null
	return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
	localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
	localStorage.removeItem(TOKEN_KEY)
	localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
	return !!getToken()
}

export function setUser(user: { id: string; email: string }): void {
	localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser(): { id: string; email: string } | null {
	if (typeof window === 'undefined') return null
	const raw = localStorage.getItem(USER_KEY)
	return raw ? JSON.parse(raw) : null
}
