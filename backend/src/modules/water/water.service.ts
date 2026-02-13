import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { WaterLog, WaterLogDocument } from './schemas'
import { LogWaterDto } from './dto'
import { getTodayDateString, getLastNDays } from '../../common/utils'
import { UserService } from '../user/user.service'

@Injectable()
export class WaterService {
	constructor(
		@InjectModel(WaterLog.name)
		private waterLogModel: Model<WaterLogDocument>,
		private userService: UserService,
	) {}

	/** Look up the user's dayResetHour and timezone. */
	private async getUserDatePrefs(
		userId: string,
	): Promise<{ resetHour: number; timezone: string }> {
		const user = await this.userService.findById(userId)
		return {
			resetHour: (user as any).dayResetHour ?? 0,
			timezone: (user as any).timezone ?? 'UTC',
		}
	}

	/** Add a new water intake entry for today. */
	async logWater(
		userId: string,
		dto: LogWaterDto,
	): Promise<WaterLogDocument> {
		const { resetHour, timezone } = await this.getUserDatePrefs(userId)
		return this.waterLogModel.create({
			userId: new Types.ObjectId(userId),
			amount: dto.amount,
			date: getTodayDateString(resetHour, timezone),
			timestamp: new Date(),
		})
	}

	/** Get today's total consumption and individual entries. */
	async getToday(userId: string) {
		const { resetHour, timezone } = await this.getUserDatePrefs(userId)
		const date = getTodayDateString(resetHour, timezone)
		const objectId = new Types.ObjectId(userId)

		const [entries, aggregation] = await Promise.all([
			this.waterLogModel
				.find({ userId: objectId, date })
				.sort({ timestamp: -1 })
				.lean(),
			this.waterLogModel.aggregate([
				{ $match: { userId: objectId, date } },
				{ $group: { _id: null, total: { $sum: '$amount' } } },
			]),
		])

		const total = aggregation.length > 0 ? aggregation[0].total : 0

		return { date, total, entries }
	}

	/** Get aggregated daily totals for the last 7 days. */
	async getHistory(userId: string) {
		const { resetHour, timezone } = await this.getUserDatePrefs(userId)
		const objectId = new Types.ObjectId(userId)
		const dates = getLastNDays(7, resetHour, timezone)

		const aggregation = await this.waterLogModel.aggregate([
			{ $match: { userId: objectId, date: { $in: dates } } },
			{ $group: { _id: '$date', total: { $sum: '$amount' } } },
			{ $sort: { _id: 1 } },
		])

		// Fill in zero-value days to ensure a complete 7-day array
		const historyMap = new Map(
			aggregation.map((d: { _id: string; total: number }) => [
				d._id,
				d.total,
			]),
		)

		return dates
			.map((date) => ({ date, total: historyMap.get(date) ?? 0 }))
			.reverse() // chronological order (oldest → newest)
	}

	/** Get entries and total for a specific date. */
	async getByDate(userId: string, date: string) {
		const objectId = new Types.ObjectId(userId)

		const [entries, aggregation] = await Promise.all([
			this.waterLogModel
				.find({ userId: objectId, date })
				.sort({ timestamp: -1 })
				.lean(),
			this.waterLogModel.aggregate([
				{ $match: { userId: objectId, date } },
				{ $group: { _id: null, total: { $sum: '$amount' } } },
			]),
		])

		const total = aggregation.length > 0 ? aggregation[0].total : 0

		return { date, total, entries }
	}

	/** Get aggregated daily totals for every day in a given month. */
	async getMonthHistory(userId: string, year: number, month: number) {
		const objectId = new Types.ObjectId(userId)
		const startDate = `${year}-${String(month).padStart(2, '0')}-01`
		const daysInMonth = new Date(year, month, 0).getDate()
		const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

		const aggregation = await this.waterLogModel.aggregate([
			{
				$match: {
					userId: objectId,
					date: { $gte: startDate, $lte: endDate },
				},
			},
			{ $group: { _id: '$date', total: { $sum: '$amount' } } },
			{ $sort: { _id: 1 } },
		])

		// Build a map for quick lookup
		const dayMap = new Map(
			aggregation.map((d: { _id: string; total: number }) => [
				d._id,
				d.total,
			]),
		)

		// Return all days in the month with totals
		const days = []
		for (let d = 1; d <= daysInMonth; d++) {
			const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
			days.push({ date: dateStr, total: dayMap.get(dateStr) ?? 0 })
		}

		return { year, month, days }
	}

	/** Add a water intake entry for a specific date. */
	async logWaterForDate(
		userId: string,
		date: string,
		dto: LogWaterDto,
	): Promise<WaterLogDocument> {
		return this.waterLogModel.create({
			userId: new Types.ObjectId(userId),
			amount: dto.amount,
			date,
			timestamp: new Date(),
		})
	}

	/** Delete a specific water log entry (undo). */
	async deleteEntry(userId: string, entryId: string): Promise<void> {
		const result = await this.waterLogModel.findOneAndDelete({
			_id: new Types.ObjectId(entryId),
			userId: new Types.ObjectId(userId),
		})
		if (!result) {
			throw new NotFoundException('Entry not found')
		}
	}

	/**
	 * Calculate current streak, longest streak, and earned badges.
	 * A "streak day" is any day where total intake >= daily goal.
	 */
	async getStreaks(userId: string) {
		const user = await this.userService.findById(userId)
		const goal = (user as any).dailyGoal ?? 2000
		const objectId = new Types.ObjectId(userId)
		const { resetHour, timezone } = await this.getUserDatePrefs(userId)
		const today = getTodayDateString(resetHour, timezone)

		// Fetch all days that have any logs, grouped & summed, ordered desc
		const aggregation = await this.waterLogModel.aggregate([
			{ $match: { userId: objectId } },
			{ $group: { _id: '$date', total: { $sum: '$amount' } } },
			{ $sort: { _id: -1 } },
		])

		// Build a set of "goal-met" dates
		const goalMetDates = new Set<string>(
			aggregation
				.filter((d: { _id: string; total: number }) => d.total >= goal)
				.map((d: { _id: string }) => d._id),
		)

		// ── Current streak (consecutive days ending today or yesterday) ──
		let currentStreak = 0
		let cursor = new Date(today + 'T12:00:00Z')

		// If today hasn't met goal yet, start checking from yesterday
		if (!goalMetDates.has(today)) {
			cursor.setUTCDate(cursor.getUTCDate() - 1)
		}

		while (goalMetDates.has(cursor.toISOString().split('T')[0])) {
			currentStreak++
			cursor.setUTCDate(cursor.getUTCDate() - 1)
		}

		// ── Longest streak ──
		let longestStreak = 0
		let tempStreak = 0
		// Sort dates ascending for longest-streak calc
		const sortedDates = [...goalMetDates].sort()
		for (let i = 0; i < sortedDates.length; i++) {
			if (i === 0) {
				tempStreak = 1
			} else {
				const prev = new Date(sortedDates[i - 1] + 'T12:00:00Z')
				const curr = new Date(sortedDates[i] + 'T12:00:00Z')
				const diffDays = Math.round(
					(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
				)
				tempStreak = diffDays === 1 ? tempStreak + 1 : 1
			}
			longestStreak = Math.max(longestStreak, tempStreak)
		}

		// ── Total goal-met days ──
		const totalGoalDays = goalMetDates.size

		// ── Badges ──
		const badges = []

		// Streak badges
		if (currentStreak >= 3)
			badges.push({
				id: 'streak-3',
				name: 'On Fire',
				emoji: '🔥',
				description: '3-day streak',
			})
		if (currentStreak >= 7)
			badges.push({
				id: 'streak-7',
				name: 'Week Warrior',
				emoji: '⚡',
				description: '7-day streak',
			})
		if (currentStreak >= 14)
			badges.push({
				id: 'streak-14',
				name: 'Unstoppable',
				emoji: '💪',
				description: '14-day streak',
			})
		if (currentStreak >= 30)
			badges.push({
				id: 'streak-30',
				name: 'Monthly Master',
				emoji: '👑',
				description: '30-day streak',
			})

		// Total days badges
		if (totalGoalDays >= 1)
			badges.push({
				id: 'first-goal',
				name: 'First Drop',
				emoji: '💧',
				description: 'First goal met',
			})
		if (totalGoalDays >= 10)
			badges.push({
				id: 'days-10',
				name: 'Hydration Habit',
				emoji: '🌊',
				description: '10 goals met',
			})
		if (totalGoalDays >= 50)
			badges.push({
				id: 'days-50',
				name: 'Water Champion',
				emoji: '🏆',
				description: '50 goals met',
			})
		if (totalGoalDays >= 100)
			badges.push({
				id: 'days-100',
				name: 'Ocean Master',
				emoji: '🐳',
				description: '100 goals met',
			})

		// Longest streak badges
		if (longestStreak >= 7)
			badges.push({
				id: 'best-7',
				name: 'Week Record',
				emoji: '📅',
				description: 'Best streak: 7+ days',
			})
		if (longestStreak >= 30)
			badges.push({
				id: 'best-30',
				name: 'Month Record',
				emoji: '🗓️',
				description: 'Best streak: 30+ days',
			})

		return {
			currentStreak,
			longestStreak,
			totalGoalDays,
			badges,
		}
	}

	/**
	 * Get aggregate stats: total logged, average daily, best day,
	 * goal-hit rate, and per-day breakdown for the requested period.
	 */
	async getStats(userId: string, period: 'week' | 'month' | 'all' = 'week') {
		const user = await this.userService.findById(userId)
		const goal = (user as any).dailyGoal ?? 2000
		const objectId = new Types.ObjectId(userId)
		const { resetHour, timezone } = await this.getUserDatePrefs(userId)
		const today = getTodayDateString(resetHour, timezone)

		// Determine date range
		let startDate: string
		if (period === 'week') {
			const d = new Date(today + 'T12:00:00Z')
			d.setUTCDate(d.getUTCDate() - 6)
			startDate = d.toISOString().split('T')[0]
		} else if (period === 'month') {
			const d = new Date(today + 'T12:00:00Z')
			d.setUTCDate(d.getUTCDate() - 29)
			startDate = d.toISOString().split('T')[0]
		} else {
			startDate = '2000-01-01' // effectively "all time"
		}

		const matchStage: any = { userId: objectId }
		if (period !== 'all') {
			matchStage.date = { $gte: startDate, $lte: today }
		}

		const aggregation = await this.waterLogModel.aggregate([
			{ $match: matchStage },
			{ $group: { _id: '$date', total: { $sum: '$amount' } } },
			{ $sort: { _id: 1 } },
		])

		if (aggregation.length === 0) {
			return {
				period,
				totalLogged: 0,
				averageDaily: 0,
				bestDay: { date: today, total: 0 },
				goalHitRate: 0,
				daysTracked: 0,
				daysGoalMet: 0,
			}
		}

		const totalLogged = aggregation.reduce(
			(sum: number, d: { total: number }) => sum + d.total,
			0,
		)
		const daysTracked = aggregation.length
		const averageDaily = Math.round(totalLogged / daysTracked)
		const bestDay = aggregation.reduce(
			(
				best: { _id: string; total: number },
				d: { _id: string; total: number },
			) => (d.total > best.total ? d : best),
			aggregation[0],
		)
		const daysGoalMet = aggregation.filter(
			(d: { total: number }) => d.total >= goal,
		).length
		const goalHitRate = Math.round((daysGoalMet / daysTracked) * 100)

		return {
			period,
			totalLogged,
			averageDaily,
			bestDay: { date: bestDay._id, total: bestDay.total },
			goalHitRate,
			daysTracked,
			daysGoalMet,
		}
	}
}
