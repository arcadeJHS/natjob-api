import { Test, TestingModule } from '@nestjs/testing';
import { CarrieraChService } from './carriera-ch.service';

describe('CarrieraChService', () => {
  let service: CarrieraChService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarrieraChService],
    }).compile();

    service = module.get<CarrieraChService>(CarrieraChService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
