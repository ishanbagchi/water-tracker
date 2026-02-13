import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
	@Prop({ required: true, unique: true, lowercase: true, trim: true })
	email: string

	@Prop({ required: true })
	password: string

	@Prop({ default: 2000 })
	dailyGoal: number

	@Prop({ default: 'ml', enum: ['ml', 'oz'] })
	unit: string
}

export const UserSchema = SchemaFactory.createForClass(User)
