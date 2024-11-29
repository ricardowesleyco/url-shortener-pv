import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UrlManagerService } from './url-manager.service';
import { UrlManagerController } from './url-manager.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortUrlEntity } from './entities/short-url.entity';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[
    UsersModule,
    TypeOrmModule.forFeature([
      ShortUrlEntity
    ])
  ],
  controllers: [UrlManagerController],
  providers: [UrlManagerService],
})
export class UrlManagerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
