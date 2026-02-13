import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { WaterLog, WaterLogDocument } from './schemas'
import { LogWaterDto } from './dto'
import { getTodayDateString, getLastNDays } from '../../common/utils'

@Injectable()
export class WaterService {
	constructor(
		@InjectModel(WaterLog.name)
		private waterLogModel: Model<WaterLogDocument>,
	) {}

	/** Add a new water intake entry for today. */
	async logWater(
		userId: string,
		dto: LogWaterDto,
	): Promise<WaterLogDocument> {
		return this.waterLogModel.create({
			userId: new Types.ObjectId(userId),
			amount: dto.amount,
			date: getTodayDateString(),
			timestamp: new Date(),
		})
	}

	/** Get today's total consumption and individual entries. */
	async getToday(userId: string) {
		const date = getTodayDateString()
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
		const objectId = new Types.ObjectId(userId)
		const dates = getLastNDays(7)

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
