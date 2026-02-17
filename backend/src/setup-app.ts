import { INestApplication, ValidationPipe, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as cookieParser from 'cookie-parser'

export function setupApp(app: INestApplication): void {
	const logger = new Logger('AppSetup')
	const configService = app.get(ConfigService)

	app.setGlobalPrefix('api')
	app.use(cookieParser())

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: { enableImplicitConversion: true },
		}),
	)

	const frontendUrl = configService.get<string>(
		'FRONTEND_URL',
		'http://localhost:3000',
	)

	app.enableCors({
		origin: frontendUrl,
		credentials: true,
	})

	logger.log(`CORS enabled for: ${frontendUrl}`)
}
