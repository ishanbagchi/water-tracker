/** Standard API envelope returned by the backend. */
export interface ApiResponse<T = unknown> {
	success: boolean
	data: T
	message?: string
}

export type LiquidType =
	| 'water'
	| 'milk'
	| 'tea'
	| 'sports_drink'
	| 'coffee'
	| 'juice'
	| 'soda'

export const HYDRATION_FACTOR: Record<LiquidType, number> = {
	water: 1.0,
	milk: 1.15,
	tea: 0.98,
	sports_drink: 0.95,
	coffee: 0.9,
	juice: 0.85,
	soda: 0.7,
}

export interface LiquidMeta {
	label: string
	emoji: string
	factor: number
	description: string
}

export const LIQUID_META: Record<LiquidType, LiquidMeta> = {
	water: {
		label: 'Water',
		emoji: '💧',
		factor: 1.0,
		description: 'Pure water — the gold standard for hydration.',
	},
	milk: {
		label: 'Milk',
		emoji: '🥛',
		factor: 1.15,
		description:
			'Electrolytes and protein slow gastric emptying, retaining more fluid than water.',
	},
	tea: {
		label: 'Tea',
		emoji: '🍵',
		factor: 0.98,
		description:
			'Negligible diuretic effect for regular drinkers; nearly as hydrating as water.',
	},
	sports_drink: {
		label: 'Sports Drink',
		emoji: '🏃',
		factor: 0.95,
		description: 'Balanced electrolytes designed to maximise absorption.',
	},
	coffee: {
		label: 'Coffee',
		emoji: '☕',
		factor: 0.9,
		description:
			'Mild diuresis from caffeine, but still highly hydrating for habitual drinkers.',
	},
	juice: {
		label: 'Juice',
		emoji: '🧃',
		factor: 0.85,
		description:
			'High sugar concentration causes osmotic water loss in the gut.',
	},
	soda: {
		label: 'Soda',
		emoji: '🥤',
		factor: 0.7,
		description: 'High sugar and carbonation reduce net fluid retention.',
	},
}

export type Unit = 'ml' | 'oz'

/** User profile coming from GET /user/me */
export interface User {
	_id: string
	email: string
	dailyGoal: number
	unit: Unit
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
	liquidType: LiquidType
	hydratedAmount: number
	date: string
	timestamp: string
}

/** Response from GET /water/today */
export interface TodayData {
	date: string
	total: number
	entries: WaterEntry[]
}

export interface LiquidBreakdown {
	liquidType: LiquidType
	total: number
}

/** Single day in the 7-day history. */
export interface HistoryDay {
	date: string
	total: number
	byType: LiquidBreakdown[]
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
