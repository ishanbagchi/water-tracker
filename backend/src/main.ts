import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { setupApp } from './setup-app'

async function bootstrap() {
	const logger = new Logger('Bootstrap')

	const app = await NestFactory.create(AppModule)
	const configService = app.get(ConfigService)

	setupApp(app)

	const port = configService.get<number>('PORT', 4000)
	await app.listen(port)

	const url = await app.getUrl()
	logger.log(`🚀 HydroTrack API is running on: ${url}/api`)
}

bootstrap()
