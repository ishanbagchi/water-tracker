import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator'

export class UpdateSettingsDto {
	@IsOptional()
	@IsNumber()
	@Min(1, { message: 'Daily goal must be at least 1' })
	dailyGoal?: number

	@IsOptional()
	@IsEnum(['ml', 'oz'], { message: 'Unit must be either ml or oz' })
	unit?: string
}
