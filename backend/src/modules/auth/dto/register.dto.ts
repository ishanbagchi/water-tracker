import { IsEmail, IsString, MinLength } from 'class-validator'

export class RegisterDto {
	@IsEmail({}, { message: 'Please provide a valid email' })
	email: string

	@IsString()
	@MinLength(6, { message: 'Password must be at least 6 characters' })
	password: string
}
