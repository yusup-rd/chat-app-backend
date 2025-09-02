import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  RegisterUserDto,
  LoginUserDto,
  CreateProfileDto,
  UpdateProfileDto,
} from './user.dto';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { User as UserDecorator } from '../auth/user.decorator';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.userService.register(dto);
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    const user = await this.userService.validateUser(dto);
    const token = this.authService.createToken(user);
    return {
      token,
      user: { id: user._id, username: user.username, email: user.email },
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getProfile')
  async getProfile(@Req() req) {
    return this.userService.getProfile(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('createProfile')
  async createProfile(
    @UserDecorator('userId') userId: string,
    @Body() dto: CreateProfileDto,
  ) {
    return this.userService.createProfile(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('updateProfile')
  async updateProfile(
    @UserDecorator('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, dto);
  }
}
