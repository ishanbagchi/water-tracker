import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from './schemas'
import { UpdateSettingsDto } from './dto'

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
}
