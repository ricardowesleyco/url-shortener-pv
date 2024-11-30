import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { mockUser } from '../users/__mocks__/user.mocks';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    userService = {
      findByEmail: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should throw a UnauthorizedException if no User is found', async () => {
    userService.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'test@example.com', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);

    expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should throw a UnauthorizedException if wrong password ', async () => {
    const userMock = mockUser;
    userService.findByEmail.mockResolvedValue(userMock);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrongPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'wrongPassword',
      'hashedPassword',
    );
  });

  it('should return a valid token if login is successful', async () => {
    const userMock = mockUser;
    const tokenMock = 'validToken';
    userService.findByEmail.mockResolvedValue(userMock);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue(tokenMock);

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual({ Token: tokenMock });
    expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'password123',
      'hashedPassword',
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      user: userMock.id,
    });
  });
});
