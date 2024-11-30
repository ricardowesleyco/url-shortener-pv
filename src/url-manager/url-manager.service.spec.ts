import { Test, TestingModule } from '@nestjs/testing';
import { UrlManagerService } from './url-manager.service';
import { ShortUrlEntity } from './entities/short-url.entity';
import { Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateUrlManagerDto } from './dto/update-short-url.dto';
import { mockShortUrl, mockShortUrls } from './__mocks__/url-manager.mocks';

describe('UrlManagerService', () => {
  let service: UrlManagerService;
  let shortUrlRepository: jest.Mocked<Partial<Repository<ShortUrlEntity>>>;

  beforeEach(async () => {
    shortUrlRepository = {
      findOneBy: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlManagerService,
        {
          provide: getRepositoryToken(ShortUrlEntity),
          useValue: shortUrlRepository,
        },
      ],
    }).compile();

    service = module.get<UrlManagerService>(UrlManagerService);
  });

  describe('FindOne', () => {
    it('should return origin URL if ShortUrl is found and active', async () => {
      const mockUrlEntity = mockShortUrl;
      shortUrlRepository.findOneBy.mockResolvedValue(mockUrlEntity);

      jest
        .spyOn(service as any, 'incrementCounter')
        .mockResolvedValue(undefined);

      const result = await service.findOne('abc123');

      expect(result).toEqual({ originUrl: 'https://example.com' });
      expect(shortUrlRepository.findOneBy).toHaveBeenCalledWith({
        short: 'abc123',
        isActive: true,
      });
      expect(service['incrementCounter']).toHaveBeenCalledWith(mockUrlEntity);
    });

    it('should throw a NotFoundException if no ShortUrl is found', async () => {
      shortUrlRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(shortUrlRepository.findOneBy).toHaveBeenCalledWith({
        short: 'nonexistent',
        isActive: true,
      });
    });

    it('should call incrementCounter ir ShortUrl is found', async () => {
      const mockUrlEntity = mockShortUrl;
      shortUrlRepository.findOneBy.mockResolvedValue(mockUrlEntity);

      const incrementCounterSpy = jest
        .spyOn(service as any, 'incrementCounter')
        .mockResolvedValue(undefined);

      await service.findOne('abc123');

      expect(incrementCounterSpy).toHaveBeenCalledWith(mockUrlEntity);
    });
  });

  describe('FindAll', () => {
    it('should return an array of ShortUrlEntity for a valid userId', async () => {
      const expectedUserId = 1;
      const expectedShortUrls = mockShortUrls;

      shortUrlRepository.find.mockResolvedValueOnce(expectedShortUrls);

      const shortUrls = await service.findAll(expectedUserId);

      expect(shortUrls).toEqual(expectedShortUrls);
      expect(shortUrlRepository.find).toHaveBeenCalledWith({
        select: ['origin', 'short', 'count', 'createdAt', 'updatedAt'],
        where: { userId: expectedUserId, isActive: true },
      });
    });

    it('should throw a NotFoundException if no ShortUrl is found', async () => {
      const userId = 10;
      shortUrlRepository.find.mockResolvedValueOnce([]);

      await expect(service.findAll(userId)).rejects.toThrow(NotFoundException);
      expect(shortUrlRepository.find).toHaveBeenCalled();
    });
  });

  describe('Update', () => {
    it('should update origin url successfully', async () => {
      const shortUrl = 'abc123';
      const newUrl = 'https://updated.com';
      const updateDto: UpdateUrlManagerDto = { newUrl };
      const mockUrlEntity = {
        id: 99,
        short: 'abc123',
        origin: 'https://example.com',
        isActive: true,
        count: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      shortUrlRepository.findOneBy.mockResolvedValueOnce(mockUrlEntity);
      shortUrlRepository.update.mockResolvedValueOnce(new UpdateResult());

      const response = await service.update(shortUrl, updateDto);

      expect(response).toEqual({ message: 'Origin Url updated' });
      expect(shortUrlRepository.findOneBy).toHaveBeenCalledWith({
        short: shortUrl,
        isActive: true,
      });
      expect(shortUrlRepository.update).toHaveBeenCalledWith(mockUrlEntity.id, {
        origin: newUrl,
      });
    });

    it('should throw NotFoundException if no ShortUrl is found', async () => {
      const shortUrl = 'invalid';
      const updateDto: UpdateUrlManagerDto = { newUrl: 'https://updated.com' };
      shortUrlRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(service.update(shortUrl, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(shortUrlRepository.findOneBy).toHaveBeenCalled();
    });

    it('should throw ConflictException on update error', async () => {
      const shortUrl = 'abc123';
      const updateDto: UpdateUrlManagerDto = { newUrl: 'https://updated.com' };
      const mockUrlEntity = mockShortUrl;
      const mockError = new Error('Database error');

      shortUrlRepository.findOneBy.mockResolvedValueOnce(mockUrlEntity);
      shortUrlRepository.update.mockRejectedValueOnce(mockError);

      await expect(service.update(shortUrl, updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(shortUrlRepository.update).toHaveBeenCalledWith(mockUrlEntity.id, {
        origin: updateDto.newUrl,
      });
    });
  });

  describe('Remove', () => {
    it('should mark url as inactive successfully', async () => {
      const shortUrl = 'abc123';
      const mockUrlEntity = mockShortUrl;
      const now = new Date();

      shortUrlRepository.findOneBy.mockResolvedValueOnce(mockUrlEntity);
      shortUrlRepository.update.mockResolvedValueOnce(new UpdateResult());

      const response = await service.remove(shortUrl);

      expect(response).toEqual({ message: 'Url removed' });
      expect(shortUrlRepository.findOneBy).toHaveBeenCalledWith({
        short: shortUrl,
        isActive: true,
      });
      expect(shortUrlRepository.update).toHaveBeenCalledWith(mockUrlEntity.id, {
        isActive: false,
        deletedAt: now,
      });
    });

    it('should throw NotFoundException if no ShortUrl is found', async () => {
      const shortUrl = 'invalid';
      shortUrlRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(service.remove(shortUrl)).rejects.toThrowError(
        NotFoundException,
      );
      expect(shortUrlRepository.findOneBy).toHaveBeenCalled();
    });

    it('should throw ConflictException on update error', async () => {
      const shortUrl = 'abc123';
      const mockUrlEntity = mockShortUrl;
      const mockError = new Error('Database error');

      shortUrlRepository.findOneBy.mockResolvedValueOnce(mockUrlEntity);
      shortUrlRepository.update.mockRejectedValueOnce(mockError);

      await expect(service.remove(shortUrl)).rejects.toThrow(ConflictException);
      expect(shortUrlRepository.update).toHaveBeenCalledWith(
        mockUrlEntity.id,
        expect.objectContaining({ isActive: false }),
      );
    });
  });
});
