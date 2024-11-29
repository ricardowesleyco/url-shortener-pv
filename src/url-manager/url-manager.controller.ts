import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UrlManagerService } from './url-manager.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UpdateUrlManagerDto } from './dto/update-short-url.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';

@Controller('')
export class UrlManagerController {
  constructor(private readonly urlManagerService: UrlManagerService) {}

  @Public()
  @Post()
  async create(
    @GetUser() user,
    @Body() createUrlManagerDto: CreateShortUrlDto) {
    return await this.urlManagerService.create(createUrlManagerDto,user);
  }

  @Get('all')
  findAll(
    @GetUser() user,
  ) {
    return this.urlManagerService.findAll(user.id);
  }

  @Public()
  @Get(':url')
  async findOne(
    @Param('url') url: string) {
      return await this.urlManagerService.findOne(url);
  }

  @Patch(':url')
  async update(
    @GetUser() user,
    @Param('url') url: string, 
    @Body() updateUrlManagerDto: UpdateUrlManagerDto) {
      return await this.urlManagerService.update(url, updateUrlManagerDto);
  }

  @Delete(':url')
  remove(
    @GetUser() user,
    @Param('url') url: string) {
    return this.urlManagerService.remove(url);
  }
}
