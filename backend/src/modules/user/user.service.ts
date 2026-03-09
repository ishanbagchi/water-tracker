import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { User, UserDocument, Setting, SettingDocument } from './schemas'
import { UpdateSettingsDto, ChangePasswordDto } from './dto'
import { UserProfile, SettingFields } from './interfaces'

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		@InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
	) { }

	/** Find a user by their MongoDB _id. */
	async findById(id: string): Promise<UserProfile> {
		const user = await this.userModel.findById(id).select('-password').lean()
		if (!user) throw new NotFoundException('User not found')
		const settings = await this.settingModel.findOne({ userId: id }).lean()

		if (settings) {
			const { _id, userId, createdAt, updatedAt, __v, ...settingFields } = settings as unknown as SettingFields
			return { ...user, ...settingFields }
		}

		return user
	}

	/** Find a user by email (used during auth). */
	async findByEmail(email: string): Promise<UserDocument | null> {
		return this.userModel.findOne({ email })
	}

	/** Create a new user document. */
	async create(email: string, hashedPassword: string): Promise<UserDocument> {
		const user = await this.userModel.create({ email, password: hashedPassword })
		await this.settingModel.create({ userId: user._id })
		return user
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
		user = await this.userModel.create({ email, googleId })
		await this.settingModel.create({ userId: user._id })
		return user
	}

	/** Update hydration goal / unit preference. */
	async updateSettings(
		userId: string,
		dto: UpdateSettingsDto,
	): Promise<SettingDocument> {
		const settings = await this.settingModel
			.findOneAndUpdate({ userId }, { $set: dto }, { new: true, upsert: true })
		return settings
	}

	/** Get settings by user ID. */
	async getSettings(userId: string): Promise<SettingDocument> {
		const settings = await this.settingModel.findOne({ userId })
		if (!settings) throw new NotFoundException('Settings not found')
		return settings
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
