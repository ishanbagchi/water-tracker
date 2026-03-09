import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'
import { User } from './user.schema'

export type SettingDocument = HydratedDocument<Setting>

@Schema({ timestamps: true })
export class Setting {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: User | string

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
}

export const SettingSchema = SchemaFactory.createForClass(Setting)
