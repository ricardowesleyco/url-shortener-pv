import { UserEntity } from '../entities/user.entity';

export const mockUser: UserEntity = {
  id: 1,
  password: 'hashedPassword',
  email: 'test@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
};
