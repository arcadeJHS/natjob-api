import { Test, TestingModule } from '@nestjs/testing';
import { TuttojobService } from './tuttojob.service';

describe('TuttojobService', () => {
  let service: TuttojobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TuttojobService],
    }).compile();

    service = module.get<TuttojobService>(TuttojobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
