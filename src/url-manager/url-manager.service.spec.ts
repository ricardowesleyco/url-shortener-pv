import { Test, TestingModule } from '@nestjs/testing';
import { UrlManagerService } from './url-manager.service';

describe('UrlManagerService', () => {
  let service: UrlManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlManagerService],
    }).compile();

    service = module.get<UrlManagerService>(UrlManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
