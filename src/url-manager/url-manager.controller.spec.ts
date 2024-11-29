import { Test, TestingModule } from '@nestjs/testing';
import { UrlManagerController } from './url-manager.controller';
import { UrlManagerService } from './url-manager.service';

describe('UrlManagerController', () => {
  let controller: UrlManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlManagerController],
      providers: [UrlManagerService],
    }).compile();

    controller = module.get<UrlManagerController>(UrlManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
