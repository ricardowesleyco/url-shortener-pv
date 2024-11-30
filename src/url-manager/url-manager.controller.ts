import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { UrlManagerService } from './url-manager.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UpdateUrlManagerDto } from './dto/update-short-url.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { Response } from 'express';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@Controller('')
export class UrlManagerController {
  constructor(private readonly urlManagerService: UrlManagerService) {}

  @Public()
  @Post()
  @ApiResponse({
    status: 201,
    description: 'Success.',
    example: { shortUrl: 'string' },
  })
  @ApiResponse({ status: 409, description: 'Try again later.' })
  async create(
    @GetUser() user,
    @Body() createUrlManagerDto: CreateShortUrlDto,
  ) {
    return await this.urlManagerService.create(createUrlManagerDto, user);
  }

  @Get('all')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    example: [
      {
        origin: 'string',
        short: 'string',
        count: 'integer',
        createdAt: 'Date',
        updatedAt: 'Date',
      },
      {
        origin: 'string',
        short: 'string',
        count: 'integer',
        createdAt: 'Date',
        updatedAt: 'Date',
      },
    ],
  })
  @ApiResponse({ status: 404, description: 'Not found.' })
  findAll(@GetUser() user) {
    return this.urlManagerService.findAll(user.id);
  }

  @Public()
  @Get(':url')
  @ApiResponse({ status: 303 })
  @ApiResponse({ status: 404, description: 'Not found.' })
  async findOne(@Param('url') url: string, @Res() response: Response) {
    const shortUrl = await this.urlManagerService.findOne(url);
    response.redirect(303, shortUrl.originUrl);
    // return { origin: shortUrl.originUrl };
  }

  @Patch(':url')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, example: { message: `Origin Url updated` } })
  @ApiResponse({ status: 404, description: 'Not found.' })
  async update(
    @GetUser() user,
    @Param('url') url: string,
    @Body() updateUrlManagerDto: UpdateUrlManagerDto,
  ) {
    return await this.urlManagerService.update(url, updateUrlManagerDto);
  }

  @Delete(':url')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, example: { message: `Url removed` } })
  @ApiResponse({ status: 404, description: 'Not found.' })
  remove(@GetUser() user, @Param('url') url: string) {
    return this.urlManagerService.remove(url);
  }
}
