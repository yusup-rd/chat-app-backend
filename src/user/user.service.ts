import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { RegisterUserDto, LoginUserDto } from './user.dto';
import { User } from './user.schema';

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
}
