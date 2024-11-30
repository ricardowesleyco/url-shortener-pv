import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUrlManagerDto } from './dto/update-short-url.dto';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { nanoid } from 'nanoid';
import { InjectRepository } from '@nestjs/typeorm';
import { ShortUrlEntity } from './entities/short-url.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class UrlManagerService {
  constructor(
    @InjectRepository(ShortUrlEntity)
    private shortUrlRepository: Repository<ShortUrlEntity>,
  ) {}

  async create(
    data: CreateShortUrlDto,
    user?: UserEntity,
  ): Promise<{ shortUrl: string }> {
    const BaseApiURL: string = process.env.BASE_API_URL ?? 'localhost:3000';
    // const BaseApiPort: string = process.env.PORT ?? '3000';
    const BaseApiPrefix: string = process.env.BASE_API_PREFIX ?? 'api/v1';

    //Utils
    const APIURL: string = `${BaseApiURL}/${BaseApiPrefix}`;

    const shortUrl: string = nanoid(6);

    const userId = user ? user.id : null;
    try {
      const schema = await this.shortUrlRepository.create({
        origin: data.url,
        short: `${APIURL}/${shortUrl}`,
        userId: userId,
      });

      const entityResult = await this.shortUrlRepository.save(schema);

      return { shortUrl: entityResult.short };
    } catch (error) {
      const errorMessage = error.message || 'Try again later.';
      throw new ConflictException(errorMessage);
    }
  }

  async findAll(userId: number): Promise<ShortUrlEntity[]> {
    const urls = await this.shortUrlRepository.find({
      select: ['origin', 'short', 'count', 'createdAt', 'updatedAt'],
      where: { userId: userId, isActive: true },
    });
    if (!urls || urls.length < 1) {
      throw new NotFoundException();
    }
    return urls;
  }

  async findOne(url: string): Promise<{ originUrl: string }> {
    const urlEntity = await this.shortUrlRepository.findOneBy({
      short: url,
      isActive: true,
    });
    if (!urlEntity) {
      throw new NotFoundException();
    }

    await this.incrementCounter(urlEntity);

    return { originUrl: urlEntity.origin };
  }

  async update(url: string, updateUrlManagerDto: UpdateUrlManagerDto) {
    const urlEntity = await this.shortUrlRepository.findOneBy({
      short: url,
      isActive: true,
    });

    if (!urlEntity) {
      throw new NotFoundException();
    }
    try {
      await this.shortUrlRepository.update(urlEntity.id, {
        origin: updateUrlManagerDto.newUrl,
      });
    } catch (error) {
      const errorMessage = error.message || 'Try again later.';
      throw new ConflictException(errorMessage);
    }
    return { message: `Origin Url updated` };
  }

  async remove(url: string) {
    const urlEntity = await this.shortUrlRepository.findOneBy({
      short: url,
      isActive: true,
    });

    if (!urlEntity) {
      throw new NotFoundException();
    }
    try {
      const now = new Date();
      await this.shortUrlRepository.update(urlEntity.id, {
        isActive: false,
        deletedAt: now,
      });
    } catch (error) {
      const errorMessage = error.message || 'Internal Error';
      throw new ConflictException(errorMessage);
    }
    return { message: `Url removed` };
  }

  async incrementCounter(data: ShortUrlEntity) {
    data.count += 1;
    await this.shortUrlRepository.update(data.id, data);
  }
}
