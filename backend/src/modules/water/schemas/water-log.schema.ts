import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export enum LiquidType {
	WATER = 'water',
	MILK = 'milk',
	TEA = 'tea',
	SPORTS_DRINK = 'sports_drink',
	COFFEE = 'coffee',
	JUICE = 'juice',
	SODA = 'soda',
}

export const HYDRATION_FACTOR: Record<LiquidType, number> = {
	[LiquidType.WATER]: 1.0,
	[LiquidType.MILK]: 1.15,
	[LiquidType.TEA]: 0.98,
	[LiquidType.SPORTS_DRINK]: 0.95,
	[LiquidType.COFFEE]: 0.9,
	[LiquidType.JUICE]: 0.85,
	[LiquidType.SODA]: 0.7,
}

export type WaterLogDocument = HydratedDocument<WaterLog>

@Schema({ timestamps: true })
export class WaterLog {
	@Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
	userId: Types.ObjectId

	@Prop({ required: true, min: 1 })
	amount: number

	@Prop({ default: LiquidType.WATER, enum: LiquidType })
	liquidType: LiquidType

	@Prop({ required: true, min: 1 })
	hydratedAmount: number

	@Prop({ required: true })
	date: string

	@Prop({ default: () => new Date() })
	timestamp: Date
}

export const WaterLogSchema = SchemaFactory.createForClass(WaterLog)

WaterLogSchema.index({ userId: 1, date: -1 })
