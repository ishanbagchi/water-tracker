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
}
