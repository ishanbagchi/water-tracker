import {
	Controller,
	Post,
	Get,
	Body,
	HttpCode,
	HttpStatus,
	UseGuards,
	Req,
	Res,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { RegisterDto, LoginDto } from './dto'
import { GoogleAuthGuard } from './guards'
import { ApiResponse } from '../../common/interfaces'
import { Request, Response } from 'express'

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
	) {}

	@Post('register')
	async register(@Body() dto: RegisterDto): Promise<ApiResponse> {
		const data = await this.authService.register(dto)
		return { success: true, data, message: 'Registration successful' }
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Body() dto: LoginDto): Promise<ApiResponse> {
		const data = await this.authService.login(dto)
		return { success: true, data, message: 'Login successful' }
	}

	@Get('google')
	@UseGuards(GoogleAuthGuard)
	googleAuth() {
		// Guard redirects to Google
	}

	@Get('google/callback')
	@UseGuards(GoogleAuthGuard)
	async googleCallback(@Req() req: Request, @Res() res: Response) {
		const { googleId, email } = req.user as {
			googleId: string
			email: string
		}
		const data = await this.authService.googleLogin(googleId, email)
		const frontendUrl = this.configService.get<string>(
			'FRONTEND_URL',
			'http://localhost:3000',
		)
		res.redirect(
			`${frontendUrl}/auth/google/callback?token=${data.accessToken}&userId=${data.user.id}&email=${encodeURIComponent(data.user.email)}`,
		)
	}
}
