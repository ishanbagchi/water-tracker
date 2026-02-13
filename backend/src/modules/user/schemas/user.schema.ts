import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
	@Prop({ required: true, unique: true, lowercase: true, trim: true })
	email: string

	@Prop()
	password: string

	@Prop({ default: 2000 })
	dailyGoal: number

	@Prop({ default: 'ml', enum: ['ml', 'oz'] })
	unit: string

	@Prop({ type: [Number], default: [250, 500, 750] })
	quickAddAmounts: number[]

	@Prop({ default: 0, min: 0, max: 23 })
	dayResetHour: number

	@Prop({ default: 'UTC' })
	timezone: string

	@Prop({ sparse: true })
	googleId: string
}

export const UserSchema = SchemaFactory.createForClass(User)
