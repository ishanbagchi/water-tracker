import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type WaterLogDocument = HydratedDocument<WaterLog>

@Schema({ timestamps: true })
export class WaterLog {
	@Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
	userId: Types.ObjectId

	@Prop({ required: true, min: 1 })
	amount: number

	/** YYYY-MM-DD string for fast daily aggregation (compound-indexed). */
	@Prop({ required: true })
	date: string

	@Prop({ default: () => new Date() })
	timestamp: Date
}

export const WaterLogSchema = SchemaFactory.createForClass(WaterLog)

// Compound index for high-speed daily aggregation queries.
WaterLogSchema.index({ userId: 1, date: -1 })
