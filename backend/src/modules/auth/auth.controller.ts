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
import { GoogleAuthGuard, JwtAuthGuard } from './guards'
import { ApiResponse } from '../../common/interfaces'
import { Request, Response } from 'express'

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
	) {}

	@Post('register')
	async register(
		@Body() dto: RegisterDto,
		@Res({ passthrough: true }) res: Response,
	): Promise<ApiResponse> {
		const data = await this.authService.register(dto)
		const cookieOpts = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		}
		res.cookie('ht_token', data.accessToken, cookieOpts)
		return {
			success: true,
			data: data.user,
			message: 'Registration successful',
		}
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(
		@Body() dto: LoginDto,
		@Res({ passthrough: true }) res: Response,
	): Promise<ApiResponse> {
		const data = await this.authService.login(dto)
		const cookieOpts = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		}
		res.cookie('ht_token', data.accessToken, cookieOpts)
		return { success: true, data: data.user, message: 'Login successful' }
	}

	@Get('google')
	@UseGuards(GoogleAuthGuard)
	googleAuth() {}

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
		const cookieOpts = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		}
		res.cookie('ht_token', data.accessToken, cookieOpts)
		res.redirect(`${frontendUrl}/auth/google/callback`)
	}

	@Post('logout')
	@UseGuards(JwtAuthGuard)
	async logout(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('ht_token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const,
		})
		return { success: true }
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	async me(@Req() req: Request): Promise<ApiResponse> {
		const user = (req as any).user || null
		return { success: true, data: user }
	}
}
