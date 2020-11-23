import { Test, TestingModule } from '@nestjs/testing';
import { CorriereLavoroService } from './corriere-lavoro.service';

describe('CorriereLavoroService', () => {
  let service: CorriereLavoroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorriereLavoroService],
    }).compile();

    service = module.get<CorriereLavoroService>(CorriereLavoroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
