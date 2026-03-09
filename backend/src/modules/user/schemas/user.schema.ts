import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
	@Prop({ required: true, unique: true, lowercase: true, trim: true })
	email: string

	@Prop()
	password: string

	@Prop({ sparse: true })
	googleId: string
}

export const UserSchema = SchemaFactory.createForClass(User)
