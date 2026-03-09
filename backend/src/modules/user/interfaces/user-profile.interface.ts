import { Types } from 'mongoose'

export interface UserProfile {
	_id: Types.ObjectId
	email: string
	googleId?: string
	createdAt?: Date
	updatedAt?: Date
	__v?: number
	dailyGoal?: number
	unit?: string
	quickAddAmounts?: number[]
	dayResetHour?: number
	timezone?: string
}

export interface SettingFields {
	_id: Types.ObjectId
	userId: Types.ObjectId
	createdAt?: Date
	updatedAt?: Date
	__v?: number
	dailyGoal: number
	unit: string
	quickAddAmounts: number[]
	dayResetHour: number
	timezone: string
}
