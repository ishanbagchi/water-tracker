import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator'
import { LiquidType } from '../schemas'

export class UpdateWaterDto {
	@IsOptional()
	@IsNumber()
	@Min(1, { message: 'Amount must be at least 1' })
	@Max(10_000, { message: 'Amount must be at most 10,000' })
	amount?: number

	@IsOptional()
	@IsEnum(LiquidType)
	liquidType?: LiquidType
}
