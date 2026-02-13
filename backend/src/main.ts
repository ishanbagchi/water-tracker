import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const configService = app.get(ConfigService)

	// Global validation pipe for DTO validation
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: { enableImplicitConversion: true },
		}),
	)

	// CORS configuration
	app.enableCors({
		origin: configService.get<string>(
			'FRONTEND_URL',
			'http://localhost:3000',
		),
		credentials: true,
	})

	// Global API prefix
	app.setGlobalPrefix('api')

	const port = configService.get<number>('PORT', 4000)
	await app.listen(port)

	console.log(`🚀 HydroTrack API running on http://localhost:${port}/api`)
}

bootstrap()
