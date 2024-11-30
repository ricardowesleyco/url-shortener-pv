import { ShortUrlEntity } from '../entities/short-url.entity';

export const mockShortUrl: ShortUrlEntity = {
  id: 99,
  short: 'abc123',
  origin: 'https://example.com',
  isActive: true,
  count: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockShortUrls: ShortUrlEntity[] = [
  {
    id: 99,
    short: 'abc123',
    origin: 'https://example.com',
    isActive: true,
    count: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 1,
  },
  {
    id: 100,
    short: 'def456',
    origin: 'https://google.com',
    isActive: true,
    count: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: null,
  },
];
