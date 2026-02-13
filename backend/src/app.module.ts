import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { WaterModule } from './modules/water/water.module'

@Module({
	imports: [
		// Global config from .env
		ConfigModule.forRoot({ isGlobal: true }),

		// MongoDB connection
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				uri: config.get<string>(
					'MONGODB_URI',
					'mongodb://localhost:27017/hydrotrack',
				),
			}),
		}),

		// Feature modules
		AuthModule,
		UserModule,
		WaterModule,
	],
})
export class AppModule {}
