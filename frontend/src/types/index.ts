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
	quickAddAmounts: number[]
	dayResetHour: number
	timezone: string
	googleId?: string
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

/** Response from GET /water/month/:year/:month */
export interface MonthData {
	year: number
	month: number
	days: HistoryDay[]
}

/** Auth response from POST /auth/login & /auth/register */
export interface AuthResponse {
	accessToken: string
	user: { id: string; email: string }
}

/** A single badge earned by the user. */
export interface Badge {
	id: string
	name: string
	emoji: string
	description: string
}

/** Response from GET /water/streaks */
export interface StreaksData {
	currentStreak: number
	longestStreak: number
	totalGoalDays: number
	badges: Badge[]
}

/** Response from GET /water/stats */
export interface StatsData {
	period: 'week' | 'month' | 'all'
	totalLogged: number
	averageDaily: number
	bestDay: { date: string; total: number }
	goalHitRate: number
	daysTracked: number
	daysGoalMet: number
}
