/* ── Shared TypeScript interfaces for the frontend ── */

/** Standard API envelope returned by the backend. */
export interface ApiResponse<T = unknown> {
	success: boolean
	data: T
	message?: string
}

/** User profile coming from GET /user/me */
export interface User {
	_id: string
	email: string
	dailyGoal: number
	unit: 'ml' | 'oz'
	createdAt: string
}

/** Single water log entry. */
export interface WaterEntry {
	_id: string
	userId: string
	amount: number
	date: string
	timestamp: string
}

/** Response from GET /water/today */
export interface TodayData {
	date: string
	total: number
	entries: WaterEntry[]
}

/** Single day in the 7-day history. */
export interface HistoryDay {
	date: string
	total: number
}

/** Auth response from POST /auth/login & /auth/register */
export interface AuthResponse {
	accessToken: string
	user: { id: string; email: string }
}
