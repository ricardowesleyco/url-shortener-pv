import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { mockUser } from './__mocks__/user.mocks';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: jest.Mocked<Partial<Repository<UserEntity>>>;

  beforeEach(async () => {
    usersRepository = {
      exists: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useValue: usersRepository },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should throw a ConflictException if email already in use', async () => {
      usersRepository.exists.mockResolvedValue(true);

      await expect(
        usersService.create({ email: 'test@example.com', password: '123456' }),
      ).rejects.toThrow(ConflictException);

      expect(usersRepository.exists).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should create a new user if email is not already in use', async () => {
      usersRepository.exists.mockResolvedValue(false);
      usersRepository.create.mockReturnValue({
        email: 'test@example.com',
        password: 'hashedPassword',
      } as UserEntity);
      usersRepository.save.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      const result = await usersService.create({
        email: 'test@example.com',
        password: '123456',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(usersRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      expect(usersRepository.save).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      expect(result).toEqual({ message: 'User created.' });
    });

    it('should throw a ConflictException if internal error', async () => {
      usersRepository.exists.mockResolvedValue(false);
      usersRepository.create.mockReturnValue({} as UserEntity);
      usersRepository.save.mockRejectedValue(new Error('Unexpected error'));

      await expect(
        usersService.create({ email: 'test@example.com', password: '123456' }),
      ).rejects.toThrow(ConflictException);

      expect(usersRepository.save).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return user if email is found', async () => {
      const userMock = mockUser;

      usersRepository.findOneBy.mockResolvedValue(userMock);

      const result = await usersService.findByEmail('test@example.com');

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(result).toEqual(userMock);
    });

    it('should return null if no user is found by email', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);

      const result = await usersService.findByEmail('notfound@example.com');

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        email: 'notfound@example.com',
      });
      expect(result).toBeNull();
    });
  });

  describe('getByUserId', () => {
    it('should return user if ID is found', async () => {
      const userMock = mockUser;

      usersRepository.findOneBy.mockResolvedValue(userMock);

      const result = await usersService.getByUserId(1);

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(userMock);
    });

    it('should return null if no user is found by ID', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);

      const result = await usersService.getByUserId(999);

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(result).toBeNull();
    });
  });
});
