import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import {
  RegisterUserDto,
  LoginUserDto,
  UpdateProfileDto,
  CreateProfileDto,
} from './user.dto';
import { User } from './user.schema';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async register(dto: RegisterUserDto): Promise<User> {
    const existing = await this.userModel.findOne({
      $or: [{ email: dto.email }, { username: dto.username }],
    });
    if (existing)
      throw new ConflictException('Email or username already exists');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({ ...dto, password: hash });
    return user.save();
  }

  async validateUser(loginDto: LoginUserDto): Promise<User> {
    const user = await this.userModel.findOne({
      $or: [
        { email: loginDto.usernameOrEmail },
        { username: loginDto.usernameOrEmail },
      ],
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async getProfile(user: any) {
    const userDoc = await this.userModel
      .findById(user.userId)
      .select('-password');
    if (!userDoc) throw new NotFoundException('Profile not found');

    return {
      id: userDoc._id,
      username: userDoc.username,
      email: userDoc.email,
      name: userDoc.name || '',
      gender: userDoc.gender || '',
      dob: userDoc.dob || '',
      height: userDoc.height || null,
      weight: userDoc.weight || null,
      interests: userDoc.interests || [],
      avatar: userDoc.avatar || '',
    };
  }

  async createProfile(userId: string, profileData: CreateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, profileData);
    await user.save();
    return { message: 'Profile has been created' };
  }

  async updateProfile(userId: string, profileData: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, profileData);
    await user.save();
    return { message: 'Profile has been updated' };
  }
}
