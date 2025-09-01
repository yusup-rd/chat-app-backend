import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto, LoginUserDto } from './user.dto';
import { AuthService } from '../auth/auth.service';

@Controller('api')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.userService.register(dto);
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
}
