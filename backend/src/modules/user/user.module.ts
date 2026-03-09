import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema, Setting, SettingSchema } from './schemas'
import { UserService } from './user.service'
import { UserController } from './user.controller'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Setting.name, schema: SettingSchema },
		]),
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService, MongooseModule],
})
export class UserModule { }
