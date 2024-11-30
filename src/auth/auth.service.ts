import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async login(data: LoginAuthDto) {
    const user = await this.userService.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('User not found!');
    }

    if (!(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('E-mail invalid or password invalid');
    }

    return { Token: await this.jwtService.signAsync({ user: user.id }) };
  }
}
