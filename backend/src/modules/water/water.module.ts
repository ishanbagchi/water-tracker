import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { WaterLog, WaterLogSchema } from './schemas'
import { WaterService } from './water.service'
import { WaterController } from './water.controller'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: WaterLog.name, schema: WaterLogSchema },
		]),
	],
	controllers: [WaterController],
	providers: [WaterService],
	exports: [WaterService],
})
export class WaterModule {}
