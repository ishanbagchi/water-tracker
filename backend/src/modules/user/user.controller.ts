import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common'
import { UserService } from './user.service'
import { UpdateSettingsDto, ChangePasswordDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ApiResponse } from '../../common/interfaces'
import { Request } from 'express'

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('me')
	async getProfile(@Req() req: Request): Promise<ApiResponse> {
		const user = await this.userService.findById((req as any).user.sub)
		return { success: true, data: user }
	}

	@Patch('settings')
	async updateSettings(
		@Req() req: Request,
		@Body() dto: UpdateSettingsDto,
	): Promise<ApiResponse> {
		const user = await this.userService.updateSettings(
			(req as any).user.sub,
			dto,
		)
		return { success: true, data: user, message: 'Settings updated' }
	}

	@Patch('password')
	async changePassword(
		@Req() req: Request,
		@Body() dto: ChangePasswordDto,
	): Promise<ApiResponse> {
		await this.userService.changePassword((req as any).user.sub, dto)
		return {
			success: true,
			data: null,
			message: 'Password changed successfully',
		}
	}
}
