import {
	Controller,
	Get,
	Post,
	Delete,
	Param,
	Body,
	UseGuards,
	Req,
} from '@nestjs/common'
import { WaterService } from './water.service'
import { LogWaterDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ApiResponse } from '../../common/interfaces'
import { Request } from 'express'

@Controller('water')
@UseGuards(JwtAuthGuard)
export class WaterController {
	constructor(private readonly waterService: WaterService) {}

	@Post('log')
	async logWater(
		@Req() req: Request,
		@Body() dto: LogWaterDto,
	): Promise<ApiResponse> {
		const entry = await this.waterService.logWater(
			(req as any).user.sub,
			dto,
		)
		return { success: true, data: entry, message: 'Water logged' }
	}

	@Get('today')
	async getToday(@Req() req: Request): Promise<ApiResponse> {
		const data = await this.waterService.getToday((req as any).user.sub)
		return { success: true, data }
	}

	@Get('history')
	async getHistory(@Req() req: Request): Promise<ApiResponse> {
		const data = await this.waterService.getHistory((req as any).user.sub)
		return { success: true, data }
	}

	@Delete(':id')
	async deleteEntry(
		@Req() req: Request,
		@Param('id') id: string,
	): Promise<ApiResponse> {
		await this.waterService.deleteEntry((req as any).user.sub, id)
		return { success: true, data: null, message: 'Entry deleted' }
	}
}
