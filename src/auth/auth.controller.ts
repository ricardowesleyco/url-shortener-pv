import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Public } from './decorators/public.decorator';
import { ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('')
  @ApiResponse({
    status: 201,
    description: 'Success.',
    example: { message: 'User created.' },
  })
  @ApiResponse({
    status: 401,
    example: {
      message: ['password should not be empty', 'password must be a string'],
    },
  })
  @ApiResponse({
    status: 401,
    example: {
      message: 'E-mail invalid or password invalid',
    },
  })
  create(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }
}
