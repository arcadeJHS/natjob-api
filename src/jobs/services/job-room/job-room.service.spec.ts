import { Test, TestingModule } from '@nestjs/testing';
import { JobRoomService } from './job-room.service';

describe('JobRoomService', () => {
  let service: JobRoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobRoomService],
    }).compile();

    service = module.get<JobRoomService>(JobRoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
