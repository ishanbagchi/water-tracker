import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { User, UserDocument } from './schemas'
import { UpdateSettingsDto, ChangePasswordDto } from './dto'

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
	) {}

	/** Find a user by their MongoDB _id. */
	async findById(id: string): Promise<UserDocument> {
		const user = await this.userModel.findById(id).select('-password')
		if (!user) throw new NotFoundException('User not found')
		return user
	}

	/** Find a user by email (used during auth). */
	async findByEmail(email: string): Promise<UserDocument | null> {
		return this.userModel.findOne({ email })
	}

	/** Create a new user document. */
	async create(email: string, hashedPassword: string): Promise<UserDocument> {
		return this.userModel.create({ email, password: hashedPassword })
	}

	/** Find or create a user from Google OAuth profile. */
	async findOrCreateGoogleUser(
		googleId: string,
		email: string,
	): Promise<UserDocument> {
		// Check if user already linked with this Google ID
		let user = await this.userModel.findOne({ googleId })
		if (user) return user

		// Check if user exists by email (link Google to existing account)
		user = await this.userModel.findOne({ email })
		if (user) {
			user.googleId = googleId
			await user.save()
			return user
		}

		// Create a brand-new Google user (no password)
		return this.userModel.create({ email, googleId })
	}

	/** Update hydration goal / unit preference. */
	async updateSettings(
		userId: string,
		dto: UpdateSettingsDto,
	): Promise<UserDocument> {
		const user = await this.userModel
			.findByIdAndUpdate(userId, { $set: dto }, { new: true })
			.select('-password')
		if (!user) throw new NotFoundException('User not found')
		return user
	}

	/** Change the user's password after verifying current password. */
	async changePassword(
		userId: string,
		dto: ChangePasswordDto,
	): Promise<void> {
		const user = await this.userModel.findById(userId)
		if (!user) throw new NotFoundException('User not found')

		const isValid = await bcrypt.compare(dto.currentPassword, user.password)
		if (!isValid) {
			throw new UnauthorizedException('Current password is incorrect')
		}

		user.password = await bcrypt.hash(dto.newPassword, 10)
		await user.save()
	}
}
