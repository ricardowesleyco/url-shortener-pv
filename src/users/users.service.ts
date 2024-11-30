import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (
      await this.usersRepository.exists({
        where: { email: createUserDto.email },
      })
    ) {
      throw new ConflictException('E-mail already in use');
    }

    createUserDto.password = await bcrypt
      .hash(createUserDto.password, 10)
      .then((hash) => {
        return hash;
      });

    try {
      const schema = await this.usersRepository.create(createUserDto);
      const entityResult = await this.usersRepository.save(schema);

      return { message: 'User created.' };
    } catch (error) {
      const errorMessage = error.message || 'Internal Error';
      throw new ConflictException(errorMessage);
    }
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async getByUserId(id: number) {
    return await this.usersRepository.findOneBy({ id });
  }
}
