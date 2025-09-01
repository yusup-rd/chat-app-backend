import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.schema';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  createToken(user: User) {
    return this.jwtService.sign({
      sub: user._id,
      username: user.username,
      email: user.email,
    });
  }
}
