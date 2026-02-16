import { IsNumber, Max, Min } from 'class-validator'

export class LogWaterDto {
	@IsNumber()
	@Min(1, { message: 'Amount must be at least 1' })
	@Max(10_000, { message: 'Amount must be at most 10,000' })
	amount: number
}
