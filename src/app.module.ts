import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UrlManagerModule } from './url-manager/url-manager.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import 'dotenv/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_URL,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASENAME,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      migrations: [`${__dirname}/migration/*{.ts,.js}`],
      migrationsRun: true,
      schema: process.env.SCHEMA ? process.env.SCHEMA : 'public',
    }),
    AuthModule,
    UsersModule,
    UrlManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
