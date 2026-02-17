import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'

export interface JwtPayload {
	sub: string
	email: string
}

const cookieExtractor = (req: Request) => {
	return req?.cookies?.ht_token || null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(config: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				cookieExtractor,
				ExtractJwt.fromAuthHeaderAsBearerToken(),
			]),
			ignoreExpiration: false,
			secretOrKey: config.get<string>('JWT_SECRET', 'default-secret'),
		} as any)
	}

	/** Passport automatically attaches the return value to `req.user`. */
	validate(payload: JwtPayload) {
		return { sub: payload.sub, email: payload.email }
	}
}
