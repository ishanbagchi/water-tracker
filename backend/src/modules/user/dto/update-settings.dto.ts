import {
	IsEnum,
	IsNumber,
	IsOptional,
	IsInt,
	IsString,
	Min,
	Max,
	IsArray,
	ArrayMinSize,
	ArrayMaxSize,
} from 'class-validator'

export class UpdateSettingsDto {
	@IsOptional()
	@IsNumber()
	@Min(1, { message: 'Daily goal must be at least 1' })
	dailyGoal?: number

	@IsOptional()
	@IsEnum(['ml', 'oz'], { message: 'Unit must be either ml or oz' })
	unit?: string

	@IsOptional()
	@IsArray()
	@ArrayMinSize(1, { message: 'At least one quick-add amount is required' })
	@ArrayMaxSize(5, { message: 'Maximum 5 quick-add amounts allowed' })
	@IsNumber({}, { each: true })
	@Min(1, { each: true, message: 'Each amount must be at least 1' })
	quickAddAmounts?: number[]

	@IsOptional()
	@IsInt({ message: 'Day reset hour must be an integer' })
	@Min(0, { message: 'Day reset hour must be 0-23' })
	@Max(23, { message: 'Day reset hour must be 0-23' })
	dayResetHour?: number

	@IsOptional()
	@IsString()
	timezone?: string
}
