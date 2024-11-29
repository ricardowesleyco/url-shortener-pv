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
    private usersRepository : Repository<UserEntity>
  ){}

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
      const schema = await this.usersRepository.create(createUserDto)
      const entityResult = await this.usersRepository.save(schema)
      
      return {message:'User created.'}

    } catch (error) {
      console.log({error})
      // REVIEW Message
      const errorMessage = error.message || 'Internal Error'
      throw new ConflictException(errorMessage)
      // REVIEW LOGGER
    }
      
  }

  findAll() {
    return `This action returns all users`;
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOneBy({email})
  }

  async getByUserId(id: number) {
    return await this.usersRepository.findOneBy({id})
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
