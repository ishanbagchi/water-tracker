import {
	Injectable,
	ConflictException,
	UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UserService } from '../user/user.service'
import { RegisterDto, LoginDto } from './dto'

@Injectable()
export class AuthService {
	private readonly SALT_ROUNDS = 10

	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	/** Register a new user and return a signed JWT. */
	async register(dto: RegisterDto) {
		const existingUser = await this.userService.findByEmail(dto.email)
		if (existingUser) {
			throw new ConflictException('Email already registered')
		}

		const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS)
		const user = await this.userService.create(dto.email, hashedPassword)

		return this.buildAuthResponse(user.id, user.email)
	}

	/** Validate credentials and return a signed JWT. */
	async login(dto: LoginDto) {
		const user = await this.userService.findByEmail(dto.email)
		if (!user) {
			throw new UnauthorizedException('Invalid credentials')
		}

		const passwordValid = await bcrypt.compare(dto.password, user.password)
		if (!passwordValid) {
			throw new UnauthorizedException('Invalid credentials')
		}

		return this.buildAuthResponse(user.id, user.email)
	}

	/** Helper: create the JWT payload and sign it. */
	private buildAuthResponse(userId: string, email: string) {
		const payload = { sub: userId, email }
		return {
			accessToken: this.jwtService.sign(payload),
			user: { id: userId, email },
		}
	}
}
